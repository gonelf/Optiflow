// ============================================================================
// PHASE 8: ELEMENTS API - GET & POST
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPageElements,
  createElement,
} from '@/services/element.service';
import { CreateElementRequest } from '@/types/builder';

/**
 * GET /api/pages/[pageId]/elements
 * Get all elements for a page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = params;
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId') || undefined;

    const elements = await getPageElements(pageId, variantId);

    return NextResponse.json({ elements });
  } catch (error) {
    console.error('Error fetching elements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages/[pageId]/elements
 * Create a new element
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

    const { pageId } = params;
    const body = await request.json();
    const { variantId, ...elementData } = body as CreateElementRequest & { variantId?: string };

    const element = await createElement(pageId, elementData, variantId);

    return NextResponse.json({ element }, { status: 201 });
  } catch (error) {
    console.error('Error creating element:', error);
    return NextResponse.json(
      { error: 'Failed to create element' },
      { status: 500 }
    );
  }
}
