// ============================================================================
// PHASE 8: DESIGN SYSTEM EXPORT API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportDesignTokens } from '@/services/design-system.service';

/**
 * GET /api/workspaces/[workspaceId]/design-system/export
 * Export design tokens as JSON
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
    const tokensJson = await exportDesignTokens(workspaceId);

    return new NextResponse(tokensJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="design-tokens-${workspaceId}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting design tokens:', error);
    return NextResponse.json(
      { error: 'Failed to export design tokens' },
      { status: 500 }
    );
  }
}
