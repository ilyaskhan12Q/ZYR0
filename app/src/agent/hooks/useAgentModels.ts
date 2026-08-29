import { useCallback, useEffect, useState } from 'react';
import { fetchAgentModels } from '@/agent/api/gateway';
import type { AgentModelInfo } from '@/agent/core/types';

const DEFAULT_MODEL = 'zen/deepseek-v4-flash-free';

export function useAgentModels() {
  const [models, setModels] = useState<AgentModelInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { models: list } = await fetchAgentModels();
      setModels(list);
      setSelected((current) => current ?? list.find((m) => m.id === DEFAULT_MODEL)?.id ?? list[0]?.id ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { models, selected, setSelected, loading, error, refresh };
}