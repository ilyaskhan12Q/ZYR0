import { getCacheEntry, restoreCacheEntry, deleteCacheEntry } from '@/lib/cache';
import type { CacheEntry } from '@/lib/cache';

type TransactionStatus = 'pending' | 'committed' | 'rolled_back';

export interface OptimisticTransaction {
  transactionId: string;
  status: TransactionStatus;
  timestamp: number;
  affectedKeys: string[];
  snapshots: Map<string, CacheEntry | null>;
}

const activeTransactions = new Map<string, OptimisticTransaction>();
const keyToTransactionIds = new Map<string, string[]>();

let counter = 0;

function generateId(): string {
  return `opt_${Date.now()}_${++counter}`;
}

export function beginTransaction(keys: string[]): string {
  const transactionId = generateId();
  const snapshots = new Map<string, CacheEntry | null>();

  for (const key of keys) {
    const entry = getCacheEntry(key);
    snapshots.set(key, entry ? { ...entry } : null);

    const existing = keyToTransactionIds.get(key) ?? [];
    existing.push(transactionId);
    keyToTransactionIds.set(key, existing);
  }

  const transaction: OptimisticTransaction = {
    transactionId,
    status: 'pending',
    timestamp: Date.now(),
    affectedKeys: [...keys],
    snapshots,
  };

  activeTransactions.set(transactionId, transaction);
  return transactionId;
}

export function commitTransaction(transactionId: string): void {
  const tx = activeTransactions.get(transactionId);
  if (!tx || tx.status !== 'pending') return;
  tx.status = 'committed';
  cleanupTransaction(transactionId);
}

export function rollbackTransaction(transactionId: string): void {
  const tx = activeTransactions.get(transactionId);
  if (!tx || tx.status !== 'pending') return;

  for (const [key, snapshot] of tx.snapshots) {
    const newerTx = hasNewerPendingTransaction(key, transactionId);
    if (newerTx) continue;

    if (snapshot === null) {
      const current = getCacheEntry(key);
      if (current) {
        const ids = keyToTransactionIds.get(key) ?? [];
        const isOurWrite = ids.length > 0 && ids[ids.length - 1] === transactionId;
        if (isOurWrite) {
          deleteCacheEntry(key);
        }
      }
    } else {
      restoreCacheEntry(key, snapshot);
    }
  }

  tx.status = 'rolled_back';
  cleanupTransaction(transactionId);
}

function hasNewerPendingTransaction(key: string, excludeId: string): boolean {
  const ids = keyToTransactionIds.get(key);
  if (!ids) return false;

  const excludeIdx = ids.indexOf(excludeId);
  if (excludeIdx === -1) return false;

  for (let i = excludeIdx + 1; i < ids.length; i++) {
    const tx = activeTransactions.get(ids[i]);
    if (tx && tx.status === 'pending') return true;
  }
  return false;
}

function cleanupTransaction(transactionId: string): void {
  const tx = activeTransactions.get(transactionId);
  if (!tx) return;

  for (const key of tx.affectedKeys) {
    const ids = keyToTransactionIds.get(key);
    if (ids) {
      const filtered = ids.filter(id => id !== transactionId);
      if (filtered.length === 0) {
        keyToTransactionIds.delete(key);
      } else {
        keyToTransactionIds.set(key, filtered);
      }
    }
  }

  activeTransactions.delete(transactionId);
}

export function hasActiveOptimistic(key: string): boolean {
  return keyToTransactionIds.has(key);
}

export function getActiveTransactionsForKey(key: string): OptimisticTransaction[] {
  const ids = keyToTransactionIds.get(key);
  if (!ids) return [];
  const result: OptimisticTransaction[] = [];
  for (const id of ids) {
    const tx = activeTransactions.get(id);
    if (tx) result.push(tx);
  }
  return result;
}

export function countActiveTransactions(): number {
  return activeTransactions.size;
}

export function clearAllTransactions(): void {
  activeTransactions.clear();
  keyToTransactionIds.clear();
}
