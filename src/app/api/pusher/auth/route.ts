/**
 * Pusher Authentication API
 * POST /api/pusher/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPusherServer } from '@/services/collaboration/pusher.service';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.text();
    const params = new URLSearchParams(body);

    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // TODO: Verify user has access to the channel (page/workspace)
    // Extract pageId from channel name (e.g., "private-page-123")
    // Check if user has access to that page

    // Authenticate with Pusher
    const pusher = getPusherServer();

    // For presence channels
    if (channelName.startsWith('presence-')) {
      const presenceData = {
        user_id: session.user.id,
        user_info: {
          name: session.user.name || 'Anonymous',
          avatar: session.user.image || null,
        },
      };

      const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
      return NextResponse.json(auth);
    }

    // For private channels
    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Error authenticating Pusher:', error);

    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
