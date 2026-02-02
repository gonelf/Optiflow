'use client';

import { useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/analytics/tracker';

interface AnalyticsInitProps {
  pageId: string;
  workspaceSlug: string;
  variantId?: string | null;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

/**
 * Generate or retrieve session ID
 * Session ID persists in sessionStorage for the duration of the browser session
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  const storageKey = 'optiflow_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

export function AnalyticsInit({
  pageId,
  workspaceSlug,
  variantId,
  utmParams,
}: AnalyticsInitProps) {
  useEffect(() => {
    // Generate or retrieve session ID
    const sessionId = getOrCreateSessionId();

    // Initialize the analytics tracker
    const tracker = new AnalyticsTracker({
      sessionId,
      workspaceSlug,
      pageId,
      variantId: variantId || undefined,
      batchSize: 10,
      batchInterval: 5000, // 5 seconds
    });

    // Initialize with UTM parameters
    tracker.init({
      referrer: document.referrer,
      utmSource: utmParams?.source,
      utmMedium: utmParams?.medium,
      utmCampaign: utmParams?.campaign,
    });

    // Cleanup on unmount
    return () => {
      // Flush any remaining events
      (tracker as any).flush?.();
    };
  }, [pageId, workspaceSlug, variantId, utmParams]);

  return null; // This component doesn't render anything
}
