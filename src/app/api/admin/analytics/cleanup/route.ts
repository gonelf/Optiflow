/**
 * Admin Analytics Cleanup API Route
 * POST /api/admin/analytics/cleanup - Cleanup old analytics data
 * GET /api/admin/analytics/cleanup - Get data retention statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataRetentionService, DEFAULT_RETENTION_CONFIG } from '@/services/analytics/retention.service';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function checkAdminAccess(session: any): Promise<boolean> {
  if (!session?.user?.id) {
    return false;
  }

  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { systemRole: true },
  });

  return user?.systemRole === 'ADMIN';
}

/**
 * GET - Get data retention statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await checkAdminAccess(session);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const stats = await DataRetentionService.getDataStats();

    return NextResponse.json({
      stats,
      retentionConfig: DEFAULT_RETENTION_CONFIG,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Trigger cleanup of old analytics data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await checkAdminAccess(session);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const config = {
      eventRetentionDays: body.eventRetentionDays || DEFAULT_RETENTION_CONFIG.eventRetentionDays,
      sessionRetentionDays: body.sessionRetentionDays || DEFAULT_RETENTION_CONFIG.sessionRetentionDays,
      batchSize: body.batchSize || DEFAULT_RETENTION_CONFIG.batchSize,
    };

    // Validate config
    if (config.eventRetentionDays < 7 || config.sessionRetentionDays < 7) {
      return NextResponse.json(
        { error: 'Retention period must be at least 7 days' },
        { status: 400 }
      );
    }

    if (config.batchSize < 10 || config.batchSize > 10000) {
      return NextResponse.json(
        { error: 'Batch size must be between 10 and 10000' },
        { status: 400 }
      );
    }

    const result = await DataRetentionService.cleanupOldData(config);

    return NextResponse.json({
      success: true,
      result,
      config,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    );
  }
}
