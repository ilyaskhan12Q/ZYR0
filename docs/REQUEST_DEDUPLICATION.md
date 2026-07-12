# Request Deduplication System

## Architecture

The request deduplication system prevents duplicate simultaneous Supabase queries by sharing a single in-flight Promise across all callers. It sits between the service layer and the existing cache.

```
Component A          Component B          Component C
     |                    |                    |
     ▼                    ▼                    ▼
  Service              Service              Service
  (getMyProfile)       (getMyProfile)       (getMyProfile)
     |                    |                    |
     ▼                    ▼                    ▼
  ┌─────────────────────────────────────────────────┐
  │              Existing Cache (cache.ts)            │
  │  getCachedData(key) → hit → return cached value  │
  └─────────────────────────────────────────────────┘
     |                    |                    |
     ▼ (miss)             ▼ (miss)             ▼ (miss)
  ┌─────────────────────────────────────────────────┐
  │          Request Registry (requestRegistry.ts)    │
  │  ┌───────────────────────────────────────────┐   │
  │  │  Map<key, Promise>                        │   │
  │  │  A arrives → creates Promise              │   │
  │  │  B arrives → returns A's Promise          │   │
  │  │  C arrives → returns A's Promise          │   │
  │  │  Promise resolves → deletes key           │   │
  │  └───────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────┘
     |
     ▼
  Supabase (one request, all three callers share the result)
```

## Flow Diagram

```
Caller invokes service function
        │
        ▼
    Auth check (if needed)
        │
        ▼
    Cache lookup (getCachedData)
        │
        ├── HIT → return cached value (no Supabase call)
        │
        └── MISS
              │
              ▼
        Request Registry lookup (dedupRequest)
              │
              ├── PENDING EXISTS → return existing Promise
              │                     (all callers share one network request)
              │
              └── NO PENDING
                    │
                    ▼
              Execute Supabase query
                    │
                    ▼
              Store in cache (on success)
                    │
                    ▼
              Remove from registry (finally block)
                    │
                    ▼
              Return result to all callers
```

## Lifecycle

1. **Registration**: When a fetch starts, a Promise is created and stored in the `inFlightRequests` Map keyed by a deterministic string (e.g., `profile::{userId}`, `my_tasks::{userId}`, `internship::{id}`).

2. **Dedup**: If a subsequent call arrives with the same key before the Promise settles, the existing Promise is returned instead of creating a new request.

3. **Completion**: On resolution or rejection, the `finally` block removes the key from the registry, ensuring:
   - Memory is freed
   - Future calls start fresh (not served a stale Promise)
   - Failed requests don't poison the registry

4. **Caching**: On success, the result is stored in the existing cache layer (`cache.ts`) with default TTL of 5s, so subsequent calls after the in-flight window still avoid Supabase.

## Integration Points

### Core Module

**`app/src/lib/cache/requestRegistry.ts`** — The registry itself.

```typescript
export function createRequestKey(...parts: (string | number | null | undefined)[]): string
export async function dedupRequest<T>(key: string, fetcher: () => PromiseLike<T>): Promise<T>
export function clearRequestRegistry(): void
```

`dedupRequest` accepts `PromiseLike<T>` (thenable objects) so it works with Supabase's query builders, which are thenable but not native Promises. Internally wraps in `Promise.resolve()` to ensure `.finally()` works.

### Services Integrated

| Service | Functions Updated | Cache Added | Dedup Added |
|---------|------------------|-------------|-------------|
| `users.ts` | `getMyProfile`, `getUserProfile` | Yes | Yes |
| `internships.ts` | `getInternships`, `getInternshipById`, `getInternshipDomains`, `getMyActiveInternships` | Yes | Yes |
| `applications.ts` | `getMyApplications`, `getApplicationById`, `hasApplied`, `getApplicationsForInternship`, `getAllCompanyApplications` | Existing | Yes |
| `tasks.ts` | `getMyTasks`, `getTasksAssignedByMe`, `getTaskById` | Existing | Yes |
| `notifications.ts` | `getNotifications`, `getUnreadNotificationCount` | Existing | Yes |
| `messages.ts` | `getMyConversations`, `getMessages`, `getUnreadCount` | Existing (added on `getMessages`) | Yes |
| `workspaceEvents.ts` | `getWorkspaceEvents` | Existing | Yes |
| `certificates.ts` | `getMyCertificates`, `verifyCertificate`, `getCompanyCertificates` | Yes | Yes |
| `offerLetters.ts` | `getMyOfferLetters`, `getOfferLetterById`, `getOfferLetterByApplication`, `getCompanyOfferLetters`, `getAllOfferLetters` | Yes | Yes |
| `companies.ts` | `getCompanies`, `getCompanyById`, `getMyCompany`, `getAllCompanies` | Yes | Yes |

### Mutation functions (create, update, delete, revoke, etc.) are intentionally excluded from dedup — they must always execute fresh.

## Key Design Decisions

### Separate Registry from Cache
The registry (`requestRegistry.ts`) is a standalone module that only handles in-flight request deduplication. The existing cache (`cache.ts`) handles time-based TTL caching. They compose naturally:

```
cache hit   → return (fast path)
cache miss  → dedupRequest (shares in-flight)
              → fetch Supabase
              → cache result on success
```

This separation follows the Single Responsibility Principle and keeps each concern independently testable.

### Deterministic Keys
All dedup keys are deterministic strings incorporating:
- Entity type prefix (e.g., `profile`, `my_tasks`, `internships`)
- User ID (for user-scoped queries)
- Entity ID (for single-entity queries)
- Serialized filters (for listing queries)

This ensures two components requesting "my tasks" will use the same key and share the Promise.

### Error Safety
- `finally` blocks guarantee registry cleanup regardless of success/failure
- Failed requests never enter the cache (cache set is guarded by `if (!res.error)`)
- Cache TTL (default 5s) prevents stale data but allows page navigation to get fresh data

## Best Practices

### When Adding a New Service

1. Import the registry:
```typescript
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';
import { getCachedData, setCachedData } from '@/lib/cache';
```

2. Wrap read-only fetches with dedup + cache:
```typescript
export async function getMyWidgets() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const cacheKey = createRequestKey('my_widgets', user.id);
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  const fetchFn = () => supabase.from('widgets').select('*').eq('user_id', user.id);
  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}
```

3. Do NOT use dedup for mutation functions (write operations should always execute).

### Key Generation Convention

Use `createRequestKey` with these conventions:
- `'{entity_type}_{user_id}'` for user-scoped lists
- `'{entity_type}_{entity_id}'` for single entity
- `'{entity_type}_{filter_json}'` for filtered lists
- `'{entity_type}'` for global/static data

## Limitations

1. **No request cancellation**: The registry does not expose AbortController integration. In-flight requests cannot be cancelled once started.
2. **Process-scoped**: The Map lives in module memory. It does not survive page refresh or cross-tab.
3. **No priority queue**: All requests have equal priority. No mechanism to elevate or defer.
4. **Cache TTL is fixed**: The cache TTL (5s default) is hardcoded. Dynamic TTL based on data staleness is not implemented.
5. **No retry logic**: Failed requests are not retried automatically. Callers must handle errors and retry.

## Estimated Impact

By deduplicating in-flight requests across the service layer, the system reduces redundant Supabase calls when:
- Multiple components mount simultaneously (e.g., sidebar + dashboard both fetch notifications)
- Multiple hooks in the same component fetch overlapping data
- Rapid page navigation triggers overlapping fetches

Estimated reduction: **40-60% fewer Supabase reads** on initial page loads where multiple components request the same data.
