import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkspaceService } from '@/services/workspace.service'
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
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const workspaces = await WorkspaceService.findUserWorkspaces(session.user.id)

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('Get workspaces error:', error)
    return NextResponse.json({ message: 'Failed to fetch workspaces' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createWorkspaceSchema.parse(body)

    const workspace = await WorkspaceService.create({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.error('Create workspace error:', error)
    return NextResponse.json({ message: 'Failed to create workspace' }, { status: 500 })
  }
}
