/**
 * Analytics Stats API Route
 * GET /api/analytics/stats - Get dashboard metrics and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsDashboardService } from '@/services/analytics/dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceSlug = searchParams.get('workspaceSlug');
    const pageId = searchParams.get('pageId') || undefined;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const type = searchParams.get('type') || 'dashboard'; // dashboard, pages, sources, geo, timeseries

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
        { status: 400 }
      );
    }

    // TODO: Verify user has access to this workspace
    // For now, we'll get the workspace ID from the slug
    const { prisma } = await import('@/lib/prisma');
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const workspaceId = workspace.id;

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Get requested data based on type
    switch (type) {
      case 'dashboard': {
        const metrics = await AnalyticsDashboardService.getDashboardMetrics(
          workspaceId,
          pageId,
          startDate,
          endDate
        );
        return NextResponse.json(metrics);
      }

      case 'pages': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const topPages = await AnalyticsDashboardService.getTopPages(
          workspaceId,
          startDate,
          endDate,
          limit
        );
        return NextResponse.json(topPages);
      }

      case 'sources': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const sources = await AnalyticsDashboardService.getTrafficSources(
          workspaceId,
          startDate,
          endDate,
          limit
        );
        return NextResponse.json(sources);
      }

      case 'geo': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const geo = await AnalyticsDashboardService.getGeoDistribution(
          workspaceId,
          startDate,
          endDate,
          limit
        );
        return NextResponse.json(geo);
      }

      case 'timeseries': {
        const interval = (searchParams.get('interval') || 'hour') as 'hour' | 'day';
        const timeseries = await AnalyticsDashboardService.getTimeSeriesData(
          workspaceId,
          pageId,
          startDate,
          endDate,
          interval
        );
        return NextResponse.json(timeseries);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
