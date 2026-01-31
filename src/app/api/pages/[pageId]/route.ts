import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteContext {
  params: {
    pageId: string;
  };
}

// GET /api/pages/[pageId] - Get a specific page
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = context.params;

    // Fetch page with components and elements
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        components: {
          orderBy: {
            order: 'asc',
          },
        },
        elements: {
          orderBy: {
            order: 'asc',
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: page.workspaceId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/pages/[pageId] - Update a page
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = context.params;
    const body = await req.json();

    // Fetch page to verify access
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: page.workspaceId,
      },
    });

    if (!membership || (membership.role === 'VIEWER')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Extract update data
    const {
      title,
      slug,
      description,
      seoTitle,
      seoDescription,
      ogImage,
      favicon,
      components,
      elements,
      status,
    } = body;

    // Update page
    const updatedPage = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(favicon !== undefined && { favicon }),
        ...(status !== undefined && { status }),
        // Set publishedAt when publishing, clear it when unpublishing
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
        ...(status === 'DRAFT' && { publishedAt: null }),
      },
    });

    // Update components if provided
    if (components && Array.isArray(components)) {
      // Delete existing components
      await prisma.component.deleteMany({
        where: {
          pageId,
          variantId: null, // Only delete main page components, not variant components
        },
      });

      // Create new components
      if (components.length > 0) {
        await prisma.component.createMany({
          data: components.map((comp: any) => ({
            id: comp.id,
            pageId,
            type: comp.type,
            name: comp.name,
            order: comp.order,
            config: comp.config,
            styles: comp.styles,
            content: comp.content,
          })),
        });
      }
    }

    // Update elements if provided (for AI editor)
    if (elements && Array.isArray(elements)) {
      // Delete existing elements
      await prisma.element.deleteMany({
        where: {
          pageId,
          variantId: null,
        },
      });

      // Create new elements
      if (elements.length > 0) {
        await prisma.element.createMany({
          data: elements.map((el: any) => ({
            id: el.id,
            pageId,
            type: el.type,
            name: el.name,
            order: el.order,
            parentId: el.parentId,
            depth: el.depth,
            path: el.path || '',
            content: el.content,
            styles: el.styles,
            className: el.className,
            variantId: null,
          })),
        });
      }
    }

    // Fetch updated page with components and elements
    const result = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        components: {
          orderBy: {
            order: 'asc',
          },
        },
        elements: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/pages/[pageId] - Delete a page
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = context.params;

    // Fetch page to verify access
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: page.workspaceId,
      },
    });

    if (!membership || (membership.role === 'VIEWER' || membership.role === 'MEMBER')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete page (cascade will delete components, variants, etc.)
    await prisma.page.delete({
      where: {
        id: pageId,
      },
    });

    return NextResponse.json({ message: 'Page deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
