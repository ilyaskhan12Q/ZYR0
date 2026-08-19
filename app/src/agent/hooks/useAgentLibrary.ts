import { useCallback, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import type { ResearchHistoryItem } from '@/agent/hooks/useResearchPipeline';

interface LibraryRow {
  id: string;
  prompt: string;
  status: string;
  mode: string;
  created_at: string;
}

export function useAgentLibrary() {
  const [chats, setChats] = useState<ResearchHistoryItem[]>([]);
  const [research, setResearch] = useState<ResearchHistoryItem[]>([]);

  const refetch = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { data: rows } = await supabase
      .from('agent_researches')
      .select('id, prompt, status, mode, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const items = (rows ?? []) as LibraryRow[];
    setChats(items.filter((r) => r.mode === 'chat').map(toItem));
    setResearch(items.filter((r) => r.mode === 'research').map(toItem));
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { chats, research, refetch };
}

const toItem = (r: LibraryRow): ResearchHistoryItem => ({
  id: r.id,
  prompt: r.prompt,
  status: r.status,
  created_at: r.created_at,
});