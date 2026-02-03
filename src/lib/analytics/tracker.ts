/**
 * Analytics Event Tracker
 *
 * Client-side tracking library for capturing user interactions,
 * page views, and conversions for A/B testing and analytics.
 */

export type EventType =
  | 'PAGE_VIEW'
  | 'CLICK'
  | 'FORM_SUBMIT'
  | 'SCROLL'
  | 'TIME_ON_PAGE'
  | 'CONVERSION'
  | 'CUSTOM';

export interface TrackingEvent {
  eventType: EventType;
  eventName: string;
  eventData?: Record<string, any>;
  sessionId: string;
  variantId?: string;
  elementId?: string;
  elementType?: string;
  elementText?: string;
  xPosition?: number;
  yPosition?: number;
  scrollDepth?: number;
  isConversion?: boolean;
  conversionValue?: number;
  timestamp?: number;
}

export interface TrackerConfig {
  sessionId: string;
  variantId?: string;
  workspaceSlug: string;
  pageId: string;
  apiEndpoint?: string;
  batchSize?: number;
  batchInterval?: number;
  enableAutoTracking?: boolean;
}

/**
 * Internal config type with required defaults but optional variantId
 */
type ResolvedTrackerConfig = Required<Omit<TrackerConfig, 'variantId'>> & {
  variantId?: string;
};

/**
 * Analytics Tracker Class
 */
export class AnalyticsTracker {
  private config: ResolvedTrackerConfig;
  private eventQueue: TrackingEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: number;

  constructor(config: TrackerConfig) {
    this.config = {
      ...config,
      apiEndpoint: config.apiEndpoint || '/api/analytics/track',
      batchSize: config.batchSize || 10,
      batchInterval: config.batchInterval || 5000, // 5 seconds
      enableAutoTracking: config.enableAutoTracking ?? true,
    };

    this.sessionStartTime = Date.now();

    if (this.config.enableAutoTracking) {
      this.setupAutoTracking();
    }

    // Track page view on initialization
    this.trackPageView();
  }

  /**
   * Sets up automatic event tracking
   */
  private setupAutoTracking() {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (e) => {
      this.handleClick(e);
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = this.calculateScrollDepth();
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackScroll(scrollDepth);
      }
    });

    // Track time on page before unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      this.track({
        eventType: 'TIME_ON_PAGE',
        eventName: 'session_duration',
        eventData: { duration: timeOnPage },
        sessionId: this.config.sessionId,
        variantId: this.config.variantId,
      });
      this.flush(); // Send immediately
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });
  }

  /**
   * Handles click events
   */
  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const elementType = target.tagName.toLowerCase();
    const elementId = target.id || undefined;
    const elementText = target.textContent?.trim().substring(0, 100) || undefined;

    this.track({
      eventType: 'CLICK',
      eventName: 'element_click',
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      elementId,
      elementType,
      elementText,
      xPosition: event.clientX,
      yPosition: event.clientY,
    });
  }

  /**
   * Handles form submissions
   */
  private handleFormSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;
    const formId = form.id || undefined;

    this.track({
      eventType: 'FORM_SUBMIT',
      eventName: 'form_submission',
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      elementId: formId,
      elementType: 'form',
    });
  }

  /**
   * Calculates current scroll depth as percentage
   */
  private calculateScrollDepth(): number {
    if (typeof window === 'undefined') return 0;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (documentHeight <= windowHeight) return 100;

    return Math.min(100, Math.round(((scrollTop + windowHeight) / documentHeight) * 100));
  }

  /**
   * Tracks a page view
   */
  trackPageView(pageName?: string) {
    this.track({
      eventType: 'PAGE_VIEW',
      eventName: pageName || 'page_view',
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      eventData: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    });
  }

  /**
   * Tracks a scroll event
   */
  trackScroll(scrollDepth: number) {
    // Only track at certain milestones to reduce noise
    const milestones = [25, 50, 75, 100];
    if (!milestones.includes(Math.floor(scrollDepth / 25) * 25)) return;

    this.track({
      eventType: 'SCROLL',
      eventName: 'scroll_depth',
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      scrollDepth,
    });
  }

  /**
   * Tracks a conversion event
   */
  trackConversion(eventName: string, value?: number, data?: Record<string, any>) {
    this.track({
      eventType: 'CONVERSION',
      eventName,
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      isConversion: true,
      conversionValue: value,
      eventData: data,
    });
  }

  /**
   * Tracks a custom event
   */
  trackCustom(eventName: string, data?: Record<string, any>) {
    this.track({
      eventType: 'CUSTOM',
      eventName,
      sessionId: this.config.sessionId,
      variantId: this.config.variantId,
      eventData: data,
    });
  }

  /**
   * Core tracking method
   */
  track(event: TrackingEvent) {
    const fullEvent: TrackingEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.eventQueue.push(fullEvent);

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    } else {
      // Schedule batch send
      this.scheduleBatch();
    }
  }

  /**
   * Schedules a batch send
   */
  private scheduleBatch() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flush();
    }, this.config.batchInterval);
  }

  /**
   * Flushes the event queue
   */
  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          workspaceSlug: this.config.workspaceSlug,
          pageId: this.config.pageId,
        }),
        keepalive: true, // Ensures request completes even if page is closing
      });

      if (!response.ok) {
        console.error('Failed to send analytics events:', response.statusText);
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Error sending analytics events:', error);
      // Re-queue events on error
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Destroys the tracker and cleans up
   */
  destroy() {
    this.flush();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}

/**
 * Creates a tracker instance
 */
export function createTracker(config: TrackerConfig): AnalyticsTracker {
  return new AnalyticsTracker(config);
}

/**
 * Generates a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generates a visitor fingerprint (basic implementation)
 */
export function generateVisitorId(): string {
  if (typeof window === 'undefined') return 'unknown';

  // Check for existing visitor ID in localStorage
  const stored = localStorage.getItem('reoptimize_visitor_id');
  if (stored) return stored;

  // Create new visitor ID
  const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  localStorage.setItem('reoptimize_visitor_id', visitorId);

  return visitorId;
}
