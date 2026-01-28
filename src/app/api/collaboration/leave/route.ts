/**
 * Leave Collaboration Session API
 * POST /api/collaboration/leave
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { leaveCollaborationSession } from '@/services/collaboration/session.service';
import { z } from 'zod';

const leaveSchema = z.object({
  pageId: z.string(),
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
    const { pageId } = leaveSchema.parse(body);

    // Leave collaboration session
    await leaveCollaborationSession(pageId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving collaboration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to leave collaboration session' },
      { status: 500 }
    );
  }
}
