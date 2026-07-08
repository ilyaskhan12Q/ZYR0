type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();

/** Get data from cache if it is still valid */
export function getCachedData<T>(key: string, ttlMs: number = 5000): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const isExpired = Date.now() - entry.timestamp > ttlMs;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Store data in the cache with the current timestamp */
export function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/** Clear a specific cache key or all keys matching a prefix */
export function clearCache(keyPrefix?: string): void {
  if (keyPrefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
