import { prisma } from '@/lib/prisma'
// import { Role, PlanType } from '@prisma/client'
type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface CreateWorkspaceInput {
  name: string
  slug: string
  userId: string
}

export interface UpdateWorkspaceInput {
  name?: string
  slug?: string
  domain?: string
  startingPageId?: string | null
}

export class WorkspaceService {
  static async create(data: CreateWorkspaceInput) {
    // Check if slug is already taken
    const existing = await prisma.workspace.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      throw new Error('Workspace slug already taken')
    }

    // Create workspace and add creator as owner
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        plan: 'FREE' as PlanType,
        members: {
          create: {
            userId: data.userId,
            role: 'OWNER' as Role,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    return workspace
  }

  static async findBySlug(slug: string) {
    return prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        startingPage: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    })
  }

  static async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        startingPage: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    })
  }

  static async findUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true, pages: true },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    return memberships.map((m: any) => ({
      ...m.workspace,
      role: m.role,
    }))
  }

  static async update(workspaceId: string, data: UpdateWorkspaceInput) {
    // If slug is being updated, check availability
    if (data.slug) {
      const existing = await prisma.workspace.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: workspaceId },
        },
      })

      if (existing) {
        throw new Error('Workspace slug already taken')
      }
    }

    // If startingPageId is being updated, validate the page belongs to this workspace
    if (data.startingPageId !== undefined && data.startingPageId !== null) {
      const page = await prisma.page.findFirst({
        where: {
          id: data.startingPageId,
          workspaceId: workspaceId,
        },
      })

      if (!page) {
        throw new Error('Page not found or does not belong to this workspace')
      }
    }

    return prisma.workspace.update({
      where: { id: workspaceId },
      data,
      include: {
        startingPage: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })
  }

  static async getStartingPage(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        startingPage: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    })

    return workspace?.startingPage || null
  }

  static async delete(workspaceId: string) {
    return prisma.workspace.delete({
      where: { id: workspaceId },
    })
  }

  static async getUserRole(workspaceId: string, userId: string): Promise<Role | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    })

    return member?.role || null
  }

  static async hasPermission(
    workspaceId: string,
    userId: string,
    requiredRole: Role
  ): Promise<boolean> {
    const roleHierarchy: Record<Role, number> = {
      'VIEWER': 1,
      'MEMBER': 2,
      'ADMIN': 3,
      'OWNER': 4,
    }

    const userRole = await this.getUserRole(workspaceId, userId)
    if (!userRole) return false

    return roleHierarchy[userRole as Role] >= roleHierarchy[requiredRole]
  }
}
