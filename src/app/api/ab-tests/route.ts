import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEvenSplit } from '@/services/ab-testing/traffic-splitter.service';

/**
 * GET /api/ab-tests
 * List all A/B tests for a workspace
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceSlug = searchParams.get('workspaceSlug');

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
        { status: 400 }
      );
    }

    // Find workspace and verify access
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      include: {
        members: {
          where: {
            user: { email: session.user.email },
          },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // If _listPages flag is set, return workspace pages instead of tests
    if (searchParams.get('_listPages') === 'true') {
      const pages = await prisma.page.findMany({
        where: { workspaceId: workspace.id },
        select: {
          id: true,
          title: true,
          slug: true,
          updatedAt: true,
          status: true,
          screenshotUrl: true,
          _count: {
            select: { components: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
      });
      return NextResponse.json({ pages });
    }

    // Get all A/B tests for this workspace
    const tests = await prisma.aBTest.findMany({
      where: {
        page: {
          workspaceId: workspace.id,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            impressions: true,
            conversions: true,
            conversionRate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedTests = tests.map((test: any) => ({
      id: test.id,
      name: test.name,
      description: test.description,
      testType: test.testType,
      status: test.status,
      pageId: test.pageId,
      pageName: test.page.title,
      startDate: test.startDate,
      endDate: test.endDate,
      variants: test.variants,
      winningVariantId: test.winningVariantId,
    }));

    return NextResponse.json({ tests: formattedTests });
  } catch (error) {
    console.error('Failed to fetch A/B tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ab-tests
 * Create a new A/B test
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pageId,
      name,
      description,
      testType = 'ELEMENT_TEST',
      primaryGoal,
      conversionEvent,
      minimumSampleSize = 1000,
      confidenceLevel = 0.95,
      variantNames = ['Control', 'Variant A'],
      variantConfigs = [], // For PAGE_REDIRECT: [{ name, redirectUrl }]
    } = body;

    if (!pageId || !name || !primaryGoal || !conversionEvent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate test type specific requirements
    if (testType === 'PAGE_REDIRECT' && variantConfigs.length < 2) {
      return NextResponse.json(
        { error: 'Page redirect tests require at least 2 page variants' },
        { status: 400 }
      );
    }

    // Verify page exists and user has access
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                user: { email: session.user.email },
              },
            },
          },
        },
      },
    });

    if (!page || page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Create A/B test with variants based on test type
    const variantsData = testType === 'PAGE_REDIRECT'
      ? variantConfigs.map((config: any, index: number) => ({
        name: config.name,
        isControl: index === 0,
        pageId: config.pageId || pageId, // Use specified pageId or default to test pageId
        redirectUrl: config.redirectUrl, // URL to redirect to
      }))
      : variantNames.map((variantName: string, index: number) => ({
        name: variantName,
        isControl: index === 0,
        pageId,
        elementChanges: {}, // Will be populated by visual editor
      }));

    const test = await prisma.aBTest.create({
      data: {
        name,
        description,
        pageId,
        testType,
        primaryGoal,
        conversionEvent,
        minimumSampleSize,
        confidenceLevel,
        status: headers().get('x-create-status') === 'DRAFT' ? 'DRAFT' : 'DRAFT', // Always draft initially
        trafficSplit: {}, // Will be set when variants are created
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
      },
    });

    // Handle element cloning for ELEMENT_TEST if requested
    if (testType === 'ELEMENT_TEST' && body.cloneElements) {
      // 1. Get all elements from the original page (control)
      const originalElements = await prisma.element.findMany({
        where: { pageId, variantId: null },
      });

      // 2. Clone elements for each new variant (excluding control)
      const variantsToPopulate = test.variants.filter((v: any) => !v.isControl);

      for (const variant of variantsToPopulate) {
        // Create copies of all elements linked to this variant
        // We need to maintain parent/child relationships, so we map old IDs to new IDs
        const idMap = new Map<string, string>();

        // First pass: Create new IDs for all elements
        originalElements.forEach((el) => {
          // Generate a new ID for the clone
          // We can't use cuid() easily here without a library, so we'll let Prisma generate it
          // OR we can use the createMany approach but we need to update parentIds.
          // For simplicity and correctness with trees, let's do recursive or individual creation.
          // Since we need to remap parentIds, individual or batched with map is needed.
          // Let's rely on the assumption that we can just create them and then update parentIds?
          // No, parentId refers to an EXISTING element.

          // Actually, we can use a transaction or just create them one by one/in batches.
          // But we need the new IDs.
          // Let's assume we can just create them with new IDs if we could generate them, 
          // but Prisma generates CUIDs on DB side usually.

          // Strategy:
          // 1. Map old ID -> New Temp ID (or just rely on the fact we will create new ones)
          // Wait, if we create them, we get new IDs.

          // Let's just create root elements first, then children?
          // Or just copy everything and then update parent IDs?
          // If we copy everything, the `parentId` field will still point to the ORIGINAL element (on the main page).
          // This creates a "shadow DOM" where variant elements might point to main page parents.
          // This MIGHT be okay if the renderer handles it, but usually we want a self-contained tree.

          // Ideally, a variant should be a full independent copy.
          // So we must remap parentIds.
        });

        // Simpler approach:
        // 1. Fetch all original elements
        // 2. Map oldID -> newID (we need to generate CUIDs manually or do create and capture ID)
        // Since we can't easily generate CUIDs in this environment without `cuid` package (which might be available),
        // let's try to just use a deterministic approach or standard loop.

        // We will read the elements, and for each element, we create a copy.
        // But we need to handle the parentId.

        // Let's do a top-down approach?
        // No, elements order doesn't guarantee hierarchy.

        // Let's used a 2-pass approach.
        // Pass 1: Create all elements with `parentId: null` (or temporarily old parentId if we can distinct)
        // AND store the mapping key in a temporary field? No generic field.

        // Better: In-memory map.
        // We need to generate IDs client-side (here server-side) to link them before insertion?
        // Prisma allows setting ID if we want.
        // Let's verify if `cuid` or `uuid` is available.
        // `crypto.randomUUID()` is available in Node 19+ and Vercel Edge.

        const elementMap = new Map<string, string>(); // oldId -> newId
        const newElementsData: any[] = [];

        for (const el of originalElements) {
          // We'll let Prisma generate the ID, but we need to know it to map it.
          // So we have to create them one by one to get the ID? That's slow for many elements.
          // OR we use transaction.

          // If we can't generate IDs, we have to create one by one.
          // Let's try creating one by one for now, optimization later.
          const { id, ...data } = el;
          // We can't prepare the whole tree because we don't know the new IDs yet.
          // This loop will need to happen AFTER we created the elements?
          // No, we can't update parentId if the parent doesn't exist yet (if checking constraints).
          // But parentId is self-referencing in same table, so it should be fine if we insert all?
          // But we are inserting into PostgreSQL, foreign keys must exist.

          // So we must insert PARENTS before CHILDREN.
          // So we should build the tree in memory, then traverse breadth-first (roots first).
        }

        // Build Tree from originalElements
        const buildTree = (elements: any[]) => {
          const roots: any[] = [];
          const map = new Map<string, any>();
          elements.forEach(el => { map.set(el.id, { ...el, children: [] }); });
          elements.forEach(el => {
            if (el.parentId) {
              const parent = map.get(el.parentId);
              if (parent) parent.children.push(map.get(el.id));
            } else {
              roots.push(map.get(el.id));
            }
          });
          return roots;
        };

        const tree = buildTree(originalElements);

        // Recursive copy
        const copyNode = async (node: any, newParentId: string | null) => {
          const { id: oldId, children, ...data } = node;
          // Create the element
          const newElement = await prisma.element.create({
            data: {
              ...data,
              pageId,
              variantId: variant.id,
              parentId: newParentId
            }
          });

          // Process children
          if (children && children.length > 0) {
            for (const child of children) {
              await copyNode(child, newElement.id);
            }
          }
        };

        // Execute copy for all roots
        for (const root of tree) {
          await copyNode(root, null);
        }
      }
    }

    // Update traffic split with even distribution
    const variantIds = test.variants.map((v: any) => v.id);
    const trafficSplit = createEvenSplit(variantIds);

    await prisma.aBTest.update({
      where: { id: test.id },
      data: { trafficSplit },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    console.error('Failed to create A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to create A/B test' },
      { status: 500 }
    );
  }
}
