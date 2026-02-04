/**
 * Server-side LRU cache with TTL support
 * Used for caching database query results to reduce load
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class ServerCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTLMs: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    // If key exists, delete it first
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // If at capacity, remove least recently used (first item)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // Add new item with expiration
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate all keys matching a pattern prefix
  invalidatePattern(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global cache instances for different data types
// Each cache is tuned for its specific use case

// Published page cache - longer TTL since published pages don't change often
// Cache up to 500 pages, 5 minute TTL
export const publishedPageCache = new ServerCache<any>(500, 5 * 60 * 1000);

// Workspace cache - medium TTL for workspace lookups
// Cache up to 200 workspaces, 2 minute TTL
export const workspaceCache = new ServerCache<any>(200, 2 * 60 * 1000);

// Domain resolution cache - for custom domain lookups
// Cache up to 500 domains, 5 minute TTL
export const domainCache = new ServerCache<string | null>(500, 5 * 60 * 1000);

// User cache - for user lookups during authentication
// Cache up to 1000 users, 1 minute TTL
export const userCache = new ServerCache<any>(1000, 60 * 1000);

// Helper function to get or fetch with cache
export async function getOrFetch<T>(
  cache: ServerCache<T>,
  key: string,
  fetcher: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await fetcher();
  cache.set(key, value, ttlMs);
  return value;
}
