/**
 * Page Version History API
 * GET /api/versions/[pageId] - Get version history
 * POST /api/versions/[pageId] - Create new version
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPageVersionHistory,
  createPageVersion,
} from '@/services/version/history.service';
import { z } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pageId } = params;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Verify user has access to this page

    // Get version history
    const versions = await getPageVersionHistory(pageId, limit, offset);

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching version history:', error);

    return NextResponse.json(
      { error: 'Failed to fetch version history' },
      { status: 500 }
    );
  }
}

const createVersionSchema = z.object({
  changeType: z.enum(['MANUAL_SAVE', 'AUTO_SAVE', 'PUBLISHED', 'ROLLBACK', 'COLLABORATION_MERGE']),
  changeSummary: z.string().optional(),
  isRestorePoint: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pageId } = params;

    // Parse request body
    const body = await req.json();
    const { changeType, changeSummary, isRestorePoint } = createVersionSchema.parse(body);

    // TODO: Verify user has access to this page

    // Create version
    const version = await createPageVersion(
      pageId,
      session.user.id,
      changeType,
      changeSummary,
      isRestorePoint
    );

    return NextResponse.json({ version });
  } catch (error) {
    console.error('Error creating version:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
