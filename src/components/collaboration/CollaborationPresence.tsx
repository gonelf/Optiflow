/**
 * Collaboration Presence Component
 * Shows active users and their cursors in real-time
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { getPusherClient, getPageChannel, CollaborationEvents } from '@/services/collaboration/pusher.service';
import { User } from 'lucide-react';

interface CollaboratorUser {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  color: string;
  isActive: boolean;
  cursorX: number | null;
  cursorY: number | null;
  selectedComponentId: string | null;
}

interface CollaborationPresenceProps {
  pageId: string;
  currentUserId: string;
}

export function CollaborationPresence({
  pageId,
  currentUserId,
}: CollaborationPresenceProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());


  const joinSession = useCallback(async () => {
    try {
      const response = await fetch('/api/collaboration/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to join session');
      }

      const data = await response.json();
      setCollaborators(data.collaborators.filter((c: CollaboratorUser) => c.userId !== currentUserId));
    } catch (error) {
      console.error('Error joining session:', error);
    }
  }, [pageId, currentUserId]);

  const leaveSession = useCallback(async () => {
    try {
      await fetch('/api/collaboration/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId }),
      });
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, [pageId]);

  const handleUserJoined = useCallback((user: CollaboratorUser) => {
    if (user.userId === currentUserId) return;

    setCollaborators(prev => {
      const exists = prev.find(c => c.userId === user.userId);
      if (exists) return prev;
      return [...prev, user];
    });
  }, [currentUserId]);

  const handleUserLeft = useCallback((data: { userId: string }) => {
    if (data.userId === currentUserId) return;

    setCollaborators(prev => prev.filter(c => c.userId !== data.userId));
    setCursors(prev => {
      const next = new Map(prev);
      next.delete(data.userId);
      return next;
    });
  }, [currentUserId]);

  const handleCursorMove = useCallback((data: {
    userId: string;
    x: number;
    y: number;
    color: string;
    userName: string;
  }) => {
    if (data.userId === currentUserId) return;

    setCursors(prev => {
      const next = new Map(prev);
      next.set(data.userId, { x: data.x, y: data.y });
      return next;
    });

    // Auto-hide cursor after 5 seconds of inactivity
    setTimeout(() => {
      setCursors(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    }, 5000);
  }, [currentUserId]);

  useEffect(() => {
    // Join collaboration session
    joinSession();

    // Subscribe to Pusher channel
    const pusher = getPusherClient();
    const channel = pusher.subscribe(getPageChannel(pageId));

    // Listen for user events
    channel.bind(CollaborationEvents.USER_JOINED, handleUserJoined);
    channel.bind(CollaborationEvents.USER_LEFT, handleUserLeft);
    channel.bind(CollaborationEvents.CURSOR_MOVE, handleCursorMove);

    // Cleanup
    return () => {
      leaveSession();
      channel.unbind_all();
      pusher.unsubscribe(getPageChannel(pageId));
    };
  }, [pageId, currentUserId, handleCursorMove, handleUserJoined, handleUserLeft, joinSession, leaveSession]);

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <>
      {/* Collaborator Avatars */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {collaborators.length} other{collaborators.length !== 1 ? 's' : ''} editing
          </span>
        </div>

        <div className="flex items-center -space-x-2">
          {collaborators.map(collaborator => (
            <div
              key={collaborator.id}
              className="relative"
              title={collaborator.userName}
            >
              {collaborator.userAvatar ? (
                <div className="w-8 h-8 rounded-full border-2 overflow-hidden bg-gray-100" style={{ borderColor: collaborator.color }}>
                  <NextImage
                    src={collaborator.userAvatar}
                    alt={collaborator.userName}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.userName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Active indicator */}
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: collaborator.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Live Cursors */}
      {Array.from(cursors.entries()).map(([userId, position]) => {
        const collaborator = collaborators.find(c => c.userId === userId);
        if (!collaborator) return null;

        return (
          <div
            key={userId}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {/* Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
            >
              <path
                d="M5.65376 12.3673L8.64544 14.4588L11.8853 9.17832L5.65376 12.3673Z"
                fill={collaborator.color}
              />
              <path
                d="M12.6071 8.81768L9.36720 14.0982L11.7317 15.7669L14.9717 10.4863L12.6071 8.81768Z"
                fill={collaborator.color}
              />
            </svg>

            {/* User name label */}
            <div
              className="absolute top-5 left-5 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.userName}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * Hook to broadcast cursor position
 */
export function useCursorTracking(pageId: string, userId: string, userName: string, color: string) {
  useEffect(() => {
    const pusher = getPusherClient();
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 100); // Throttle to 10 updates per second

      // Broadcast cursor position
      pusher.channel(getPageChannel(pageId))?.trigger('client-cursor-move', {
        userId,
        userName,
        color,
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [pageId, userId, userName, color]);
}
