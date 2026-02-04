import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { LRUCache } from '@/lib/lru-cache';

// Session cache to reduce database lookups
// Cache up to 10,000 sessions (about 1-2MB of memory)
const sessionCache = new LRUCache<string, any>(10000);

/**
 * POST /api/analytics/track
 * Track analytics events for A/B testing and general analytics
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 300 requests per minute per IP
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkRateLimit(clientIp, 300, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetTime: rateLimitResult.resetTime },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '300',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { events, workspaceSlug, pageId } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Events array is required' }, { status: 400 });
    }

    if (!workspaceSlug || !pageId) {
      return NextResponse.json(
        { error: 'Workspace slug and page ID are required' },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Process events in batches
    const sessions: Map<string, any> = new Map();
    const analyticsEvents: any[] = [];

    for (const event of events) {
      const { sessionId, variantId, eventType, eventName, eventData, ...eventProps } = event;

      // Get or create session
      let session = sessions.get(sessionId);

      if (!session) {
        // Check cache first
        session = sessionCache.get(sessionId);

        if (!session) {
          // Check if session exists in database
          const existingSession = await prisma.analyticsSession.findUnique({
            where: { sessionId },
          });

          if (existingSession) {
            session = existingSession;
            // Cache the found session
            sessionCache.set(sessionId, session);
          } else {
            // Create new session
            const visitorId = eventData?.visitorId || `visitor_${Date.now()}`;
            const userAgent = request.headers.get('user-agent') || undefined;

            session = await prisma.analyticsSession.create({
              data: {
                sessionId,
                visitorId,
                pageId,
                workspaceId: page.workspaceId,
                variantId: variantId || null,
                referrer: eventData?.referrer || null,
                utmSource: eventData?.utmSource || null,
                utmMedium: eventData?.utmMedium || null,
                utmCampaign: eventData?.utmCampaign || null,
                userAgent,
                startedAt: new Date(),
              },
            });

            // Cache the new session
            sessionCache.set(sessionId, session);
          }
        }

        sessions.set(sessionId, session);
      }

      // Create analytics event
      analyticsEvents.push({
        eventType,
        eventName,
        eventData: eventData || {},
        sessionId: session.id,
        variantId: variantId || null,
        elementId: eventProps.elementId || null,
        elementType: eventProps.elementType || null,
        elementText: eventProps.elementText || null,
        xPosition: eventProps.xPosition || null,
        yPosition: eventProps.yPosition || null,
        scrollDepth: eventProps.scrollDepth || null,
        isConversion: eventProps.isConversion || false,
        conversionValue: eventProps.conversionValue || null,
        timestamp: eventProps.timestamp ? new Date(eventProps.timestamp) : new Date(),
      });
    }

    // Bulk insert analytics events
    if (analyticsEvents.length > 0) {
      await prisma.analyticsEvent.createMany({
        data: analyticsEvents,
      });
    }

    // Update variant metrics for conversions - batched using Promise.all
    const variantConversions: Map<string, number> = new Map();
    const variantImpressions: Map<string, number> = new Map();

    for (const event of events) {
      if (event.variantId) {
        // Count impression
        variantImpressions.set(
          event.variantId,
          (variantImpressions.get(event.variantId) || 0) + 1
        );

        // Count conversion
        if (event.isConversion) {
          variantConversions.set(
            event.variantId,
            (variantConversions.get(event.variantId) || 0) + 1
          );
        }
      }
    }

    // Batch update variant metrics using transactions for atomicity
    if (variantImpressions.size > 0) {
      await prisma.$transaction(async (tx) => {
        const updatePromises = Array.from(variantImpressions.entries()).map(
          async ([variantId, impressions]) => {
            const conversions = variantConversions.get(variantId) || 0;

            // Update impressions and conversions
            const variant = await tx.pageVariant.update({
              where: { id: variantId },
              data: {
                impressions: { increment: impressions },
                conversions: { increment: conversions },
              },
            });

            // Calculate and update conversion rate in same transaction
            const conversionRate = variant.impressions > 0
              ? variant.conversions / variant.impressions
              : 0;

            return tx.pageVariant.update({
              where: { id: variantId },
              data: { conversionRate },
            });
          }
        );

        await Promise.all(updatePromises);
      });
    }

    return NextResponse.json(
      { success: true, eventsProcessed: events.length },
      {
        headers: {
          'X-RateLimit-Limit': '300',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Failed to track analytics events:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics events' },
      { status: 500 }
    );
  }
}
