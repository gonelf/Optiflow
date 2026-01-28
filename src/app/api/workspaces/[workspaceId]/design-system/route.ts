// ============================================================================
// PHASE 8: DESIGN SYSTEM API - GET & PUT
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getDesignSystem,
  upsertDesignSystem,
  resetDesignSystem,
} from '@/services/design-system.service';
import { DesignTokens } from '@/types/design-tokens';

/**
 * GET /api/workspaces/[workspaceId]/design-system
 * Get design system for a workspace
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
    const designSystem = await getDesignSystem(workspaceId);

    return NextResponse.json({ designSystem });
  } catch (error) {
    console.error('Error fetching design system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design system' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workspaces/[workspaceId]/design-system
 * Update design system for a workspace
 */
export async function PUT(
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
    const { name, tokens } = body as { name?: string; tokens: Partial<DesignTokens> };

    const designSystem = await upsertDesignSystem(workspaceId, tokens, name);

    return NextResponse.json({ designSystem });
  } catch (error) {
    console.error('Error updating design system:', error);
    return NextResponse.json(
      { error: 'Failed to update design system' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/design-system
 * Reset design system to defaults
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const designSystem = await resetDesignSystem(workspaceId);

    return NextResponse.json({ designSystem });
  } catch (error) {
    console.error('Error resetting design system:', error);
    return NextResponse.json(
      { error: 'Failed to reset design system' },
      { status: 500 }
    );
  }
}
