# Optimistic Update System

## Architecture

The Optimistic Update layer sits between UI components and the mutation service layer. It intercepts mutations, immediately updates the client-side cache with the expected result, then executes the real network request.

```
User Action
     │
     ▼
Component calls mutate()
     │
     ├── 1. beginTransaction() → snapshot affected cache entries
     │
     ├── 2. optimisticUpdate() → write predicted result to cache
     │      ↓ UI re-renders immediately with optimistic data
     │
     ├── 3. mutationFn() → execute real network request
     │
     ├── 4a. SUCCESS → commitTransaction()
     │      (optimistic state becomes permanent)
     │
     └── 4b. FAILURE → rollbackTransaction()
            (cache restored to pre-mutation snapshot)
```

## Layers

```
┌──────────────────────────────────────┐
│  useOptimisticMutation (React Hook)  │  Integration layer
├──────────────────────────────────────┤
│  optimistic.ts (Transaction Manager) │  Coordination layer
├──────────────────────────────────────┤
│  cache.ts (Storage + Policies)       │  Storage layer
├──────────────────────────────────────┤
│  requestRegistry.ts (Dedup)          │  Network layer (reads only)
└──────────────────────────────────────┘
```

## Transaction Lifecycle

### 1. Begin

`beginTransaction(affectedKeys)` is called when a mutation starts:

- Generates a unique `transactionId` (`opt_{timestamp}_{counter}`)
- Snapshots all `CacheEntry` objects for the affected keys
- Stores the transaction in `activeTransactions` map
- Returns the `transactionId`

### 2. Optimistic Update

After the transaction begins, the caller applies the predicted cache state via `setCachedData()` or `setCachedDataWithPolicy()`. This immediately updates the UI since `useCachedQuery` and other cache reads return the updated data.

### 3. Network Request

The real mutation function executes. This is the original service function — no modifications needed.

### 4a. Commit

On success, `commitTransaction(transactionId)`:

- Marks the transaction as `committed`
- Cleans up the transaction (removes from `activeTransactions`, removes key mappings)
- The optimistic state stays in the cache (it was correct)
- SWR refreshes naturally on next stale check

### 4b. Rollback

On failure, `rollbackTransaction(transactionId)`:

- Iterates all snapshotted keys
- For each key, checks if a newer pending transaction has modified it
  - If a newer transaction exists → skip rollback for that key (conflict protection)
  - Otherwise → restore the original `CacheEntry` via `restoreCacheEntry()`
- Marks the transaction as `rolled_back`
- Cleans up the transaction

## Files

| File | Purpose |
|------|---------|
| `app/src/lib/cache.ts` | Exports `CacheEntry`, `restoreCacheEntry()`, `deleteCacheEntry()` |
| `app/src/lib/cache/optimistic.ts` | Core transaction manager |
| `app/src/hooks/useOptimisticMutation.ts` | Generic React hook |
| `app/src/hooks/useCachedQuery.ts` | Updated with optimistic awareness |
| `docs/OPTIMISTIC_UPDATES.md` | This document |

## Core API

### optimistic.ts

```typescript
// Start a transaction and snapshot affected cache keys
function beginTransaction(keys: string[]): string

// Mark a transaction as successfully committed
function commitTransaction(transactionId: string): void

// Roll back all changes made by the transaction
function rollbackTransaction(transactionId: string): void

// Check if any optimistic transaction is active for a key
function hasActiveOptimistic(key: string): boolean

// Get all active transactions that affect a key
function getActiveTransactionsForKey(key: string): OptimisticTransaction[]

// Get total active transaction count
function countActiveTransactions(): number

// Clear all transactions (e.g., on logout)
function clearAllTransactions(): void
```

### useOptimisticMutation

```typescript
function useOptimisticMutation<TData, TArgs extends unknown[]>(options: {
  mutationFn: (...args: TArgs) => Promise<TData>;
  cacheKeys: string[];
  optimisticUpdate: (...args: TArgs) => void;
  onSuccess?: (data: TData, ...args: TArgs) => void;
  onError?: (error: Error, ...args: TArgs) => void;
}): {
  mutate: (...args: TArgs) => Promise<TData | undefined>;
  isLoading: boolean;
  error: Error | null;
};
```

## Rollback Strategy

### Snapshot-Restore

When a transaction begins, the current `CacheEntry` for each affected key is deep-copied into the transaction's `snapshots` map. On rollback:

