// ============================================================================
// PHASE 8: ELEMENT API - GET, PATCH, DELETE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getElementById,
  updateElement,
  deleteElement,
} from '@/services/element.service';
import { UpdateElementRequest } from '@/types/builder';

/**
 * GET /api/pages/[pageId]/elements/[elementId]
 * Get a specific element
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string; elementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { elementId } = params;
    const element = await getElementById(elementId);

    if (!element) {
      return NextResponse.json({ error: 'Element not found' }, { status: 404 });
    }

    return NextResponse.json({ element });
  } catch (error) {
    console.error('Error fetching element:', error);
    return NextResponse.json(
      { error: 'Failed to fetch element' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pages/[pageId]/elements/[elementId]
 * Update an element
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { pageId: string; elementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { elementId } = params;
    const updates = await request.json() as UpdateElementRequest;

    const element = await updateElement(elementId, updates);

    return NextResponse.json({ element });
  } catch (error) {
    console.error('Error updating element:', error);
    return NextResponse.json(
      { error: 'Failed to update element' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[pageId]/elements/[elementId]
 * Delete an element and its children
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string; elementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { elementId } = params;
    await deleteElement(elementId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting element:', error);
    return NextResponse.json(
      { error: 'Failed to delete element' },
      { status: 500 }
    );
  }
}
