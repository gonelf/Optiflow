// ============================================================================
// PHASE 8: ELEMENT MOVE API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { moveElement } from '@/services/element.service';

/**
 * POST /api/pages/[pageId]/elements/[elementId]/move
 * Move an element to a new parent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string; elementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { elementId } = params;
    const body = await request.json();
    const { newParentId, newOrder } = body;

    if (newOrder === undefined) {
      return NextResponse.json(
        { error: 'newOrder is required' },
        { status: 400 }
      );
    }

    await moveElement(elementId, newParentId || null, newOrder);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving element:', error);
    return NextResponse.json(
      { error: 'Failed to move element' },
      { status: 500 }
    );
  }
}
