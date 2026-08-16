import { useCallback, useEffect, useState } from 'react';

export type ProviderId = 'gemini' | 'openai' | 'anthropic';

export interface ZeroAiKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
}

const STORAGE_KEY = 'zeroai.keys';

export const PROVIDER_META: Record<ProviderId, { label: string; color: string }> = {
  gemini: { label: 'Google Gemini', color: '#4285f4' },
  openai: { label: 'OpenAI', color: '#10a37f' },
  anthropic: { label: 'Anthropic', color: '#d97757' },
};

function loadKeys(): ZeroAiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ZeroAiKeys;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * BYOK (bring your own key) storage. Keys live ONLY in the browser's
 * localStorage — Phase 1 is mock-only and never sends them anywhere.
 */
export function useZeroAiKeys() {
  const [keys, setKeys] = useState<ZeroAiKeys>(loadKeys);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {
      // storage full / unavailable — ignore, stays in memory
    }
  }, [keys]);

  const setProviderKey = useCallback((provider: ProviderId, value: string) => {
    const trimmed = value.trim();
    setKeys((prev) => ({ ...prev, [provider]: trimmed ? trimmed : undefined }));
  }, []);

  const clearAll = useCallback(() => {
    setKeys({});
  }, []);

  const hasAny = keys.gemini || keys.openai || keys.anthropic;
  const configuredCount = [keys.gemini, keys.openai, keys.anthropic].filter(Boolean).length;

  /** Mask a key for display: keep the last 4 characters. */
  const masked = useCallback((provider: ProviderId): string => {
    const key = keys[provider];
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return `••••••••${key.slice(-4)}`;
  }, [keys]);

  return { keys, setProviderKey, clearAll, hasAny, configuredCount, masked };
}