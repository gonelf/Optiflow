/**
 * Analytics Data Retention Service
 * Handles cleanup of old analytics data
 */

import { prisma } from '@/lib/prisma';

export interface RetentionConfig {
  // Number of days to retain analytics events
  eventRetentionDays: number;
  // Number of days to retain analytics sessions
  sessionRetentionDays: number;
  // Batch size for deletion to avoid overwhelming the database
  batchSize: number;
}

export interface CleanupResult {
  eventsDeleted: number;
  sessionsDeleted: number;
  durationMs: number;
}

export class DataRetentionService {
  /**
   * Clean up old analytics data based on retention policy
   * @param config - Retention configuration
   * @returns CleanupResult with statistics
   */
  static async cleanupOldData(config: RetentionConfig): Promise<CleanupResult> {
    const startTime = Date.now();
    let eventsDeleted = 0;
    let sessionsDeleted = 0;

    try {
      const now = new Date();

      // Calculate cutoff dates
      const eventCutoffDate = new Date(now.getTime() - config.eventRetentionDays * 24 * 60 * 60 * 1000);
      const sessionCutoffDate = new Date(now.getTime() - config.sessionRetentionDays * 24 * 60 * 60 * 1000);

      console.log(`Starting cleanup: events before ${eventCutoffDate.toISOString()}, sessions before ${sessionCutoffDate.toISOString()}`);

      // Delete old events in batches
      let hasMoreEvents = true;
      while (hasMoreEvents) {
        const oldEvents = await prisma.analyticsEvent.findMany({
          where: {
            timestamp: {
              lt: eventCutoffDate,
            },
          },
          select: { id: true },
          take: config.batchSize,
        });

        if (oldEvents.length === 0) {
          hasMoreEvents = false;
          break;
        }

        const eventIds = oldEvents.map(e => e.id);
        const deleteResult = await prisma.analyticsEvent.deleteMany({
          where: {
            id: { in: eventIds },
          },
        });

        eventsDeleted += deleteResult.count;
        console.log(`Deleted ${deleteResult.count} events (total: ${eventsDeleted})`);

        // If we got less than batch size, we're done
        if (oldEvents.length < config.batchSize) {
          hasMoreEvents = false;
        }
      }

      // Delete old sessions in batches (this will cascade delete related events if not already deleted)
      let hasMoreSessions = true;
      while (hasMoreSessions) {
        const oldSessions = await prisma.analyticsSession.findMany({
          where: {
            startedAt: {
              lt: sessionCutoffDate,
            },
          },
          select: { id: true },
          take: config.batchSize,
        });

        if (oldSessions.length === 0) {
          hasMoreSessions = false;
          break;
        }

        const sessionIds = oldSessions.map(s => s.id);
        const deleteResult = await prisma.analyticsSession.deleteMany({
          where: {
            id: { in: sessionIds },
          },
        });

        sessionsDeleted += deleteResult.count;
        console.log(`Deleted ${deleteResult.count} sessions (total: ${sessionsDeleted})`);

        // If we got less than batch size, we're done
        if (oldSessions.length < config.batchSize) {
          hasMoreSessions = false;
        }
      }

      const durationMs = Date.now() - startTime;

      console.log(`Cleanup completed: ${eventsDeleted} events, ${sessionsDeleted} sessions in ${durationMs}ms`);

      return {
        eventsDeleted,
        sessionsDeleted,
        durationMs,
      };
    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  }

  /**
   * Get statistics about analytics data volume
   * @returns Statistics object
   */
  static async getDataStats(): Promise<{
    totalEvents: number;
    totalSessions: number;
    oldestEvent: Date | null;
    oldestSession: Date | null;
    eventsByDay: { date: string; count: number }[];
  }> {
    const [totalEvents, totalSessions, oldestEvent, oldestSession] = await Promise.all([
      prisma.analyticsEvent.count(),
      prisma.analyticsSession.count(),
      prisma.analyticsEvent.findFirst({
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      }),
      prisma.analyticsSession.findFirst({
        orderBy: { startedAt: 'asc' },
        select: { startedAt: true },
      }),
    ]);

    // Get events by day for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        timestamp: true,
      },
    });

    // Group by day
    const eventsByDay: Record<string, number> = {};
    for (const event of events) {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      eventsByDay[dateKey] = (eventsByDay[dateKey] || 0) + 1;
    }

    return {
      totalEvents,
      totalSessions,
      oldestEvent: oldestEvent?.timestamp || null,
      oldestSession: oldestSession?.startedAt || null,
      eventsByDay: Object.entries(eventsByDay).map(([date, count]) => ({ date, count })),
    };
  }
}

/**
 * Default retention configuration
 * - Events: 90 days
 * - Sessions: 90 days
 * - Batch size: 1000
 */
export const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  eventRetentionDays: 90,
  sessionRetentionDays: 90,
  batchSize: 1000,
};
