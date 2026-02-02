/**
 * Analytics Cohorts API Route
 * GET /api/analytics/cohorts - Get cohort analysis data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CohortAnalysisService, CohortDefinition } from '@/services/analytics/cohort.service';
import { verifyWorkspaceAccess } from '@/lib/workspace';

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
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const type = searchParams.get('type') || 'weekly'; // weekly, source, geo, retention, conversion, compare

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace slug is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const accessResult = await verifyWorkspaceAccess(session.user.id, workspaceSlug);

    if (!accessResult.hasAccess) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied' },
        { status: 403 }
      );
    }

    const workspaceId = accessResult.workspaceId!;

    // Parse dates
    const now = new Date();
    const defaultStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const startDate = startDateStr ? new Date(startDateStr) : defaultStartDate;
    const endDate = endDateStr ? new Date(endDateStr) : now;

    switch (type) {
      case 'weekly': {
        const cohorts = await CohortAnalysisService.createWeeklyCohorts(
          workspaceId,
          startDate,
          endDate
        );
        return NextResponse.json(cohorts);
      }

      case 'source': {
        const cohorts = await CohortAnalysisService.createSourceCohorts(
          workspaceId,
          startDate,
          endDate
        );
        return NextResponse.json(cohorts);
      }

      case 'geo': {
        const cohorts = await CohortAnalysisService.createGeoCohorts(
          workspaceId,
          startDate,
          endDate
        );
        return NextResponse.json(cohorts);
      }

      case 'retention': {
        const cohortParam = searchParams.get('cohort');
        if (!cohortParam) {
          return NextResponse.json(
            { error: 'Cohort definition is required' },
            { status: 400 }
          );
        }

        try {
          const cohort: CohortDefinition = JSON.parse(cohortParam);
          const periods = parseInt(searchParams.get('periods') || '12');

          const retentionData = await CohortAnalysisService.analyzeCohortRetention(
            workspaceId,
            cohort,
            periods
          );

          return NextResponse.json(retentionData);
        } catch (parseError) {
          return NextResponse.json(
            { error: 'Invalid cohort definition JSON' },
            { status: 400 }
          );
        }
      }

      case 'conversion': {
        const cohortParam = searchParams.get('cohort');
        if (!cohortParam) {
          return NextResponse.json(
            { error: 'Cohort definition is required' },
            { status: 400 }
          );
        }

        try {
          const cohort: CohortDefinition = JSON.parse(cohortParam);

          const conversionData = await CohortAnalysisService.analyzeCohortConversions(
            workspaceId,
            cohort
          );

          return NextResponse.json(conversionData);
        } catch (parseError) {
          return NextResponse.json(
            { error: 'Invalid cohort definition JSON' },
            { status: 400 }
          );
        }
      }

      case 'compare': {
        const cohortsParam = searchParams.get('cohorts');
        if (!cohortsParam) {
          return NextResponse.json(
            { error: 'Cohorts array is required' },
            { status: 400 }
          );
        }

        try {
          const cohorts: CohortDefinition[] = JSON.parse(cohortsParam);

          const comparison = await CohortAnalysisService.compareCohorts(
            workspaceId,
            cohorts
          );

          return NextResponse.json(comparison);
        } catch (parseError) {
          return NextResponse.json(
            { error: 'Invalid cohorts JSON' },
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
    console.error('Error analyzing cohorts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
