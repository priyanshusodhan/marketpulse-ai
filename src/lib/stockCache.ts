// In-memory cache with TTL to prevent rate limits
// TTL: 45 seconds for quotes/indices, 5 min for charts

const CACHE_TTL_FAST = 45 * 1000; // 45 seconds
const CACHE_TTL_SLOW = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttl = CACHE_TTL_FAST): void {
  cache.set(key, { data, ts: Date.now(), ttl });
}

export function cacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(":")}`;
}

export { CACHE_TTL_FAST, CACHE_TTL_SLOW };
