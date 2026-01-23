/**
 * Cohort Analysis Service
 * Handles cohort creation and retention analysis
 */

import { prisma } from '@/lib/prisma';

export interface CohortDefinition {
  id: string;
  name: string;
  type: 'signup_date' | 'first_visit' | 'traffic_source' | 'geo' | 'custom';
  startDate: Date;
  endDate: Date;
  filterCriteria?: {
    utmSource?: string;
    utmMedium?: string;
    country?: string;
    pageId?: string;
  };
}

export interface CohortRetentionData {
  cohortName: string;
  cohortSize: number;
  periods: {
    period: number; // days since cohort start
    visitors: number;
    retentionRate: number;
  }[];
}

export interface CohortConversionData {
  cohortName: string;
  cohortSize: number;
  conversions: number;
  conversionRate: number;
  avgConversionValue: number;
  totalRevenue: number;
}

export class CohortAnalysisService {
  /**
   * Create weekly signup cohorts
   */
  static async createWeeklyCohorts(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CohortDefinition[]> {
    const cohorts: CohortDefinition[] = [];
    const currentDate = new Date(startDate);
    let cohortIndex = 0;

    while (currentDate < endDate) {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 7);

      cohorts.push({
        id: `cohort-week-${cohortIndex}`,
        name: `Week of ${currentDate.toLocaleDateString()}`,
        type: 'signup_date',
        startDate: new Date(currentDate),
        endDate: weekEnd > endDate ? endDate : weekEnd,
      });

      currentDate.setDate(currentDate.getDate() + 7);
      cohortIndex++;
    }

    return cohorts;
  }

