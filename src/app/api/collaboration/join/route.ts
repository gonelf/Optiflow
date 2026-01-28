/**
 * Join Collaboration Session API
 * POST /api/collaboration/join
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  joinCollaborationSession,
  getActiveCollaborators,
} from '@/services/collaboration/session.service';
import { z } from 'zod';

const joinSchema = z.object({
  pageId: z.string(),
  socketId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { pageId, socketId } = joinSchema.parse(body);

    // TODO: Verify user has access to this page

    // Join collaboration session
    const collaborationUser = await joinCollaborationSession(
      pageId,
      session.user.id,
      session.user.name || 'Anonymous',
      session.user.image || null,
      socketId
    );

    // Get all active collaborators
    const collaborators = await getActiveCollaborators(pageId);

    return NextResponse.json({
      user: collaborationUser,
      collaborators,
    });
  } catch (error) {
    console.error('Error joining collaboration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to join collaboration session' },
      { status: 500 }
    );
  }
}
