/**
 * Optimized database queries to prevent N+1 queries
 * These functions use proper includes and selects to fetch related data efficiently
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Fetch page with all related data in a single query
 * Prevents N+1 queries when rendering pages
 */
export async function getPageWithComponents(pageId: string) {
  return prisma.page.findUnique({
    where: { id: pageId },
    include: {
      components: {
        where: { variantId: null },
        orderBy: { order: 'asc' },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Fetch A/B test with all variants and their components
 * Prevents N+1 queries when loading test data
 */
export async function getABTestWithVariants(testId: string) {
  return prisma.aBTest.findUnique({
    where: { id: testId },
    include: {
      page: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      variants: {
        include: {
          components: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              events: {
                where: { isConversion: true },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Fetch analytics sessions with events in a time range
 * Optimized for analytics dashboards
 */
export async function getAnalyticsSessionsWithEvents(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
  options?: {
    pageId?: string;
    variantId?: string;
    limit?: number;
  }
) {
  const where: Prisma.AnalyticsSessionWhereInput = {
    workspaceId,
    startedAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (options?.pageId) {
    where.pageId = options.pageId;
  }

  if (options?.variantId) {
    where.variantId = options.variantId;
  }

  return prisma.analyticsSession.findMany({
    where,
    include: {
      events: {
        select: {
          id: true,
          eventType: true,
          eventName: true,
          isConversion: true,
          conversionValue: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'asc' },
      },
      page: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    take: options?.limit || 1000,
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Fetch workspace with members and their roles
 * Optimized for workspace settings pages
 */
export async function getWorkspaceWithMembers(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          pages: true,
          templates: true,
          integrations: true,
        },
      },
    },
  });
}

/**
 * Fetch all pages for a workspace with component counts
 * Optimized for page list views
 */
export async function getWorkspacePages(
  workspaceId: string,
  options?: {
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Prisma.PageWhereInput = {
    workspaceId,
  };

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  return prisma.page.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          components: true,
          variants: true,
          abTests: true,
        },
      },
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Fetch published page with analytics data
 * Optimized for public page views with caching
 */
export async function getPublishedPageWithAnalytics(slug: string) {
  return prisma.page.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      components: {
        where: { variantId: null },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          name: true,
          order: true,
          config: true,
          styles: true,
          content: true,
        },
      },
      abTests: {
        where: { status: 'RUNNING' },
        include: {
          variants: {
            include: {
              components: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  type: true,
                  name: true,
                  order: true,
                  config: true,
                  styles: true,
                  content: true,
                },
              },
            },
          },
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Batch fetch analytics metrics for multiple pages
 * Optimized for dashboard views
 */
export async function getBatchAnalyticsMetrics(
  pageIds: string[],
  startDate: Date,
  endDate: Date
) {
  const metrics = await prisma.analyticsSession.groupBy({
    by: ['pageId'],
    where: {
      pageId: { in: pageIds },
      startedAt: { gte: startDate, lte: endDate },
    },
    _count: {
      id: true,
    },
  });

  const conversions = await prisma.analyticsEvent.groupBy({
    by: ['sessionId'],
    where: {
      session: {
        pageId: { in: pageIds },
        startedAt: { gte: startDate, lte: endDate },
      },
      isConversion: true,
    },
    _count: {
      id: true,
    },
    _sum: {
      conversionValue: true,
    },
  });

  return {
    sessions: metrics,
    conversions,
  };
}

/**
 * Fetch webhook deliveries with retry status
 * Optimized for webhook management UI
 */
export async function getWebhookDeliveries(
  webhookId: string,
  options?: {
    status?: string;
    limit?: number;
  }
) {
  const where: Prisma.WebhookDeliveryWhereInput = {
    webhookId,
  };

  if (options?.status) {
    where.status = options.status;
  }

  return prisma.webhookDelivery.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Get template with usage statistics
 * Optimized for template gallery
 */
export async function getTemplatesWithStats(category?: string) {
  const where: Prisma.TemplateWhereInput = {};

  if (category) {
    where.category = category as any;
  }

  return prisma.template.findMany({
    where,
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Atomic increment for page views and conversions
 * Prevents race conditions
 */
export async function incrementVariantMetrics(
  variantId: string,
  type: 'impression' | 'conversion'
) {
  if (type === 'impression') {
    return prisma.pageVariant.update({
      where: { id: variantId },
      data: {
        impressions: { increment: 1 },
      },
    });
  } else {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.pageVariant.update({
        where: { id: variantId },
        data: {
          conversions: { increment: 1 },
        },
      });

      // Recalculate conversion rate
      const conversionRate =
        variant.impressions > 0 ? variant.conversions / variant.impressions : 0;

      return tx.pageVariant.update({
        where: { id: variantId },
        data: { conversionRate },
      });
    });
  }
}
