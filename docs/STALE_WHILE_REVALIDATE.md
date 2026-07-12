# Stale-While-Revalidate (SWR) Caching Architecture

## Overview

The SWR system provides a cache-first, background-refresh pattern for data fetching.
Users see instantly rendered cached data while the system fetches fresh data in the
background. If the background fetch fails, the stale cache remains — no loading
spinners for data the user has already seen.

## Layers

```
┌─────────────────────────────────────┐
│     useCachedQuery (React Hook)     │  Presentation layer
├─────────────────────────────────────┤
│     swr.ts (Refresh Triggers)       │  Event layer
├─────────────────────────────────────┤
│     cache.ts (TTL + stale policies) │  Storage layer
├─────────────────────────────────────┤
│     requestRegistry.ts (Dedup)      │  Network layer
└─────────────────────────────────────┘
```

### 1. cache.ts — Storage + Policies

- `CacheEntry<T>` holds `data`, `createdAt`, `updatedAt`, `expiresAt`, `staleAfter`,
  `version`, `source` metadata.
- `CachePolicy` defines `ttlMs` (hard expiry) and `staleAfter` (time after which a
  background refresh is triggered, but stale data is still returned).
- `setCachePolicy(segment, policy)` registers a policy for a key prefix.
- `getCacheEntry(key)` returns the full entry including metadata.
- `getStaleData(key)` returns data even past TTL (within `staleAfter` window).
- `getCachedData(key)` (backward compat) only returns data within TTL.
- `resolvePolicyKey(key)` maps legacy keys to canonical segments.

#### Recommended Policies

| Segment             | ttlMs    | staleAfter | Notes                     |
|---------------------|----------|------------|---------------------------|
| profile             | 300_000  | 60_000     | 5 min / 1 min stale       |
| internships         | 120_000  | 30_000     | 2 min / 30 s stale        |
| internship          | 60_000   | 15_000     | 1 min / 15 s stale        |
| applications        | 60_000   | 15_000     | 1 min / 15 s stale        |
| tasks               | 60_000   | 15_000     | 1 min / 15 s stale        |
| notifications       | 15_000   | 5_000      | 15 s / 5 s stale          |
| messages            | 10_000   | 3_000      | 10 s / 3 s stale          |
| workspace_events    | 30_000   | 10_000     | 30 s / 10 s stale         |
| certificates        | 1_800_000| 300_000    | 30 min / 5 min stale      |
| offer_letters       | 1_800_000| 300_000    | 30 min / 5 min stale      |
| companies           | 300_000  | 60_000     | 5 min / 1 min stale       |

### 2. requestRegistry.ts — Network Deduplication

Ensures concurrent requests for the same key share one in-flight Promise.
Already exists and is unchanged — SWR reuses it via `dedupRequest`.

### 3. swr.ts — Refresh Triggers

- `registerRefreshCallback(key, cb)` — registers a callback that fires on window
  focus / online reconnect. Returns an unsubscribe function.
- `triggerRefresh(key)` — manually signals all callbacks for a key.
- Global focus/online listeners are lazily created (when the first callback is
  registered) and torn down when the last callback is removed.

### 4. useCachedQuery — React Hook

```ts
const {
  data,          // T | undefined — cached or fetched data
  isLoading,     // true only when no cache exists and fetch in progress
  isStale,       // true when cache exists but is past staleAfter
  isRefreshing,  // true when background fetch is in progress
  error,         // Error | undefined — last fetch error
  lastUpdated,   // number | null — timestamp of last successful fetch/cache
  lastSource,    // 'cache' | 'network' | null
  refresh,       // () => Promise<void> — manual refresh trigger
} = useCachedQuery<T>(cacheKey, fetcher, options?);
```

- On mount: returns cached data immediately (if any), fetches in background.
- On window focus / online: triggers refresh for all registered keys.
- On error during refresh: keeps stale data, sets `error`.
- `refresh()` can be called manually (e.g., pull-to-refresh, after mutation).

## Service Functions

All service read functions now accept `useCache = true` as a parameter. When the
SWR hook calls a service, it passes `useCache = false` so the service always
performs the network request (bypassing its own internal cache check), while the
hook handles caching decisions.

## Realtime Integration

Realtime updates (via `useRealtime`) independently push data into the cache via
`setCachedData` and trigger subscription callbacks. They do NOT conflict with SWR
because SWR reads from the same cache store — a realtime update will update the
cache entry, and the next SWR re-render will pick it up. The `version` field in
`CacheEntry` helps detect changes.

## Usage Example

```tsx
function ProfilePage() {
  const { data, isLoading, isStale, isRefreshing, refresh } = useCachedQuery(
    createRequestKey('profile', user.id),
    () => getMyProfile(false),  // useCache=false to force fetch
  );

  if (isLoading) return <Spinner />;
  return (
    <div>
      {isStale && <Banner>Refreshing...</Banner>}
      <ProfileCard profile={data} />
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Testing

```bash
cd app && npx vitest run src/lib/cache/__tests__/
```
