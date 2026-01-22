/**
 * Heatmap Service
 * Handles click and scroll heatmap data aggregation
 */

import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';

export interface ClickDataPoint {
  x: number;
  y: number;
  count: number;
  elementId?: string;
  elementText?: string;
}

export interface ScrollDepthData {
  depth: number; // percentage
  visitors: number;
  percentage: number;
}

export interface HeatmapData {
  clickHeatmap: ClickDataPoint[];
  scrollDepthDistribution: ScrollDepthData[];
  totalClicks: number;
  totalVisitors: number;
  avgScrollDepth: number;
  maxScrollDepth: number;
}

export class HeatmapService {
  /**
   * Get click heatmap data for a page
   */
  static async getClickHeatmap(
    workspaceId: string,
    pageId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ClickDataPoint[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all click events
    const clickEvents = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          workspaceId,
          pageId,
          startedAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        },
        eventType: EventType.CLICK,
        xPosition: {
          not: null,
        },
        yPosition: {
          not: null,
        },
      },
      select: {
        xPosition: true,
        yPosition: true,
        elementId: true,
        elementText: true,
      },
    });

    // Aggregate clicks by position (with some clustering)
    const CLUSTER_RADIUS = 20; // pixels
    const clusters = new Map<string, {
      x: number;
      y: number;
      count: number;
      elementIds: Set<string>;
      elementTexts: Set<string>;
    }>();

    clickEvents.forEach(event => {
      if (event.xPosition === null || event.yPosition === null) return;

      // Find existing cluster within radius
      let foundCluster = false;
      for (const [key, cluster] of clusters.entries()) {
        const distance = Math.sqrt(
          Math.pow(cluster.x - event.xPosition, 2) +
          Math.pow(cluster.y - event.yPosition, 2)
        );

        if (distance <= CLUSTER_RADIUS) {
          // Add to existing cluster
          cluster.count++;
          if (event.elementId) cluster.elementIds.add(event.elementId);
          if (event.elementText) cluster.elementTexts.add(event.elementText);
          foundCluster = true;
          break;
        }
      }

      // Create new cluster if not found
      if (!foundCluster) {
        const key = `${Math.round(event.xPosition)},${Math.round(event.yPosition)}`;
        clusters.set(key, {
          x: event.xPosition,
          y: event.yPosition,
          count: 1,
          elementIds: new Set(event.elementId ? [event.elementId] : []),
          elementTexts: new Set(event.elementText ? [event.elementText] : []),
        });
      }
    });

    // Convert to array and format
    return Array.from(clusters.values())
      .map(cluster => ({
        x: Math.round(cluster.x),
        y: Math.round(cluster.y),
        count: cluster.count,
        elementId: cluster.elementIds.size > 0
          ? Array.from(cluster.elementIds).join(', ')
          : undefined,
        elementText: cluster.elementTexts.size > 0
          ? Array.from(cluster.elementTexts)[0] // Use first text
          : undefined,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get scroll depth distribution
   */
  static async getScrollDepthDistribution(
    workspaceId: string,
    pageId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ScrollDepthData[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all scroll events
    const scrollEvents = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          workspaceId,
          pageId,
          startedAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        },
        eventType: EventType.SCROLL,
        scrollDepth: {
          not: null,
        },
      },
      select: {
        scrollDepth: true,
        session: {
          select: {
            visitorId: true,
          },
        },
      },
    });

    // Get max scroll depth per visitor
    const visitorMaxDepth = new Map<string, number>();
    scrollEvents.forEach(event => {
      if (event.scrollDepth === null) return;

      const currentMax = visitorMaxDepth.get(event.session.visitorId) || 0;
      if (event.scrollDepth > currentMax) {
        visitorMaxDepth.set(event.session.visitorId, event.scrollDepth);
      }
    });

    // Create depth buckets (0-10%, 10-20%, ..., 90-100%)
    const buckets = new Map<number, number>();
    for (let i = 0; i <= 100; i += 10) {
      buckets.set(i, 0);
    }

    // Assign visitors to buckets based on max depth
    visitorMaxDepth.forEach(depth => {
      const bucket = Math.floor(depth / 10) * 10;
      const count = buckets.get(bucket) || 0;
      buckets.set(bucket, count + 1);
    });

    const totalVisitors = visitorMaxDepth.size;

    // Convert to array
    return Array.from(buckets.entries())
      .map(([depth, visitors]) => ({
        depth,
        visitors,
        percentage: totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0,
      }))
      .sort((a, b) => a.depth - b.depth);
  }

  /**
   * Get comprehensive heatmap data
   */
  static async getHeatmapData(
    workspaceId: string,
    pageId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HeatmapData> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get click heatmap
    const clickHeatmap = await this.getClickHeatmap(
      workspaceId,
      pageId,
      defaultStartDate,
      defaultEndDate
    );

    // Get scroll depth distribution
    const scrollDepthDistribution = await this.getScrollDepthDistribution(
      workspaceId,
      pageId,
      defaultStartDate,
      defaultEndDate
    );

    // Calculate total clicks
    const totalClicks = clickHeatmap.reduce((sum, point) => sum + point.count, 0);

    // Get total unique visitors
    const uniqueVisitors = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        pageId,
        startedAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
      },
      select: {
        visitorId: true,
      },
      distinct: ['visitorId'],
    });

    // Get scroll depth stats
    const scrollEvents = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          workspaceId,
          pageId,
          startedAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        },
        eventType: EventType.SCROLL,
        scrollDepth: {
          not: null,
        },
      },
      select: {
        scrollDepth: true,
        session: {
          select: {
            visitorId: true,
          },
        },
      },
    });

    // Calculate max scroll per visitor
    const visitorMaxDepth = new Map<string, number>();
    scrollEvents.forEach(event => {
      if (event.scrollDepth === null) return;
      const currentMax = visitorMaxDepth.get(event.session.visitorId) || 0;
      if (event.scrollDepth > currentMax) {
        visitorMaxDepth.set(event.session.visitorId, event.scrollDepth);
      }
    });

    const scrollDepths = Array.from(visitorMaxDepth.values());
    const avgScrollDepth = scrollDepths.length > 0
      ? scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length
      : 0;
    const maxScrollDepth = scrollDepths.length > 0
      ? Math.max(...scrollDepths)
      : 0;

    return {
      clickHeatmap,
      scrollDepthDistribution,
      totalClicks,
      totalVisitors: uniqueVisitors.length,
      avgScrollDepth,
      maxScrollDepth,
    };
  }

  /**
   * Get element-level click statistics
   */
  static async getElementClickStats(
    workspaceId: string,
    pageId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 20
  ): Promise<Array<{
    elementId: string;
    elementText: string | null;
    clicks: number;
    uniqueVisitors: number;
  }>> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    const clickEvents = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          workspaceId,
          pageId,
          startedAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        },
        eventType: EventType.CLICK,
        elementId: {
          not: null,
        },
      },
      select: {
        elementId: true,
        elementText: true,
        session: {
          select: {
            visitorId: true,
          },
        },
      },
    });

    // Aggregate by element
    const elementStats = new Map<string, {
      elementId: string;
      elementText: string | null;
      clicks: number;
      visitors: Set<string>;
    }>();

    clickEvents.forEach(event => {
      if (!event.elementId) return;

      if (!elementStats.has(event.elementId)) {
        elementStats.set(event.elementId, {
          elementId: event.elementId,
          elementText: event.elementText,
          clicks: 0,
          visitors: new Set(),
        });
      }

      const stats = elementStats.get(event.elementId)!;
      stats.clicks++;
      stats.visitors.add(event.session.visitorId);
    });

    return Array.from(elementStats.values())
      .map(stats => ({
        elementId: stats.elementId,
        elementText: stats.elementText,
        clicks: stats.clicks,
        uniqueVisitors: stats.visitors.size,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }
}
