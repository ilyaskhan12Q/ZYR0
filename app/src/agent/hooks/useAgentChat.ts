import { useCallback, useRef, useState } from 'react';
import { streamChat } from '@/agent/api/gateway';
import type { AgentChatMessage, AgentUsageMeta } from '@/agent/core/types';

let idCounter = 0;
const nextId = () => `agent-msg-${Date.now()}-${idCounter++}`;

export function useAgentChat(modelId: string | null) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (content: string, system?: string) => {
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

    const patch = (fn: (m: AgentChatMessage) => AgentChatMessage) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantMsg.id ? fn(m) : m)));

    try {
      const result = await streamChat(history, {
        model: modelId ?? undefined,
        system,
        signal: controller.signal,
        onEvent: (event) => {
          switch (event.type) {
            case 'delta':
              patch((m) => ({ ...m, content: m.content + event.text }));
              break;
            case 'usage':
              patch((m) => ({
                ...m,
                model: event.model,
                meta: { model: event.model, inputTokens: event.inputTokens, outputTokens: event.outputTokens, latencyMs: event.latencyMs } satisfies AgentUsageMeta,
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
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, modelId, streaming]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, error, send, abort, clear };
}