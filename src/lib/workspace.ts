/**
 * Workspace access utilities
 */

import { prisma } from '@/lib/prisma';

export interface WorkspaceAccessResult {
  hasAccess: boolean;
  workspaceId?: string;
  role?: string;
}

/**
 * Verifies that a user has access to a workspace
 * @param userId - The user ID to check
 * @param workspaceSlug - The workspace slug
 * @returns Object with access status, workspaceId, and role
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceSlug: string
): Promise<WorkspaceAccessResult> {
  try {
    // Get workspace by slug
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true },
    });

    if (!workspace) {
      return { hasAccess: false };
    }

    // Check if user is a member of this workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: workspace.id,
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return { hasAccess: false, workspaceId: workspace.id };
    }

    return {
      hasAccess: true,
      workspaceId: workspace.id,
      role: membership.role,
    };
  } catch (error) {
    console.error('Error verifying workspace access:', error);
    return { hasAccess: false };
  }
}

/**
 * Verifies workspace access by workspace ID
 * @param userId - The user ID to check
 * @param workspaceId - The workspace ID
 * @returns Object with access status and role
 */
export async function verifyWorkspaceAccessById(
  userId: string,
  workspaceId: string
): Promise<Omit<WorkspaceAccessResult, 'workspaceId'>> {
  try {
    // Check if user is a member of this workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      role: membership.role,
    };
  } catch (error) {
    console.error('Error verifying workspace access:', error);
    return { hasAccess: false };
  }
}
