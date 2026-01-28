// ============================================================================
// PHASE 8: CUSTOM FONT API - DELETE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteCustomFont } from '@/services/design-system.service';

/**
 * DELETE /api/workspaces/[workspaceId]/fonts/[fontId]
 * Delete a custom font
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; fontId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fontId } = params;
    await deleteCustomFont(fontId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting font:', error);
    return NextResponse.json(
      { error: 'Failed to delete font' },
      { status: 500 }
    );
  }
}
