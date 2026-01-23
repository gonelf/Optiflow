/**
 * Conversion Funnel Service
 * Handles funnel creation, tracking, and analysis
 */

import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';

export interface FunnelStep {
  id: string;
  name: string;
  eventType: EventType;
  elementId?: string;
  order: number;
}

export interface FunnelStepResult {
  step: FunnelStep;
  totalVisitors: number;
  uniqueVisitors: number;
  completions: number;
  completionRate: number;
  dropoffRate: number;
  avgTimeToComplete: number; // in seconds
}

export interface FunnelAnalysis {
  funnelId: string;
  funnelName: string;
  steps: FunnelStepResult[];
  totalStarted: number;
  totalCompleted: number;
  overallConversionRate: number;
  avgCompletionTime: number;
}

export interface FunnelBySource {
  source: string;
  medium: string;
  started: number;
  completed: number;
  conversionRate: number;
}

export class ConversionFunnelService {
  /**
   * Analyze a funnel and get step-by-step metrics
   */
  static async analyzeFunnel(
    workspaceId: string,
    funnelSteps: FunnelStep[],
    pageId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelAnalysis> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const defaultEndDate = endDate || now;

    // Get all sessions in the timeframe
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
          orderBy: {
            timestamp: 'asc',
          },
          select: {
            id: true,
            eventType: true,
            elementId: true,
            timestamp: true,
          },
        },
      },
    });

    // Track visitors through each step
    const stepResults: FunnelStepResult[] = [];
    let previousStepVisitors = new Set<string>();
    const funnelStartTime = new Map<string, Date>(); // visitor -> start time

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const stepCompletions = new Set<string>();
      const completionTimes: number[] = [];

      sessions.forEach(session => {
        const matchingEvents = session.events.filter(event => {
          const typeMatches = event.eventType === step.eventType;
          const elementMatches = !step.elementId || event.elementId === step.elementId;
          return typeMatches && elementMatches;
        });

        if (matchingEvents.length > 0) {
          stepCompletions.add(session.visitorId);

          // Calculate time from funnel start
          if (i === 0) {
            funnelStartTime.set(session.visitorId, matchingEvents[0].timestamp);
          } else if (funnelStartTime.has(session.visitorId)) {
            const startTime = funnelStartTime.get(session.visitorId)!;
            const completionTime = matchingEvents[0].timestamp;
            const timeDiff = (completionTime.getTime() - startTime.getTime()) / 1000; // seconds
            completionTimes.push(timeDiff);
          }
        }
      });

      const totalVisitors = i === 0 ? sessions.length : previousStepVisitors.size;
      const uniqueVisitors = stepCompletions.size;
      const completionRate = totalVisitors > 0 ? (uniqueVisitors / totalVisitors) * 100 : 0;
      const dropoffRate = 100 - completionRate;
      const avgTimeToComplete = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      stepResults.push({
        step,
        totalVisitors,
        uniqueVisitors,
        completions: uniqueVisitors,
        completionRate,
        dropoffRate,
        avgTimeToComplete,
      });

      previousStepVisitors = stepCompletions;
    }

    // Calculate overall metrics
    const totalStarted = stepResults[0]?.uniqueVisitors || 0;
    const totalCompleted = stepResults[stepResults.length - 1]?.uniqueVisitors || 0;
    const overallConversionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    // Calculate average completion time for successful visitors
    const completedVisitors = Array.from(previousStepVisitors);
    const completionTimes: number[] = [];

    completedVisitors.forEach(visitorId => {
      if (funnelStartTime.has(visitorId)) {
        const startTime = funnelStartTime.get(visitorId)!;
        const sessionWithCompletion = sessions.find(s =>
          s.visitorId === visitorId &&
          s.events.some(e =>
            e.eventType === funnelSteps[funnelSteps.length - 1].eventType &&
            (!funnelSteps[funnelSteps.length - 1].elementId ||
              e.elementId === funnelSteps[funnelSteps.length - 1].elementId)
          )
        );

        if (sessionWithCompletion) {
          const completionEvent = sessionWithCompletion.events.find(e =>
            e.eventType === funnelSteps[funnelSteps.length - 1].eventType &&
            (!funnelSteps[funnelSteps.length - 1].elementId ||
              e.elementId === funnelSteps[funnelSteps.length - 1].elementId)
          );

          if (completionEvent) {
            const timeDiff = (completionEvent.timestamp.getTime() - startTime.getTime()) / 1000;
            completionTimes.push(timeDiff);
          }
        }
      }
    });

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    return {
      funnelId: `funnel-${Date.now()}`,
      funnelName: 'Custom Funnel',
      steps: stepResults,
      totalStarted,
      totalCompleted,
      overallConversionRate,
      avgCompletionTime,
    };
  }

  /**
   * Segment funnel performance by traffic source
   */
  static async analyzeFunnelBySource(
    workspaceId: string,
    funnelSteps: FunnelStep[],
    pageId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelBySource[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all sessions grouped by source
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
          orderBy: {
            timestamp: 'asc',
          },
          select: {
            eventType: true,
            elementId: true,
            session: {
              select: {
                visitorId: true,
              },
            },
          },
        },
      },
      select: {
        utmSource: true,
        utmMedium: true,
        visitorId: true,
        events: true,
      },
    });

    // Group by source
    const sourceStats = new Map<string, {
      source: string;
      medium: string;
      started: Set<string>;
      completed: Set<string>;
    }>();

    sessions.forEach(session => {
      const source = session.utmSource || 'Direct';
      const medium = session.utmMedium || 'None';
      const key = `${source}|${medium}`;

      if (!sourceStats.has(key)) {
        sourceStats.set(key, {
          source,
          medium,
          started: new Set(),
          completed: new Set(),
        });
      }

      const stats = sourceStats.get(key)!;

      // Check if visitor started funnel (completed first step)
      const firstStepCompleted = session.events.some(e =>
        e.eventType === funnelSteps[0].eventType &&
        (!funnelSteps[0].elementId || e.elementId === funnelSteps[0].elementId)
      );

      if (firstStepCompleted) {
        stats.started.add(session.visitorId);

        // Check if visitor completed all steps
        const allStepsCompleted = funnelSteps.every(step =>
          session.events.some(e =>
            e.eventType === step.eventType &&
            (!step.elementId || e.elementId === step.elementId)
          )
        );

        if (allStepsCompleted) {
          stats.completed.add(session.visitorId);
        }
      }
    });

    // Convert to array and calculate rates
    return Array.from(sourceStats.values())
      .map(stats => ({
        source: stats.source,
        medium: stats.medium,
        started: stats.started.size,
        completed: stats.completed.size,
        conversionRate: stats.started.size > 0
          ? (stats.completed.size / stats.started.size) * 100
          : 0,
      }))
      .sort((a, b) => b.started - a.started);
  }

  /**
   * Get common funnel templates
   */
  static getCommonFunnels(): { name: string; steps: FunnelStep[] }[] {
    return [
      {
        name: 'Basic Conversion Funnel',
        steps: [
          {
            id: 'step-1',
            name: 'Page View',
            eventType: EventType.PAGE_VIEW,
            order: 1,
          },
          {
            id: 'step-2',
            name: 'Click CTA',
            eventType: EventType.CLICK,
            order: 2,
          },
          {
            id: 'step-3',
            name: 'Form Submit',
            eventType: EventType.FORM_SUBMIT,
            order: 3,
          },
          {
            id: 'step-4',
            name: 'Conversion',
            eventType: EventType.CONVERSION,
            order: 4,
          },
        ],
      },
      {
        name: 'Lead Generation Funnel',
        steps: [
          {
            id: 'step-1',
            name: 'Landing Page View',
            eventType: EventType.PAGE_VIEW,
            order: 1,
          },
          {
            id: 'step-2',
            name: 'Scroll to Form',
            eventType: EventType.SCROLL,
            order: 2,
          },
          {
            id: 'step-3',
            name: 'Form Submit',
            eventType: EventType.FORM_SUBMIT,
            order: 3,
          },
        ],
      },
      {
        name: 'E-commerce Funnel',
        steps: [
          {
            id: 'step-1',
            name: 'Product Page View',
            eventType: EventType.PAGE_VIEW,
            order: 1,
          },
          {
            id: 'step-2',
            name: 'Add to Cart',
            eventType: EventType.CLICK,
            elementId: 'add-to-cart',
            order: 2,
          },
          {
            id: 'step-3',
            name: 'Checkout',
            eventType: EventType.CLICK,
            elementId: 'checkout',
            order: 3,
          },
          {
            id: 'step-4',
            name: 'Purchase',
            eventType: EventType.CONVERSION,
            order: 4,
          },
        ],
      },
    ];
  }
}
