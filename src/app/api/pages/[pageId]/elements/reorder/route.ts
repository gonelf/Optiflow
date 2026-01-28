// ============================================================================
// PHASE 8: ELEMENTS REORDER API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reorderElements } from '@/services/element.service';

/**
 * POST /api/pages/[pageId]/elements/reorder
 * Reorder multiple elements
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body as { updates: Array<{ id: string; order: number }> };

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates must be an array' },
        { status: 400 }
      );
    }

    await reorderElements(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering elements:', error);
    return NextResponse.json(
      { error: 'Failed to reorder elements' },
      { status: 500 }
    );
  }
}
