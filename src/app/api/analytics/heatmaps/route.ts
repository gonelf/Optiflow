/**
 * Analytics Heatmaps API Route
 * GET /api/analytics/heatmaps - Get heatmap data for pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HeatmapService } from '@/services/analytics/heatmap.service';

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
    const pageId = searchParams.get('pageId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const type = searchParams.get('type') || 'full'; // full, clicks, scroll, elements

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
        { status: 400 }
      );
    }

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required for heatmap data' },
        { status: 400 }
      );
    }

    // Get workspace ID
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

    // Verify page belongs to workspace
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        workspaceId: workspaceId,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found or access denied' },
        { status: 404 }
      );
    }

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    switch (type) {
      case 'full': {
        const heatmapData = await HeatmapService.getHeatmapData(
          workspaceId,
          pageId,
          startDate,
          endDate
        );
        return NextResponse.json(heatmapData);
      }

      case 'clicks': {
        const clickData = await HeatmapService.getClickHeatmap(
          workspaceId,
          pageId,
          startDate,
          endDate
        );
        return NextResponse.json(clickData);
      }

      case 'scroll': {
        const scrollData = await HeatmapService.getScrollDepthDistribution(
          workspaceId,
          pageId,
          startDate,
          endDate
        );
        return NextResponse.json(scrollData);
      }

      case 'elements': {
        const limit = parseInt(searchParams.get('limit') || '20');
        const elementStats = await HeatmapService.getElementClickStats(
          workspaceId,
          pageId,
          startDate,
          endDate,
          limit
        );
        return NextResponse.json(elementStats);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
