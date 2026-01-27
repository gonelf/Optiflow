/**
 * Pusher Real-time Service
 * Handles WebSocket connections for real-time collaboration
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  return pusherServer;
}

// Client-side Pusher instance
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient can only be called on the client side');
  }

  if (!pusherClient) {
    pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        authEndpoint: '/api/pusher/auth',
        authTransport: 'ajax',
      }
    );
  }
  return pusherClient;
}

// Channel naming conventions
export function getPageChannel(pageId: string): string {
  return `private-page-${pageId}`;
}

export function getWorkspaceChannel(workspaceId: string): string {
  return `private-workspace-${workspaceId}`;
}

// Event types for real-time collaboration
export const CollaborationEvents = {
  // Presence events
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  USER_UPDATED: 'user-updated',

  // Cursor events
  CURSOR_MOVE: 'cursor-move',
  CURSOR_HIDE: 'cursor-hide',

  // Edit events
  COMPONENT_ADDED: 'component-added',
  COMPONENT_UPDATED: 'component-updated',
  COMPONENT_DELETED: 'component-deleted',
  COMPONENT_REORDERED: 'component-reordered',

  // Page events
  PAGE_UPDATED: 'page-updated',
  PAGE_SAVED: 'page-saved',

  // Lock events
  COMPONENT_LOCKED: 'component-locked',
  COMPONENT_UNLOCKED: 'component-unlocked',
} as const;

export type CollaborationEvent = typeof CollaborationEvents[keyof typeof CollaborationEvents];

// Trigger a real-time event
export async function triggerCollaborationEvent(
  pageId: string,
  event: CollaborationEvent,
  data: any
): Promise<void> {
  const pusher = getPusherServer();
  const channel = getPageChannel(pageId);

  await pusher.trigger(channel, event, data);
}

// Trigger batch events
export async function triggerBatchEvents(
  pageId: string,
  events: Array<{ event: CollaborationEvent; data: any }>
): Promise<void> {
  const pusher = getPusherServer();
  const channel = getPageChannel(pageId);

  await pusher.triggerBatch(
    events.map(({ event, data }) => ({
      channel,
      name: event,
      data,
    }))
  );
}

// Get channel presence info
export async function getChannelPresence(pageId: string): Promise<any> {
  const pusher = getPusherServer();
  const channel = getPageChannel(pageId);

  try {
    const info = await pusher.get({ path: `/channels/${channel}` });
    return info;
  } catch (error) {
    console.error('Error fetching channel presence:', error);
    return null;
  }
}
