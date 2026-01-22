/**
 * Analytics Funnels API Route
 * GET /api/analytics/funnels - Analyze conversion funnels
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ConversionFunnelService, FunnelStep } from '@/services/analytics/funnel.service';

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
    const type = searchParams.get('type') || 'analyze'; // analyze, bySource, templates

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
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

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    switch (type) {
      case 'templates': {
        const templates = ConversionFunnelService.getCommonFunnels();
        return NextResponse.json(templates);
      }

      case 'analyze': {
        // Get funnel steps from request
        const stepsParam = searchParams.get('steps');
        if (!stepsParam) {
          return NextResponse.json(
            { error: 'Funnel steps are required' },
            { status: 400 }
          );
        }

        try {
          const steps: FunnelStep[] = JSON.parse(stepsParam);

          if (!Array.isArray(steps) || steps.length === 0) {
            return NextResponse.json(
              { error: 'Invalid funnel steps format' },
              { status: 400 }
            );
          }

          const analysis = await ConversionFunnelService.analyzeFunnel(
            workspaceId,
            steps,
            pageId,
            startDate,
            endDate
          );

          return NextResponse.json(analysis);
        } catch (parseError) {
          return NextResponse.json(
            { error: 'Invalid funnel steps JSON' },
            { status: 400 }
          );
        }
      }

      case 'bySource': {
        const stepsParam = searchParams.get('steps');
        if (!stepsParam) {
          return NextResponse.json(
            { error: 'Funnel steps are required' },
            { status: 400 }
          );
        }

        try {
          const steps: FunnelStep[] = JSON.parse(stepsParam);

          const sourceAnalysis = await ConversionFunnelService.analyzeFunnelBySource(
            workspaceId,
            steps,
            pageId,
            startDate,
            endDate
          );

          return NextResponse.json(sourceAnalysis);
        } catch (parseError) {
          return NextResponse.json(
            { error: 'Invalid funnel steps JSON' },
            { status: 400 }
          );
        }
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error analyzing funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
