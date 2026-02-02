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

export function AnalyticsInit({
  pageId,
  workspaceSlug,
  variantId,
  utmParams,
}: AnalyticsInitProps) {
  useEffect(() => {
    // Initialize the analytics tracker
    const tracker = new AnalyticsTracker({
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
