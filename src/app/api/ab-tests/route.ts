import { NextRequest, NextResponse } from 'next/server';
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
      primaryGoal,
      conversionEvent,
      minimumSampleSize = 1000,
      confidenceLevel = 0.95,
      variantNames = ['Control', 'Variant A'],
    } = body;

    if (!pageId || !name || !primaryGoal || !conversionEvent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create A/B test with variants
    const test = await prisma.aBTest.create({
      data: {
        name,
        description,
        pageId,
        primaryGoal,
        conversionEvent,
        minimumSampleSize,
        confidenceLevel,
        status: 'DRAFT',
        trafficSplit: {}, // Will be set when variants are created
        variants: {
          create: variantNames.map((variantName: string, index: number) => ({
            name: variantName,
            isControl: index === 0,
            pageId,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

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
