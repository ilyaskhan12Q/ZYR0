import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat } from '@/agent/api/gateway';
import supabase from '@/lib/supabase';
import type { AgentChatMessage, AgentUsageMeta } from '@/agent/core/types';

let idCounter = 0;
const nextId = () => `agent-msg-${Date.now()}-${idCounter++}`;

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
}

const toMessage = (m: StoredMessage): AgentChatMessage => ({
  id: nextId(),
  role: m.role,
  content: m.content,
  model: m.model ?? undefined,
  meta: m.model
    ? {
        model: m.model,
        inputTokens: m.input_tokens ?? 0,
        outputTokens: m.output_tokens ?? 0,
        latencyMs: m.latency_ms ?? 0,
      }
    : undefined,
});

export function useAgentChat(modelId: string | null) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const restoreLatest = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { data: sessions } = await supabase
      .from('agent_researches')
      .select('id')
      .eq('mode', 'chat')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);
    const sid = sessions?.[0]?.id;
    if (!sid) return;

    const { data: rows } = await supabase
      .from('agent_messages')
      .select('role, content, model, input_tokens, output_tokens, latency_ms')
      .eq('research_id', sid)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (!rows || rows.length === 0) return;

    setSessionId(sid);
    setMessages(rows.map(toMessage));
    setError(null);
  }, []);

  useEffect(() => {
    void restoreLatest();
  }, [restoreLatest]);

  const loadSession = useCallback(async (id: string) => {
    const { data: rows } = await supabase
      .from('agent_messages')
      .select('role, content, model, input_tokens, output_tokens, latency_ms')
      .eq('research_id', id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (!rows) return false;
    abortRef.current?.abort();
    setSessionId(id);
    setMessages(rows.map(toMessage));
    setError(null);
    setStreaming(false);
    return true;
  }, []);

  const persistUser = useCallback(async (text: string, sid: string | null) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return sid;

    let id = sid;
    if (!id) {
      const { data } = await supabase
        .from('agent_researches')
        .insert({ user_id: user.id, prompt: text.slice(0, 200), mode: 'chat', status: 'completed' })
        .select('id')
        .single();
      id = data?.id ?? null;
    }
    if (id) {
      await supabase
        .from('agent_messages')
        .insert({ research_id: id, user_id: user.id, role: 'user', content: text });
    }
    return id;
  }, []);

  const persistAssistant = useCallback(
    async (sid: string | null, content: string, meta?: AgentUsageMeta) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id || !sid || !content) return;
      await supabase.from('agent_messages').insert({
        research_id: sid,
        user_id: user.id,
        role: 'assistant',
        content,
        model: meta?.model ?? null,
        input_tokens: meta?.inputTokens ?? null,
        output_tokens: meta?.outputTokens ?? null,
        latency_ms: meta?.latencyMs ?? null,
      });
    },
    []
  );

  const send = useCallback(
    async (content: string, system?: string) => {
      const text = content.trim();
      if (!text || streaming) return;

      const userMsg: AgentChatMessage = { id: nextId(), role: 'user', content: text };
      const assistantMsg: AgentChatMessage = { id: nextId(), role: 'assistant', content: '', streaming: true };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setError(null);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const history = messages
        .filter((m) => !m.streaming && !m.error)
        .map((m) => ({ role: m.role, content: m.content }))
        .concat({ role: 'user' as const, content: text });

      let acc = '';
      let accMeta: AgentUsageMeta | undefined;
      const patch = (fn: (m: AgentChatMessage) => AgentChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantMsg.id ? fn(m) : m)));

      let sid = sessionId;
      try {
        sid = await persistUser(text, sid);
        if (sid && sid !== sessionId) setSessionId(sid);

        const result = await streamChat(history, {
          model: modelId ?? undefined,
          system,
          signal: controller.signal,
          onEvent: (event) => {
            switch (event.type) {
              case 'delta':
                acc += event.text;
                patch((m) => ({ ...m, content: m.content + event.text }));
                break;
              case 'usage':
                accMeta = { model: event.model, inputTokens: event.inputTokens, outputTokens: event.outputTokens, latencyMs: event.latencyMs } satisfies AgentUsageMeta;
                patch((m) => ({
                  ...m,
                  model: event.model,
                  meta: accMeta,
                }));
                break;
              case 'error':
                patch((m) => ({ ...m, error: event.message, streaming: false }));
                break;
              case 'done':
                patch((m) => ({ ...m, streaming: false }));
                break;
            }
          },
        });

        if (!result.ok && result.error) {
          patch((m) => ({ ...m, error: result.error, streaming: false }));
        }
        patch((m) => ({ ...m, streaming: false }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        patch((m) => ({ ...m, error: message, streaming: false }));
      } finally {
        void persistAssistant(sid, acc, accMeta);
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, modelId, sessionId, streaming, persistUser, persistAssistant]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  const resetSession = useCallback(() => {
    abortRef.current?.abort();
    setSessionId(null);
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, error, sessionId, send, abort, clear, resetSession, loadSession };
}