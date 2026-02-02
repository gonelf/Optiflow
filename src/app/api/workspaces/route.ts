import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkspaceService } from '@/services/workspace.service'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

export async function GET(req: NextRequest) {
  let session: Session | null = null;
  try {
    logger.info('Fetching user workspaces')

    session = await getServerSession(authOptions)

    const userId = session?.user?.id

    if (!userId) {
      logger.warn('Unauthorized workspace access attempt')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    // If slug is provided, fetch specific workspace
    if (slug) {
      logger.info('Fetching workspace by slug', { slug })

      const workspace = await WorkspaceService.findBySlug(slug)

      if (!workspace) {
        return NextResponse.json({ message: 'Workspace not found' }, { status: 404 })
      }

      // Verify user has access
      const hasMembership = workspace.members.some((m: any) => m.userId === userId)
      if (!hasMembership) {
        return NextResponse.json({ message: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({ workspace })
    }

    // Otherwise, fetch all user workspaces
    logger.info('Fetching workspaces for user', { userId })

    const workspaces = await WorkspaceService.findUserWorkspaces(userId)

    logger.info('Workspaces fetched successfully', {
      userId,
      count: workspaces.length,
    })

    return NextResponse.json({ workspaces })
  } catch (error) {
    logger.error('Get workspaces error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      user: session?.user?.id
    })
    return NextResponse.json(
      {
        message: 'Failed to fetch workspaces',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    logger.info('Creating new workspace')

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn('Unauthorized workspace creation attempt')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    logger.debug('Validating workspace data', { body })

    const validatedData = createWorkspaceSchema.parse(body)

    logger.info('Creating workspace', {
      userId: session.user.id,
      name: validatedData.name,
      slug: validatedData.slug,
    })

    const workspace = await WorkspaceService.create({
      ...validatedData,
      userId: session.user.id,
    })

    logger.info('Workspace created successfully', {
      workspaceId: workspace.id,
      slug: workspace.slug,
    })

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Workspace validation error', { errors: error.errors })
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    if (error instanceof Error) {
      logger.error('Workspace creation error', error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    logger.error('Create workspace error', error)
    return NextResponse.json({ message: 'Failed to create workspace' }, { status: 500 })
  }
}
