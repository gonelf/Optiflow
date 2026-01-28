// ============================================================================
// PHASE 8: DESIGN SYSTEM IMPORT API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importDesignTokens } from '@/services/design-system.service';

/**
 * POST /api/workspaces/[workspaceId]/design-system/import
 * Import design tokens from JSON
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
    const { tokens } = body as { tokens: string };

    if (!tokens) {
      return NextResponse.json(
        { error: 'tokens JSON is required' },
        { status: 400 }
      );
    }

    const result = await importDesignTokens(workspaceId, tokens);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error importing design tokens:', error);
    return NextResponse.json(
      { error: 'Failed to import design tokens' },
      { status: 500 }
    );
  }
}