1. If the snapshot was `null` (key didn't exist): the cache entry is deleted via `deleteCacheEntry()`, but only if no subsequent transaction wrote to that key.
2. If the snapshot was a `CacheEntry`: it is restored directly via `restoreCacheEntry(key, entry)`. This preserves exact metadata — `createdAt`, `updatedAt`, `expiresAt`, `staleAfter`, `version`, `source` — ensuring all timestamps and version counters remain consistent.

### Why restoreCacheEntry Exists

The standard `setCachedData()` creates entries with current timestamps. If a rollback used `setCachedData()`, the restored entry would have a later `updatedAt` than the original, which could:
- Cause stale data to appear "fresh"
- Break TTL calculations
- Create inconsistencies in SWR stale checks

`restoreCacheEntry()` bypasses the timestamp-resetting logic and writes the entry verbatim.

## Conflict Resolution

### Problem

Multiple optimistic transactions can modify the same cache key concurrently. For example:
1. Transaction A starts, modifies key `profile::{userId}` — pending
2. Transaction B starts, modifies same key `profile::{userId}` — pending
3. Transaction A fails
4. Rollback A should NOT restore the original snapshot (before both A and B), because B's newer changes would be lost

### Solution

Each key maintains an ordered list of transaction IDs (`keyToTransactionIds`). On rollback:

```typescript
function hasNewerPendingTransaction(key: string, excludeId: string): boolean
```

This checks if any transaction started after `excludeId` is still pending for the same key. If a newer pending transaction exists, the rollback skips restoring that key, leaving B's optimistic state intact.

### Transaction Ordering

Transactions are tracked per-key in insertion order. When a transaction commits or rolls back, its ID is removed from the key's list. This ensures:
- Transactions are applied in order
- Rollbacks respect concurrent modifications
- Memory is freed after cleanup

## SWR Compatibility

`useCachedQuery` checks `hasActiveOptimistic(key)` in two places:

1. **Initial load / refresh effect**: If an optimistic transaction is active, the hook skips the background refresh. This prevents SWR from issuing a network request that could overwrite optimistic cache state.

2. **Window focus / online reconnect handler**: Registered SWR refresh callbacks skip execution for keys with active optimistic transactions.

After the mutation commits (success or rollback), the component can optionally call `refresh()` to get fresh data from the server.

## Realtime Compatibility

When a realtime update arrives for a cache key:

1. The realtime handler checks if the key has active optimistic transactions.
2. If yes: the handler can call `commitTransaction()` for the matching transaction (since the server state is confirmed).
3. The cache is updated with the realtime data.
4. Re-renders are minimized because the realtime data supersedes the optimistic state.

No changes to `useRealtime` were required — the realtime hook already works with `setCachedData()`.

## Performance Design

- **No extra renders**: The `useOptimisticMutation` hook only triggers re-renders when `isLoading` or `error` changes. The cache update is the primary signal.
- **No duplicate cache writes**: The rollback checks `hasNewerPendingTransaction` before restoring.
- **No duplicate network requests**: The mutation function executes exactly once per `mutate()` call.
- **No memory leaks**: `cleanupTransaction()` removes entries from all internal maps on commit/rollback. `clearAllTransactions()` is available for cleanup on logout.
- **No large snapshots**: Only `CacheEntry` objects (data + metadata) are stored. The data reference is shared until mutated.

## Integration Guide

### Profile Update

```tsx
const { mutate, isLoading } = useOptimisticMutation({
  mutationFn: (data) => updateMyProfile(data),
  cacheKeys: [createRequestKey('profile', user.id)],
  optimisticUpdate: (data) => {
    const key = createRequestKey('profile', user.id);
    const prev = getCacheEntry(key);
    setCachedData(key, { ...prev?.data, ...data });
  },
  onSuccess: () => toast.success('Profile updated'),
  onError: () => toast.error('Failed to update profile'),
});
```

### Student Application

```tsx
const { mutate, isLoading } = useOptimisticMutation({
  mutationFn: (data) => applyToInternship(data),
  cacheKeys: [
    createRequestKey('my_applications', user.id),
    createRequestKey('has_applied', user.id, internshipId),
  ],
  optimisticUpdate: (data) => {
    const key = createRequestKey('my_applications', user.id);
    const prev = getCacheEntry(key);
    if (prev) {
      const newApp = { ...data, id: 'optimistic', status: 'Pending', created_at: new Date().toISOString() };
      setCachedData(key, { data: [...(prev.data || []), newApp], error: null });
    }
  },
});
```

### Task Submission

```tsx
const { mutate } = useOptimisticMutation({
  mutationFn: (data) => submitTask(data),
  cacheKeys: [
    `my_tasks_${user.id}`,
    `task_${data.task_id}`,
  ],
  optimisticUpdate: (data) => {
    const key = `task_${data.task_id}`;
    const prev = getCacheEntry(key);
    if (prev?.data?.data) {
      const updated = { ...prev.data, data: { ...prev.data.data, status: 'Submitted' } };
      setCachedData(key, updated);
    }
  },
});
```

### Mark Notification as Read

```tsx
const { mutate } = useOptimisticMutation({
  mutationFn: (id: string) => markNotificationRead(id),
  cacheKeys: [
    `notifications_${user.id}`,
    `unread_notifications_count_${user.id}`,
  ],
  optimisticUpdate: (id) => {
    const key = `notifications_${user.id}`;
    const prev = getCacheEntry(key);
    if (prev?.data?.data) {
      const updated = prev.data.data.map((n: any) =>
        n.id === id ? { ...n, read: true } : n
      );
      setCachedData(key, { data: updated, error: null });
    }
    const countKey = `unread_notifications_count_${user.id}`;
    const count = getCacheEntry<number>(countKey);
    if (count !== null && count.data > 0) {
      setCachedData(countKey, Math.max(0, count.data - 1));
    }
  },
});
```

### Send Message

```tsx
const { mutate } = useOptimisticMutation({
  mutationFn: (data) => sendMessage(data),
  cacheKeys: [
    `messages_${data.conversation_id}`,
    `conversations_${user.id}`,
  ],
  optimisticUpdate: (data) => {
    const key = `messages_${data.conversation_id}`;
    const prev = getCacheEntry(key);
    if (prev?.data?.data) {
      const optimisticMsg = {
        id: `opt_${Date.now()}`,
        conversation_id: data.conversation_id,
        content: data.content,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        read_by: [user.id],
        sender: { id: user.id, full_name: 'You', avatar_url: null, role: null },
      };
      setCachedData(key, { data: [...prev.data.data, optimisticMsg], error: null });
    }
  },
});
```

### Offer Acceptance / Rejection

```tsx
const { mutate } = useOptimisticMutation({
  mutationFn: (id: string) => acceptOfferLetter(id),
  cacheKeys: [
    createRequestKey('my_offer_letters', user.id),
    createRequestKey('offer_letter', id),
  ],
  optimisticUpdate: (id) => {
    const listKey = createRequestKey('my_offer_letters', user.id);
    const prev = getCacheEntry(listKey);
    if (prev?.data?.data) {
      const updated = prev.data.data.map((ol: any) =>
        ol.id === id ? { ...ol, status: 'Accepted' } : ol
      );
      setCachedData(listKey, { data: updated, error: null });
    }
  },
});
```

### Mentor Scoring / Task Review

```tsx
const { mutate } = useOptimisticMutation({
  mutationFn: (submissionId, data) => reviewSubmission(submissionId, data),
  cacheKeys: [
    `my_tasks_${studentId}`,
    `task_${taskId}`,
  ],
  optimisticUpdate: (submissionId, data) => {
    const key = `task_${taskId}`;
    const prev = getCacheEntry(key);
    if (prev?.data?.data) {
      const updated = { ...prev.data, data: { ...prev.data.data, status: data.status } };
      setCachedData(key, updated);
    }
  },
});
```

## Best Practices

1. **Always provide both cacheKeys and optimisticUpdate**: Without them, there's no optimistic behavior.

2. **Keep optimisticUpdate synchronous**: It must be synchronous because it runs before the async mutation. If you need async logic, prepare the data beforehand.

3. **Match cache key format exactly**: Use the same key format as the corresponding read function. Check `createRequestKey` usage in the service's read functions.

4. **Handle both list and single-entity mutations**: List mutations (e.g., send a message) need to append/prepend to the cached array. Single-entity mutations (e.g., update profile) need to merge partial data.

5. **Clean up on unmount**: The hook handles this via `useEffect` cleanup. If a mutation is in-flight when the component unmounts, the transaction will remain pending. Call `clearAllTransactions()` on app logout.

6. **Do NOT use for destructive operations**: Operations like account deletion should never be optimistic — they should always require server confirmation first.

7. **Toast on failure**: The `onError` callback should show a toast notification. This is the user's signal that their action failed and the UI has rolled back.

## Test Scenarios

### Single Optimistic Update
1. Call `mutate()` with valid args
2. Verify cache is updated immediately
3. Verify network request executes
4. On success: verify optimistic state remains in cache
5. On failure: verify cache is restored to original state

### Multiple Simultaneous Updates
1. Start transaction A for key `X`
2. Start transaction B for same key `X`
3. Fail A → verify rollback does NOT affect B's changes
4. Commit B → verify B's state is final

### Rollback Edge Cases
- Rollback when key didn't exist before → key should not exist after rollback
- Rollback when newer transaction modified same key → skip rollback for that key
- Rollback with multiple affected keys → only roll back keys without newer transactions

### SWR Compatibility
- Verify `useCachedQuery` does not refresh during active optimistic transaction
- Verify `useCachedQuery` refreshes normally after transaction completes
- Verify window focus does not trigger refresh during active transaction

## Future Improvements

- **OptimisticKeyManager singleton**: Replace module-level maps with a class-based manager for easier testing and DI.
- **Auto-commit on realtime confirmation**: When realtime pushes the server's confirmation of an optimistic transaction, auto-commit instead of waiting for the mutation response.
- **Timeout-based rollback**: If a mutation doesn't resolve within a configurable timeout, auto-rollback to prevent stale optimistic state.
- **Request cancellation**: AbortController integration to cancel in-flight mutations on rollback.
