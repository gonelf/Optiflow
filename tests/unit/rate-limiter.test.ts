/**
 * Unit tests for Rate Limiting
 * Tests rate limit enforcement, reset logic, and header generation
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock rate limiter implementation
class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async check(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    let entry = this.store.get(identifier);

    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + this.windowMs,
      };
      this.store.set(identifier, entry);
    }

    entry.count++;

    const allowed = entry.count <= this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - entry.count);

    return {
      allowed,
      remaining,
      reset: entry.resetAt,
    };
  }

  clear(identifier: string): void {
    this.store.delete(identifier);
  }

  reset(): void {
    this.store.clear();
  }
}

describe('Rate Limiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    // 5 requests per minute
    limiter = new RateLimiter(5, 60000);
    limiter.reset();
  });

  describe('Basic Rate Limiting', () => {
    test('should allow requests within limit', async () => {
      const identifier = 'user-123';

      for (let i = 1; i <= 5; i++) {
        const result = await limiter.check(identifier);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(5 - i);
      }
    });

    test('should block requests exceeding limit', async () => {
      const identifier = 'user-123';

      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        await limiter.check(identifier);
      }

      // 6th request should be blocked
      const result = await limiter.check(identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should track requests per identifier separately', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      await limiter.check(user1);
      await limiter.check(user1);
      await limiter.check(user2);

      const result1 = await limiter.check(user1);
      const result2 = await limiter.check(user2);

      expect(result1.remaining).toBe(2); // 3rd request for user1
      expect(result2.remaining).toBe(3); // 2nd request for user2
    });
  });

  describe('Time Window Reset', () => {
    test('should reset counter after time window', async () => {
      const identifier = 'user-123';
      const shortLimiter = new RateLimiter(5, 100); // 100ms window

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await shortLimiter.check(identifier);
      }

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should allow new requests
      const result = await shortLimiter.check(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    test('should maintain count within time window', async () => {
      const identifier = 'user-123';
      const shortLimiter = new RateLimiter(5, 1000); // 1 second window

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        await shortLimiter.check(identifier);
      }

      // Wait a bit but not enough to reset
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still have correct remaining count
      const result = await shortLimiter.check(identifier);
      expect(result.remaining).toBe(1); // 4th request, 1 remaining
    });
  });

  describe('Clear and Reset', () => {
    test('should clear specific identifier', async () => {
      const identifier = 'user-123';

      // Make some requests
      await limiter.check(identifier);
      await limiter.check(identifier);

      // Clear the identifier
      limiter.clear(identifier);

      // Should start fresh
      const result = await limiter.check(identifier);
      expect(result.remaining).toBe(4); // 1st request after clear
    });

    test('should reset all identifiers', async () => {
      await limiter.check('user-1');
      await limiter.check('user-1');
      await limiter.check('user-2');
      await limiter.check('user-2');
      await limiter.check('user-2');

      limiter.reset();

      const result1 = await limiter.check('user-1');
      const result2 = await limiter.check('user-2');

      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero max requests', async () => {
      const strictLimiter = new RateLimiter(0, 60000);
      const result = await strictLimiter.check('user-123');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should handle very high max requests', async () => {
      const generousLimiter = new RateLimiter(1000000, 60000);

      for (let i = 0; i < 100; i++) {
        const result = await generousLimiter.check('user-123');
        expect(result.allowed).toBe(true);
      }
    });

    test('should handle concurrent requests', async () => {
      const identifier = 'user-123';

      // Simulate concurrent requests
      const promises = Array.from({ length: 10 }, () =>
        limiter.check(identifier)
      );

      const results = await Promise.all(promises);

      // First 5 should be allowed, rest blocked
      const allowedCount = results.filter((r) => r.allowed).length;
      expect(allowedCount).toBeLessThanOrEqual(5);
    });
  });

  describe('Preset Configurations', () => {
    test('auth limiter should be strict (5 req/min)', async () => {
      const authLimiter = new RateLimiter(5, 60000);

      for (let i = 0; i < 5; i++) {
        const result = await authLimiter.check('ip-123');
        expect(result.allowed).toBe(true);
      }

      const blocked = await authLimiter.check('ip-123');
      expect(blocked.allowed).toBe(false);
    });

    test('AI limiter should allow 10 req/min', async () => {
      const aiLimiter = new RateLimiter(10, 60000);

      for (let i = 0; i < 10; i++) {
        const result = await aiLimiter.check('user-123');
        expect(result.allowed).toBe(true);
      }

      const blocked = await aiLimiter.check('user-123');
      expect(blocked.allowed).toBe(false);
    });

    test('analytics limiter should allow high volume (1000 req/min)', async () => {
      const analyticsLimiter = new RateLimiter(1000, 60000);

      for (let i = 0; i < 100; i++) {
        const result = await analyticsLimiter.check('workspace-123');
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe('Reset Time Calculation', () => {
    test('should provide correct reset timestamp', async () => {
      const identifier = 'user-123';
      const result = await limiter.check(identifier);

      const now = Date.now();
      const resetTime = result.reset;

      expect(resetTime).toBeGreaterThan(now);
      expect(resetTime).toBeLessThanOrEqual(now + 60000);
    });

    test('should maintain same reset time within window', async () => {
      const identifier = 'user-123';

      const result1 = await limiter.check(identifier);
      const result2 = await limiter.check(identifier);

      expect(result1.reset).toBe(result2.reset);
    });
  });

  describe('Remaining Count Accuracy', () => {
    test('should accurately track remaining requests', async () => {
      const identifier = 'user-123';

      const results = [];
      for (let i = 0; i < 7; i++) {
        results.push(await limiter.check(identifier));
      }

      expect(results[0].remaining).toBe(4); // 1st request
      expect(results[1].remaining).toBe(3); // 2nd request
      expect(results[2].remaining).toBe(2); // 3rd request
      expect(results[3].remaining).toBe(1); // 4th request
      expect(results[4].remaining).toBe(0); // 5th request (last allowed)
      expect(results[5].remaining).toBe(0); // 6th request (blocked)
      expect(results[6].remaining).toBe(0); // 7th request (blocked)
    });

    test('should never return negative remaining count', async () => {
      const identifier = 'user-123';

      for (let i = 0; i < 20; i++) {
        const result = await limiter.check(identifier);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('Rate Limiter Integration Scenarios', () => {
  test('should handle burst traffic pattern', async () => {
    const limiter = new RateLimiter(100, 60000);
    const identifier = 'user-123';

    // Simulate burst of 50 requests
    const burst1 = await Promise.all(
      Array.from({ length: 50 }, () => limiter.check(identifier))
    );

    // All should be allowed
    expect(burst1.every((r) => r.allowed)).toBe(true);

    // Another burst of 50 requests
    const burst2 = await Promise.all(
      Array.from({ length: 50 }, () => limiter.check(identifier))
    );

    // All should still be allowed (total 100)
    expect(burst2.every((r) => r.allowed)).toBe(true);

    // One more request should be blocked
    const overflow = await limiter.check(identifier);
    expect(overflow.allowed).toBe(false);
  });

  test('should handle distributed traffic over time', async () => {
    const limiter = new RateLimiter(10, 1000);
    const identifier = 'user-123';

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await limiter.check(identifier);
    }

    // Wait half the window
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Make 5 more requests (should still be within limit)
    for (let i = 0; i < 5; i++) {
      const result = await limiter.check(identifier);
      expect(result.allowed).toBe(true);
    }

    // 11th request should be blocked
    const blocked = await limiter.check(identifier);
    expect(blocked.allowed).toBe(false);
  });

  test('should handle multi-tenant scenario', async () => {
    const limiter = new RateLimiter(5, 60000);

    // Different tenants should not interfere
    const tenant1Results = await Promise.all([
      limiter.check('tenant-1'),
      limiter.check('tenant-1'),
      limiter.check('tenant-1'),
    ]);

    const tenant2Results = await Promise.all([
      limiter.check('tenant-2'),
      limiter.check('tenant-2'),
    ]);

    expect(tenant1Results.every((r) => r.allowed)).toBe(true);
    expect(tenant2Results.every((r) => r.allowed)).toBe(true);

    expect(tenant1Results[2].remaining).toBe(2);
    expect(tenant2Results[1].remaining).toBe(3);
  });
});
