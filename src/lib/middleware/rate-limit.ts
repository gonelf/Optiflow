/**
 * Rate limiting middleware for API routes
 * Prevents abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the time window
  identifier?: (req: NextRequest) => string; // Custom identifier function
}

/**
 * Rate limit middleware
 * Usage:
 * const limiter = rateLimit({ interval: 60000, maxRequests: 10 });
 * const response = await limiter(request, async () => { ... });
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests, identifier } = config;

  return async function middleware<T>(
    request: NextRequest,
    handler: () => Promise<T>
  ): Promise<T | NextResponse> {
    // Identify the client (IP address or custom identifier)
    const clientId = identifier
      ? identifier(request)
      : getClientIdentifier(request);

    const now = Date.now();
    const key = `${clientId}`;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      entry = {
        count: 0,
        resetAt: now + interval,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetIn = Math.ceil((entry.resetAt - now) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
          },
        }
      );
    }

    // Execute the handler
    const response = await handler();

    // Add rate limit headers to successful responses
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        (maxRequests - entry.count).toString()
      );
      response.headers.set('X-RateLimit-Reset', entry.resetAt.toString());
    }

    return response;
  };
}

/**
 * Get client identifier from request
 * Tries multiple headers to handle proxies and CDNs
 */
function getClientIdentifier(request: NextRequest): string {
  // Try various headers to get the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  // Fallback to a generic identifier
  return 'unknown';
}

// ============================================================================
// PRESET RATE LIMITERS
// ============================================================================

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP
 */
export const authRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 5,
});

/**
 * Rate limiter for AI endpoints
 * 10 requests per minute per user
 */
export const aiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 10,
  identifier: (req) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = req.headers.get('x-user-id');
    return userId || getClientIdentifier(req);
  },
});

/**
 * Rate limiter for analytics ingestion
 * 1000 requests per minute per workspace
 */
export const analyticsRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 1000,
  identifier: (req) => {
    const workspaceId = req.headers.get('x-workspace-id');
    return workspaceId || getClientIdentifier(req);
  },
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per user/IP
 */
export const apiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100,
  identifier: (req) => {
    const userId = req.headers.get('x-user-id');
    return userId || getClientIdentifier(req);
  },
});

/**
 * Rate limiter for webhook endpoints
 * 500 requests per minute per workspace
 */
export const webhookRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 500,
  identifier: (req) => {
    const workspaceId = req.headers.get('x-workspace-id');
    return workspaceId || getClientIdentifier(req);
  },
});

/**
 * Rate limiter for public pages
 * 1000 requests per minute per IP (generous for legitimate traffic)
 */
export const publicPageRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 1000,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a custom rate limiter with specific configuration
 */
export function createRateLimiter(
  maxRequests: number,
  intervalMinutes: number = 1
) {
  return rateLimit({
    interval: intervalMinutes * 60 * 1000,
    maxRequests,
  });
}

/**
 * Clear rate limit for a specific identifier (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string): {
  count: number;
  resetAt: number;
  remaining: number;
} | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return null;

  return {
    count: entry.count,
    resetAt: entry.resetAt,
    remaining: Math.max(0, entry.count),
  };
}
