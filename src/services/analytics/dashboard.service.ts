/**
 * Analytics Dashboard Service
 * Handles data aggregation and queries for analytics dashboards
 */

import { prisma } from '@/lib/prisma';
// import { EventType } from '@prisma/client';

export interface DashboardMetrics {
  currentVisitors: number;
  totalPageviews: number;
  totalConversions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  uniqueVisitors: number;
}

export interface TopPage {
  pageId: string;
  pageName: string;
  pageviews: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface GeoDistribution {
  country: string;
  city: string | null;
  visitors: number;
  percentage: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  pageviews: number;
  visitors: number;
  conversions: number;
}

export class AnalyticsDashboardService {
  /**
   * Get real-time metrics for dashboard
   * Optimized to batch queries using Promise.all for better performance
   */
  static async getDashboardMetrics(
    workspaceId: string,
    pageId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardMetrics> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const defaultEndDate = endDate || now;
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Build base filter
    const baseFilter: any = {
      workspaceId,
      startedAt: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
    };

    if (pageId) {
      baseFilter.pageId = pageId;
    }

    const eventSessionFilter = {
      workspaceId,
      startedAt: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
      ...(pageId ? { pageId } : {}),
    };

    // Batch all queries using Promise.all for parallel execution
    const [
      currentVisitors,
      sessionsWithEvents,
      pageviews,
      conversions,
    ] = await Promise.all([
      // Current visitors (active in last 5 minutes)
      prisma.analyticsSession.count({
        where: {
          ...baseFilter,
          startedAt: {
            gte: fiveMinutesAgo,
          },
        },
      }),

      // Sessions with events and duration - single query for sessions, bounce rate, and duration
      prisma.analyticsSession.findMany({
        where: baseFilter,
        select: {
          id: true,
          visitorId: true,
          duration: true,
          _count: {
            select: {
              events: true,
            },
          },
        },
      }),

      // Total pageviews
      prisma.analyticsEvent.count({
        where: {
          session: eventSessionFilter,
          eventType: 'PAGE_VIEW',
        },
      }),

      // Total conversions
      prisma.analyticsEvent.count({
        where: {
          session: eventSessionFilter,
          isConversion: true,
        },
      }),
    ]);

    // Calculate metrics from batched results
    const uniqueVisitorIds = new Set(sessionsWithEvents.map((s: any) => s.visitorId));
    const uniqueVisitors = uniqueVisitorIds.size;

    // Calculate bounce rate (sessions with 0 or 1 events)
    const bouncedSessions = sessionsWithEvents.filter((s: any) => s._count.events <= 1).length;
    const bounceRate = sessionsWithEvents.length > 0 ? (bouncedSessions / sessionsWithEvents.length) * 100 : 0;

    // Calculate average session duration
    const totalDuration = sessionsWithEvents.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    const avgSessionDuration = sessionsWithEvents.length > 0 ? totalDuration / sessionsWithEvents.length : 0;

    // Calculate conversion rate
    const conversionRate = uniqueVisitors > 0 ? (conversions / uniqueVisitors) * 100 : 0;

    return {
      currentVisitors,
      totalPageviews: pageviews,
      totalConversions: conversions,
      conversionRate,
      bounceRate,
      avgSessionDuration,
      uniqueVisitors,
    };
  }

