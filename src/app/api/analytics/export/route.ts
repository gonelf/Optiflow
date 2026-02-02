/**
 * Analytics Data Export API Route
 * GET /api/analytics/export - Export analytics data as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Convert array of objects to CSV
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert each row
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle special characters and quotes
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

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
    const exportType = searchParams.get('type') || 'events'; // events, sessions, summary

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
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    let csvData: string;
    let filename: string;

    switch (exportType) {
      case 'events': {
        // Export analytics events
        const events = await prisma.analyticsEvent.findMany({
          where: {
            session: {
              workspaceId,
              ...(pageId && { pageId }),
              ...(startDate && { startedAt: { gte: startDate } }),
              ...(endDate && { startedAt: { lte: endDate } }),
            },
          },
          include: {
            session: {
              select: {
                sessionId: true,
                visitorId: true,
                pageId: true,
                referrer: true,
                utmSource: true,
                utmMedium: true,
                utmCampaign: true,
                country: true,
                city: true,
                device: true,
                browser: true,
                os: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 50000, // Limit to prevent memory issues
        });

        // Flatten data for CSV
        const flattenedEvents = events.map(event => ({
          timestamp: event.timestamp.toISOString(),
          eventType: event.eventType,
          eventName: event.eventName,
          sessionId: event.session.sessionId,
          visitorId: event.session.visitorId,
          pageId: event.session.pageId,
          elementId: event.elementId || '',
          elementType: event.elementType || '',
          elementText: event.elementText || '',
          xPosition: event.xPosition || '',
          yPosition: event.yPosition || '',
          scrollDepth: event.scrollDepth || '',
          isConversion: event.isConversion,
          conversionValue: event.conversionValue || '',
          referrer: event.session.referrer || '',
          utmSource: event.session.utmSource || '',
          utmMedium: event.session.utmMedium || '',
          utmCampaign: event.session.utmCampaign || '',
          country: event.session.country || '',
          city: event.session.city || '',
          device: event.session.device || '',
          browser: event.session.browser || '',
          os: event.session.os || '',
        }));

        csvData = convertToCSV(flattenedEvents);
        filename = `analytics-events-${workspaceSlug}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'sessions': {
        // Export analytics sessions
        const sessions = await prisma.analyticsSession.findMany({
          where: {
            workspaceId,
            ...(pageId && { pageId }),
            ...(startDate && { startedAt: { gte: startDate } }),
            ...(endDate && { startedAt: { lte: endDate } }),
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 50000, // Limit to prevent memory issues
        });

        const sessionData = sessions.map(session => ({
          sessionId: session.sessionId,
          visitorId: session.visitorId,
          userId: session.userId || '',
          pageId: session.pageId,
          variantId: session.variantId || '',
          startedAt: session.startedAt.toISOString(),
          endedAt: session.endedAt?.toISOString() || '',
          duration: session.duration || '',
          referrer: session.referrer || '',
          utmSource: session.utmSource || '',
          utmMedium: session.utmMedium || '',
          utmCampaign: session.utmCampaign || '',
          userAgent: session.userAgent || '',
          browser: session.browser || '',
          os: session.os || '',
          device: session.device || '',
          country: session.country || '',
          city: session.city || '',
        }));

        csvData = convertToCSV(sessionData);
        filename = `analytics-sessions-${workspaceSlug}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'summary': {
        // Export summary statistics
        const sessions = await prisma.analyticsSession.findMany({
          where: {
            workspaceId,
            ...(pageId && { pageId }),
            ...(startDate && { startedAt: { gte: startDate } }),
            ...(endDate && { startedAt: { lte: endDate } }),
          },
          include: {
            events: {
              where: {
                isConversion: true,
              },
            },
          },
        });

        // Group by page and calculate metrics
        const pageMetrics: Record<string, any> = {};

        for (const session of sessions) {
          const pageKey = session.pageId;
          if (!pageMetrics[pageKey]) {
            pageMetrics[pageKey] = {
              pageId: pageKey,
              totalSessions: 0,
              uniqueVisitors: new Set(),
              conversions: 0,
              totalDuration: 0,
              sources: {} as Record<string, number>,
            };
          }

          const metrics = pageMetrics[pageKey];
          metrics.totalSessions++;
          metrics.uniqueVisitors.add(session.visitorId);
          metrics.conversions += session.events.length;
          metrics.totalDuration += session.duration || 0;

          if (session.utmSource) {
            metrics.sources[session.utmSource] = (metrics.sources[session.utmSource] || 0) + 1;
          }
        }

        // Convert to array and calculate derived metrics
        const summaryData = Object.values(pageMetrics).map((metrics: any) => ({
          pageId: metrics.pageId,
          totalSessions: metrics.totalSessions,
          uniqueVisitors: metrics.uniqueVisitors.size,
          conversions: metrics.conversions,
          conversionRate: ((metrics.conversions / metrics.totalSessions) * 100).toFixed(2),
          avgDuration: (metrics.totalDuration / metrics.totalSessions).toFixed(0),
          topSource: Object.entries(metrics.sources).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'direct',
        }));

        csvData = convertToCSV(summaryData);
        filename = `analytics-summary-${workspaceSlug}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
    }

    // Return CSV file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
