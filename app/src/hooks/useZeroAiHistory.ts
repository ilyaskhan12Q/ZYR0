import { useCallback, useEffect, useState } from 'react';

import type { Depth } from '@/data/zeroAiFixtures';

export interface HistoryItem {
  id: string;
  title: string;
  depth: Depth;
  createdAt: number;
  status: 'completed' | 'running';
}

const STORAGE_KEY = 'zeroai.history';
const MAX_ITEMS = 20;

/** Derive a short title from the user prompt. */
export function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 60) return cleaned;
  return `${cleaned.slice(0, 60).trim()}…`;
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string');
  } catch {
    return [];
  }
}

/** Mock research history persisted in localStorage (capped at 20 entries). */
export function useZeroAiHistory() {
  const [items, setItems] = useState<HistoryItem[]>(loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — keep in memory
    }
  }, [items]);

  const addItem = useCallback((item: Omit<HistoryItem, 'createdAt'>) => {
    const next = [{ ...item, createdAt: Date.now() }, ...loadHistory()].slice(0, MAX_ITEMS);
    setItems(next);
    return next[0];
  }, []);

  const updateStatus = useCallback((id: string, patch: Partial<Pick<HistoryItem, 'status' | 'title'>>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return { items, addItem, updateStatus, removeItem, clearAll };
}