  /**
   * Get top performing pages
   */
  static async getTopPages(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<TopPage[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all sessions in timeframe
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        startedAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
          },
        },
        events: {
          where: {
            OR: [
              { eventType: 'PAGE_VIEW' },
              { isConversion: true },
            ],
          },
          select: {
            eventType: true,
            isConversion: true,
          },
        },
      },
    });

    // Aggregate by page
    const pageStats = new Map<string, {
      pageId: string;
      pageName: string;
      pageviews: number;
      uniqueVisitors: Set<string>;
      conversions: number;
    }>();

    sessions.forEach((session: any) => {
      if (!session.page) return;

      const pageId = session.page.id;
      const pageName = session.page.title;

      if (!pageStats.has(pageId)) {
        pageStats.set(pageId, {
          pageId,
          pageName,
          pageviews: 0,
          uniqueVisitors: new Set(),
          conversions: 0,
        });
      }

      const stats = pageStats.get(pageId)!;

      session.events.forEach((event: any) => {
        if (event.eventType === 'PAGE_VIEW') {
          stats.pageviews++;
          stats.uniqueVisitors.add(session.visitorId);
        }
        if (event.isConversion) {
          stats.conversions++;
        }
      });
    });

    // Convert to array and calculate conversion rates
    const topPages: TopPage[] = Array.from(pageStats.values())
      .map(stats => ({
        pageId: stats.pageId,
        pageName: stats.pageName,
        pageviews: stats.pageviews,
        uniqueVisitors: stats.uniqueVisitors.size,
        conversions: stats.conversions,
        conversionRate: stats.uniqueVisitors.size > 0
          ? (stats.conversions / stats.uniqueVisitors.size) * 100
          : 0,
      }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, limit);

    return topPages;
  }

  /**
   * Get traffic sources
   */
  static async getTrafficSources(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<TrafficSource[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    const sessions = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        startedAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
      },
      select: {
        utmSource: true,
        utmMedium: true,
        visitorId: true,
        events: {
          where: {
            isConversion: true,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Aggregate by source and medium
    const sourceStats = new Map<string, {
      source: string;
      medium: string;
      visitors: Set<string>;
      conversions: number;
    }>();

    sessions.forEach((session: any) => {
      const source = session.utmSource || 'Direct';
      const medium = session.utmMedium || 'None';
      const key = `${source}|${medium}`;

      if (!sourceStats.has(key)) {
        sourceStats.set(key, {
          source,
          medium,
          visitors: new Set(),
          conversions: 0,
        });
      }

      const stats = sourceStats.get(key)!;
      stats.visitors.add(session.visitorId);
      stats.conversions += session.events.length;
    });

    // Convert to array and calculate conversion rates
    const trafficSources: TrafficSource[] = Array.from(sourceStats.values())
      .map(stats => ({
        source: stats.source,
        medium: stats.medium,
        visitors: stats.visitors.size,
        conversions: stats.conversions,
        conversionRate: stats.visitors.size > 0
          ? (stats.conversions / stats.visitors.size) * 100
          : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, limit);

    return trafficSources;
  }

  /**
   * Get geographic distribution
   */
  static async getGeoDistribution(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<GeoDistribution[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    const sessions = await prisma.analyticsSession.groupBy({
      by: ['country', 'city'],
      where: {
        workspaceId,
        startedAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
        country: {
          not: null,
        },
      },
      _count: {
        visitorId: true,
      },
      orderBy: {
        _count: {
          visitorId: 'desc',
        },
      },
      take: limit,
    });

    const totalVisitors = sessions.reduce((sum: number, s: any) => sum + s._count.visitorId, 0);

    return sessions.map((s: any) => ({
      country: s.country || 'Unknown',
      city: s.city,
      visitors: s._count.visitorId,
      percentage: totalVisitors > 0 ? (s._count.visitorId / totalVisitors) * 100 : 0,
    }));
  }

  /**
   * Get time series data for charts
   */
  static async getTimeSeriesData(
    workspaceId: string,
    pageId?: string,
    startDate?: Date,
    endDate?: Date,
    interval: 'hour' | 'day' = 'hour'
  ): Promise<TimeSeriesData[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // This is a simplified version - in production, you'd use database-specific
    // time bucketing functions like DATE_TRUNC in PostgreSQL
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        startedAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
        ...(pageId ? { pageId } : {}),
      },
      include: {
        events: {
          where: {
            OR: [
              { eventType: 'PAGE_VIEW' },
              { isConversion: true },
            ],
          },
          select: {
            eventType: true,
            isConversion: true,
            timestamp: true,
          },
        },
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Group by time bucket
    const buckets = new Map<number, {
      pageviews: number;
      visitors: Set<string>;
      conversions: number;
    }>();

    const bucketSize = interval === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    sessions.forEach((session: any) => {
      const bucketKey = Math.floor(session.startedAt.getTime() / bucketSize) * bucketSize;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          pageviews: 0,
          visitors: new Set(),
          conversions: 0,
        });
      }

      const bucket = buckets.get(bucketKey)!;
      bucket.visitors.add(session.visitorId);

      session.events.forEach((event: any) => {
        if (event.eventType === 'PAGE_VIEW') {
          bucket.pageviews++;
        }
        if (event.isConversion) {
          bucket.conversions++;
        }
      });
    });

    // Convert to sorted array
    return Array.from(buckets.entries())
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        pageviews: data.pageviews,
        visitors: data.visitors.size,
        conversions: data.conversions,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
