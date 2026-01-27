/**
 * Rollback to Version API
 * POST /api/versions/[pageId]/rollback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rollbackToVersion } from '@/services/version/history.service';
import { z } from 'zod';

const rollbackSchema = z.object({
  versionNumber: z.number().int().positive(),
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
    const { versionNumber } = rollbackSchema.parse(body);

    // TODO: Verify user has ADMIN or OWNER access to this page

    // Rollback to version
    await rollbackToVersion(pageId, versionNumber, session.user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version ${versionNumber}`,
    });
  } catch (error) {
    console.error('Error rolling back version:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to rollback to version' },
      { status: 500 }
    );
  }
}
