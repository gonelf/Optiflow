// ============================================================================
// PHASE 8: CUSTOM FONTS API - GET & POST
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCustomFonts, addCustomFont } from '@/services/design-system.service';

/**
 * GET /api/workspaces/[workspaceId]/fonts
 * Get custom fonts for a workspace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const fonts = await getCustomFonts(workspaceId);

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error('Error fetching fonts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fonts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces/[workspaceId]/fonts
 * Add a custom font
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const body = await request.json();
    const { name, family, weight, style, woff2Url, woffUrl, ttfUrl } = body;

    if (!name || !family) {
      return NextResponse.json(
        { error: 'name and family are required' },
        { status: 400 }
      );
    }

    const font = await addCustomFont({
      workspaceId,
      name,
      family,
      weight: weight || [400],
      style: style || ['normal'],
      woff2Url,
      woffUrl,
      ttfUrl,
    });

    return NextResponse.json({ font }, { status: 201 });
  } catch (error) {
    console.error('Error adding font:', error);
    return NextResponse.json(
      { error: 'Failed to add font' },
      { status: 500 }
    );
  }
}
