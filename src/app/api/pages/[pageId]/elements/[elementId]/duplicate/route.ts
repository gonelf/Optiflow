// ============================================================================
// PHASE 8: ELEMENT DUPLICATE API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { duplicateElement, getElementById } from '@/services/element.service';

/**
 * POST /api/pages/[pageId]/elements/[elementId]/duplicate
 * Duplicate an element
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
    const { includeChildren = true } = body;

    const newElementId = await duplicateElement(elementId, includeChildren);
    const newElement = await getElementById(newElementId);

    return NextResponse.json({ element: newElement }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating element:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate element' },
      { status: 500 }
    );
  }
}
