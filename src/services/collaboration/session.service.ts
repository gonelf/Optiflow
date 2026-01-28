/**
 * Collaboration Session Service
 * Manages active collaboration sessions for pages
 */

import { prisma } from '@/lib/prisma';
import { triggerCollaborationEvent, CollaborationEvents } from './pusher.service';

// User colors for presence indicators
const USER_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export interface CollaborationUser {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  color: string;
  isActive: boolean;
  lastSeenAt: Date;
  cursorX: number | null;
  cursorY: number | null;
  selectedComponentId: string | null;
}

/**
 * Join a collaboration session
 */
export async function joinCollaborationSession(
  pageId: string,
  userId: string,
  userName: string,
  userAvatar: string | null,
  socketId?: string
): Promise<CollaborationUser> {
  // Check if user already has an active session
  const existingSession = await prisma.collaborationSession.findFirst({
    where: {
      pageId,
      userId,
      isActive: true,
    },
  });

  if (existingSession) {
    // Reactivate existing session
    const updated = await prisma.collaborationSession.update({
      where: { id: existingSession.id },
      data: {
        isActive: true,
        lastSeenAt: new Date(),
        socketId,
      },
    });

    const user: CollaborationUser = {
      id: updated.id,
      userId: updated.userId,
      userName: updated.userName,
      userAvatar: updated.userAvatar,
      color: updated.color,
      isActive: updated.isActive,
      lastSeenAt: updated.lastSeenAt,
      cursorX: updated.cursorX,
      cursorY: updated.cursorY,
      selectedComponentId: updated.selectedComponentId,
    };

    // Notify other users
    await triggerCollaborationEvent(pageId, CollaborationEvents.USER_JOINED, user);

    return user;
  }

  // Get all active sessions to assign a unique color
  const activeSessions = await prisma.collaborationSession.findMany({
    where: {
      pageId,
      isActive: true,
    },
    select: { color: true },
  });

  const usedColors = new Set(activeSessions.map((s: { color: string }) => s.color));
  const availableColor = USER_COLORS.find(c => !usedColors.has(c)) || USER_COLORS[0];

  // Create new session
  const session = await prisma.collaborationSession.create({
    data: {
      pageId,
      userId,
      userName,
      userAvatar,
      color: availableColor,
      socketId,
    },
  });

  const user: CollaborationUser = {
    id: session.id,
    userId: session.userId,
    userName: session.userName,
    userAvatar: session.userAvatar,
    color: session.color,
    isActive: session.isActive,
    lastSeenAt: session.lastSeenAt,
    cursorX: session.cursorX,
    cursorY: session.cursorY,
    selectedComponentId: session.selectedComponentId,
  };

  // Notify other users
  await triggerCollaborationEvent(pageId, CollaborationEvents.USER_JOINED, user);

  return user;
}

/**
 * Leave a collaboration session
 */
export async function leaveCollaborationSession(
  pageId: string,
  userId: string
): Promise<void> {
  const session = await prisma.collaborationSession.findFirst({
    where: {
      pageId,
      userId,
      isActive: true,
    },
  });

  if (!session) {
    return;
  }

  await prisma.collaborationSession.update({
    where: { id: session.id },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });

  // Notify other users
  await triggerCollaborationEvent(pageId, CollaborationEvents.USER_LEFT, {
    userId,
    sessionId: session.id,
  });
}

/**
 * Update cursor position
 */
export async function updateCursorPosition(
  sessionId: string,
  pageId: string,
  cursorX: number,
  cursorY: number,
  selectedComponentId: string | null
): Promise<void> {
  await prisma.collaborationSession.update({
    where: { id: sessionId },
    data: {
      cursorX,
      cursorY,
      selectedComponentId,
      lastSeenAt: new Date(),
    },
  });

  // Don't trigger event here - client will handle this for performance
}

/**
 * Get active collaborators for a page
 */
export async function getActiveCollaborators(
  pageId: string
): Promise<CollaborationUser[]> {
  const sessions = await prisma.collaborationSession.findMany({
    where: {
      pageId,
      isActive: true,
    },
    orderBy: {
      startedAt: 'asc',
    },
  });

  return sessions.map((session: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    color: string;
    isActive: boolean;
    lastSeenAt: Date;
    cursorX: number | null;
    cursorY: number | null;
    selectedComponentId: string | null;
  }) => ({
    id: session.id,
    userId: session.userId,
    userName: session.userName,
    userAvatar: session.userAvatar,
    color: session.color,
    isActive: session.isActive,
    lastSeenAt: session.lastSeenAt,
    cursorX: session.cursorX,
    cursorY: session.cursorY,
    selectedComponentId: session.selectedComponentId,
  }));
}

/**
 * Clean up inactive sessions (called periodically)
 */
export async function cleanupInactiveSessions(): Promise<number> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const result = await prisma.collaborationSession.updateMany({
    where: {
      isActive: true,
      lastSeenAt: {
        lt: fifteenMinutesAgo,
      },
    },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Heartbeat to keep session alive
 */
export async function sessionHeartbeat(sessionId: string): Promise<void> {
  await prisma.collaborationSession.update({
    where: { id: sessionId },
    data: {
      lastSeenAt: new Date(),
    },
  });
}
