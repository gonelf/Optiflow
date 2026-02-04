/**
 * Unified API authentication and workspace authorization helper
 * Reduces database queries by combining session + workspace verification
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userCache, workspaceCache, getOrFetch } from '@/lib/server-cache'

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

interface AuthResult {
  authenticated: false
  error: string
  status: 401
}

interface AuthSuccessResult {
  authenticated: true
  user: {
    id: string
    email: string
    name?: string | null
    onboarded: boolean
    systemRole: string
  }
}

interface WorkspaceAuthResult {
  authorized: false
  error: string
  status: 401 | 403
}

interface WorkspaceAuthSuccessResult {
  authorized: true
  user: {
    id: string
    email: string
    name?: string | null
    onboarded: boolean
    systemRole: string
  }
  workspace: {
    id: string
    name: string
    slug: string
  }
  role: Role
}

/**
 * Verify user is authenticated
 * Uses caching to reduce database lookups
 */
export async function verifyAuth(): Promise<AuthResult | AuthSuccessResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      authenticated: false,
      error: 'Unauthorized',
      status: 401,
    }
  }

  return {
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name,
      onboarded: session.user.onboarded,
      systemRole: session.user.systemRole || 'USER',
    },
  }
}

/**
 * Verify user is authenticated AND has access to a workspace
 * Combines both checks in a single cached operation
 */
export async function verifyWorkspaceAuth(
  workspaceId: string,
  requiredRole?: Role
): Promise<WorkspaceAuthResult | WorkspaceAuthSuccessResult> {
  // First verify authentication
  const authResult = await verifyAuth()
  if (!authResult.authenticated) {
    return {
      authorized: false,
      error: authResult.error,
      status: authResult.status,
    }
  }

  const userId = authResult.user.id

  // Check workspace membership with caching
  const cacheKey = `membership:${workspaceId}:${userId}`
  const membership = await getOrFetch(
    workspaceCache,
    cacheKey,
    async () => {
      return prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
        select: {
          role: true,
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })
    },
    60 * 1000 // 1 minute TTL for membership
  )

  if (!membership) {
    return {
      authorized: false,
      error: 'Access denied',
      status: 403,
    }
  }

  // Check role hierarchy if required
  if (requiredRole) {
    const roleHierarchy: Record<Role, number> = {
      VIEWER: 1,
      MEMBER: 2,
      ADMIN: 3,
      OWNER: 4,
    }

    if (roleHierarchy[membership.role as Role] < roleHierarchy[requiredRole]) {
      return {
        authorized: false,
        error: 'Insufficient permissions',
        status: 403,
      }
    }
  }

  return {
    authorized: true,
    user: authResult.user,
    workspace: membership.workspace,
    role: membership.role as Role,
  }
}

/**
 * Verify user is authenticated AND has access to a workspace by slug
 */
export async function verifyWorkspaceAuthBySlug(
  workspaceSlug: string,
  requiredRole?: Role
): Promise<WorkspaceAuthResult | WorkspaceAuthSuccessResult> {
  // First verify authentication
  const authResult = await verifyAuth()
  if (!authResult.authenticated) {
    return {
      authorized: false,
      error: authResult.error,
      status: authResult.status,
    }
  }

  const userId = authResult.user.id

  // Find workspace by slug with caching
  const workspace = await getOrFetch(
    workspaceCache,
    `workspace:slug:${workspaceSlug}`,
    async () => {
      return prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
        select: { id: true, name: true, slug: true },
      })
    },
    2 * 60 * 1000 // 2 minute TTL
  )

  if (!workspace) {
    return {
      authorized: false,
      error: 'Workspace not found',
      status: 403,
    }
  }

  // Now check membership
  return verifyWorkspaceAuth(workspace.id, requiredRole)
}

/**
 * Verify user is a system admin
 */
export async function verifyAdminAuth(): Promise<AuthResult | AuthSuccessResult> {
  const authResult = await verifyAuth()
  if (!authResult.authenticated) {
    return authResult
  }

  if (authResult.user.systemRole !== 'ADMIN') {
    return {
      authenticated: false,
      error: 'Admin access required',
      status: 401,
    }
  }

  return authResult
}
