import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkspaceService } from '@/services/workspace.service'
// import { Role } from '@prisma/client'
type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
import { z } from 'zod'

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  domain: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await WorkspaceService.findById(params.workspaceId)

    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 })
    }

    // Check if user is a member
    const role = await WorkspaceService.getUserRole(params.workspaceId, session.user.id)

    if (!role) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ workspace, role })
  } catch (error) {
    console.error('Get workspace error:', error)
    return NextResponse.json({ message: 'Failed to fetch workspace' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permission
    const hasPermission = await WorkspaceService.hasPermission(
      params.workspaceId,
      session.user.id,
      'ADMIN' as Role
    )

    if (!hasPermission) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updateWorkspaceSchema.parse(body)

    const workspace = await WorkspaceService.update(params.workspaceId, validatedData)

    return NextResponse.json({ workspace })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.error('Update workspace error:', error)
    return NextResponse.json({ message: 'Failed to update workspace' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can delete workspace
    const hasPermission = await WorkspaceService.hasPermission(
      params.workspaceId,
      session.user.id,
      'OWNER' as Role
    )

    if (!hasPermission) {
      return NextResponse.json({ message: 'Only workspace owner can delete' }, { status: 403 })
    }

    await WorkspaceService.delete(params.workspaceId)

    return NextResponse.json({ message: 'Workspace deleted successfully' })
  } catch (error) {
    console.error('Delete workspace error:', error)
    return NextResponse.json({ message: 'Failed to delete workspace' }, { status: 500 })
  }
}
