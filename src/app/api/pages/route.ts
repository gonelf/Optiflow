import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/pages - List pages for a workspace
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch pages
    const pages = await prisma.page.findMany({
      where: {
        workspaceId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            components: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, title, slug, description } = body;

    if (!workspaceId || !title || !slug) {
      return NextResponse.json(
        { error: 'Workspace ID, title, and slug are required' },
        { status: 400 }
      );
    }

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if slug already exists in workspace
    const existingPage = await prisma.page.findUnique({
      where: {
        workspaceId_slug: {
          workspaceId,
          slug,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        description: description || '',
        workspaceId,
        authorId: session.user.id,
        status: 'DRAFT',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
