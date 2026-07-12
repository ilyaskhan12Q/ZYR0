import { useState, useEffect, useCallback, useRef } from 'react';
import { getCacheEntry, setCachedData, getCachePolicy } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';
import { registerRefreshCallback } from '@/lib/cache/swr';
import { hasActiveOptimistic } from '@/lib/cache/optimistic';

interface CachedQueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isStale: boolean;
  isRefreshing: boolean;
  error: Error | undefined;
  lastUpdated: number | null;
  lastSource: 'cache' | 'network' | null;
}

interface UseCachedQueryOptions {
  staleAfter?: number;
  enabled?: boolean;
}

/**
 * A generic stale-while-revalidate hook.
 *
 * 1. Returns cached data immediately (even if stale).
 * 2. Triggers a background refresh if the cache is stale or missing.
 * 3. Updates the cache and re-renders when fresh data arrives.
 * 4. Registers for window focus / online refresh events.
 *
 * @param cacheKey - Deterministic cache key (must match the service function's key).
 * @param fetcher - Async function that fetches fresh data (typically a service function).
 * @param options - staleAfter (ms), enabled (boolean).
 */
export function useCachedQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options?: UseCachedQueryOptions
): CachedQueryState<T> & { refresh: () => Promise<void> } {
  const staleAfter = options?.staleAfter;
  const enabled = options?.enabled ?? true;

  const entry = getCacheEntry<T>(cacheKey);
  const [data, setData] = useState<T | undefined>(entry?.data as T | undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const resolveStale = useCallback(() => {
    const e = getCacheEntry<T>(cacheKey);
    if (!e) return false;
    const policy = getCachePolicy(resolvePolicySegment(cacheKey));
    const effectiveStale = staleAfter ?? policy.staleAfter;
    return Date.now() - e.updatedAt > effectiveStale;
  }, [cacheKey, staleAfter]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const fetchId = ++fetchIdRef.current;
    setIsRefreshing(true);
    setError(undefined);

    try {
      const result = await dedupRequest(cacheKey, fetcher);
      if (!mountedRef.current || fetchId !== fetchIdRef.current) return;

      const prev = getCacheEntry<T>(cacheKey)?.data as T | undefined;
      setCachedData(cacheKey, result);

      if (hasDataChanged(prev, result)) {
        setData(result);
      }
    } catch (err) {
      if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, fetcher, enabled]);

  const entryNow = getCacheEntry<T>(cacheKey);
  const isStale = entryNow ? isPastStale(entryNow.updatedAt, staleAfter ?? getPolicyStale(cacheKey)) : false;
  const isLoading = !data && !entryNow;
  const lastUpdated = entryNow?.updatedAt ?? null;
  const lastSource = entryNow?.source ?? null;

  useEffect(() => {
    mountedRef.current = true;
    fetchIdRef.current = 0;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setData(undefined);
    setError(undefined);

    const e = getCacheEntry<T>(cacheKey);
    if (e) setData(e.data as T);

    const hasOptimistic = hasActiveOptimistic(cacheKey);
    if (!hasOptimistic) {
      const needsRefresh = !e || isPastStale(e.updatedAt, staleAfter ?? getPolicyStale(cacheKey));
      if (needsRefresh) refresh();
    }
  }, [cacheKey, enabled, refresh, staleAfter]);

  useEffect(
    () => registerRefreshCallback(cacheKey, () => {
      if (hasActiveOptimistic(cacheKey)) return;
      const e = getCacheEntry<T>(cacheKey);
      if (e) setData(e.data as T);
    }),
    [cacheKey]
  );

  return {
    data,
    isLoading,
    isStale,
    isRefreshing,
    error,
    lastUpdated,
    lastSource,
    refresh,
  };
}

function isPastStale(updatedAt: number, staleAfterMs: number): boolean {
  return Date.now() - updatedAt > staleAfterMs;
}

function getPolicyStale(cacheKey: string): number {
  const segment = resolvePolicySegment(cacheKey);
  return getCachePolicy(segment).staleAfter;
}

function resolvePolicySegment(cacheKey: string): string {
  const first = cacheKey.split('::')[0];
  return first || cacheKey.split('_')[0] || '';
}

function hasDataChanged<T>(a: T | undefined, b: T): boolean {
  if (a === undefined) return true;
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return true;
  }
}