  /**
   * Analyze retention for a cohort
   */
  static async analyzeCohortRetention(
    workspaceId: string,
    cohort: CohortDefinition,
    retentionPeriods: number = 12 // weeks
  ): Promise<CohortRetentionData> {
    // Get all visitors who started in the cohort period
    const cohortSessions = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        startedAt: {
          gte: cohort.startDate,
          lte: cohort.endDate,
        },
        ...(cohort.filterCriteria?.utmSource && {
          utmSource: cohort.filterCriteria.utmSource,
        }),
        ...(cohort.filterCriteria?.utmMedium && {
          utmMedium: cohort.filterCriteria.utmMedium,
        }),
        ...(cohort.filterCriteria?.country && {
          country: cohort.filterCriteria.country,
        }),
        ...(cohort.filterCriteria?.pageId && {
          pageId: cohort.filterCriteria.pageId,
        }),
      },
      select: {
        visitorId: true,
        startedAt: true,
      },
      distinct: ['visitorId'],
    });

    const cohortVisitors = new Set(cohortSessions.map(s => s.visitorId));
    const cohortSize = cohortVisitors.size;

    // For each period, count how many cohort visitors returned
    const periods: { period: number; visitors: number; retentionRate: number }[] = [];

    for (let period = 0; period <= retentionPeriods; period++) {
      const periodStart = new Date(cohort.startDate);
      periodStart.setDate(periodStart.getDate() + period * 7);

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);

      // Count cohort visitors active in this period
      const activeSessions = await prisma.analyticsSession.findMany({
        where: {
          workspaceId,
          visitorId: {
            in: Array.from(cohortVisitors),
          },
          startedAt: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
        select: {
          visitorId: true,
        },
        distinct: ['visitorId'],
      });

      const activeVisitors = activeSessions.length;
      const retentionRate = cohortSize > 0 ? (activeVisitors / cohortSize) * 100 : 0;

      periods.push({
        period,
        visitors: activeVisitors,
        retentionRate,
      });
    }

    return {
      cohortName: cohort.name,
      cohortSize,
      periods,
    };
  }

  /**
   * Analyze conversion rates by cohort
   */
  static async analyzeCohortConversions(
    workspaceId: string,
    cohort: CohortDefinition
  ): Promise<CohortConversionData> {
    // Get all visitors in the cohort
    const cohortSessions = await prisma.analyticsSession.findMany({
      where: {
        workspaceId,
        startedAt: {
          gte: cohort.startDate,
          lte: cohort.endDate,
        },
        ...(cohort.filterCriteria?.utmSource && {
          utmSource: cohort.filterCriteria.utmSource,
        }),
        ...(cohort.filterCriteria?.utmMedium && {
          utmMedium: cohort.filterCriteria.utmMedium,
        }),
        ...(cohort.filterCriteria?.country && {
          country: cohort.filterCriteria.country,
        }),
        ...(cohort.filterCriteria?.pageId && {
          pageId: cohort.filterCriteria.pageId,
        }),
      },
      select: {
        visitorId: true,
      },
      distinct: ['visitorId'],
    });

    const cohortVisitors = Array.from(new Set(cohortSessions.map(s => s.visitorId)));
    const cohortSize = cohortVisitors.length;

    // Get conversions for cohort visitors
    const conversions = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          visitorId: {
            in: cohortVisitors,
          },
        },
        isConversion: true,
      },
      select: {
        id: true,
        conversionValue: true,
        session: {
          select: {
            visitorId: true,
          },
        },
      },
    });

    const uniqueConverters = new Set(conversions.map(c => c.session.visitorId));
    const totalConversions = conversions.length;
    const conversionRate = cohortSize > 0 ? (uniqueConverters.size / cohortSize) * 100 : 0;

    const conversionValues = conversions
      .filter(c => c.conversionValue !== null)
      .map(c => c.conversionValue as number);

    const totalRevenue = conversionValues.reduce((sum, val) => sum + val, 0);
    const avgConversionValue = conversionValues.length > 0
      ? totalRevenue / conversionValues.length
      : 0;

    return {
      cohortName: cohort.name,
      cohortSize,
      conversions: totalConversions,
      conversionRate,
      avgConversionValue,
      totalRevenue,
    };
  }

  /**
   * Create cohorts by traffic source
   */
  static async createSourceCohorts(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CohortDefinition[]> {
    // Get unique traffic sources in the period
    const sources = await prisma.analyticsSession.groupBy({
      by: ['utmSource', 'utmMedium'],
      where: {
        workspaceId,
        startedAt: {
          gte: startDate,
          lte: endDate,
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
      take: 10, // Top 10 sources
    });

    return sources.map((source, index) => ({
      id: `cohort-source-${index}`,
      name: `${source.utmSource || 'Direct'} / ${source.utmMedium || 'None'}`,
      type: 'traffic_source' as const,
      startDate,
      endDate,
      filterCriteria: {
        utmSource: source.utmSource || undefined,
        utmMedium: source.utmMedium || undefined,
      },
    }));
  }

  /**
   * Create cohorts by geographic location
   */
  static async createGeoCohorts(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CohortDefinition[]> {
    // Get top countries
    const countries = await prisma.analyticsSession.groupBy({
      by: ['country'],
      where: {
        workspaceId,
        startedAt: {
          gte: startDate,
          lte: endDate,
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
      take: 10,
    });

    return countries.map((country, index) => ({
      id: `cohort-geo-${index}`,
      name: country.country || 'Unknown',
      type: 'geo' as const,
      startDate,
      endDate,
      filterCriteria: {
        country: country.country || undefined,
      },
    }));
  }

  /**
   * Compare multiple cohorts
   */
  static async compareCohorts(
    workspaceId: string,
    cohorts: CohortDefinition[]
  ): Promise<{
    cohort: CohortDefinition;
    size: number;
    conversions: number;
    conversionRate: number;
    avgSessionDuration: number;
  }[]> {
    const results = await Promise.all(
      cohorts.map(async cohort => {
        // Get cohort sessions
        const sessions = await prisma.analyticsSession.findMany({
          where: {
            workspaceId,
            startedAt: {
              gte: cohort.startDate,
              lte: cohort.endDate,
            },
            ...(cohort.filterCriteria?.utmSource && {
              utmSource: cohort.filterCriteria.utmSource,
            }),
            ...(cohort.filterCriteria?.utmMedium && {
              utmMedium: cohort.filterCriteria.utmMedium,
            }),
            ...(cohort.filterCriteria?.country && {
              country: cohort.filterCriteria.country,
            }),
            ...(cohort.filterCriteria?.pageId && {
              pageId: cohort.filterCriteria.pageId,
            }),
          },
          include: {
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

        const uniqueVisitors = new Set(sessions.map(s => s.visitorId));
        const conversions = sessions.flatMap(s => s.events);

        // distinct visitors who have at least one conversion event
        const uniqueConverters = new Set(
          sessions
            .filter(s => s.events.length > 0)
            .map(s => s.visitorId)
        );

        const avgSessionDuration = sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
          : 0;

        return {
          cohort,
          size: uniqueVisitors.size,
          conversions: conversions.length,
          conversionRate: uniqueVisitors.size > 0
            ? (uniqueConverters.size / uniqueVisitors.size) * 100
            : 0,
          avgSessionDuration,
        };
      })
    );

    return results.sort((a, b) => b.size - a.size);
  }
}
