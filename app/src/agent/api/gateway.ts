import supabase from '@/lib/supabase';
import type {
  AgentChatResponse,
  AgentChatStreamEvent,
  AgentModelsResponse,
} from '@/agent/core/types';
import type { EvidenceItem } from '@/agent/research/types';

const FUNCTION = 'ai-gateway';

const GATEWAY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION}`;

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');
  return token;
}

export async function fetchAgentModels(): Promise<AgentModelsResponse> {
  const { data, error } = await supabase.functions.invoke<AgentModelsResponse>(FUNCTION, {
    method: 'GET',
  });
  if (error) throw error;
  return data ?? { models: [] };
}

export interface UrlVerificationResult {
  url: string;
  ok: boolean;
  status: number;
}

/** Server-side liveness checks (browsers can't read cross-origin status codes). */
export async function verifyUrls(urls: string[]): Promise<UrlVerificationResult[]> {
  const { data, error } = await supabase.functions.invoke<{ results: UrlVerificationResult[] }>(
    FUNCTION,
    { body: { action: 'verify', urls } },
  );
  if (error) throw error;
  return data?.results ?? [];
}

export type GatewayPlatform = 'semanticscholar' | 'pubmed' | 'core';

export interface GatewaySearchResult {
  results: Partial<Record<GatewayPlatform, EvidenceItem[]>>;
  skipped: string[];
}

/** Server-side platform search (S2 + PubMed + CORE) for the gather phase. */
export async function searchPlatforms(
  queries: string[],
  platforms: GatewayPlatform[],
): Promise<GatewaySearchResult> {
  const { data, error } = await supabase.functions.invoke<GatewaySearchResult>(FUNCTION, {
    body: { action: 'search', queries, platforms },
  });
  if (error) throw error;
  return { results: data?.results ?? {}, skipped: data?.skipped ?? [] };
}

export interface StreamChatOptions {
  system?: string;
  model?: string;
  maxTokens?: number;
  signal?: AbortSignal;
  onEvent: (event: AgentChatStreamEvent) => void;
}

/**
 * Streams a chat completion through the ai-gateway edge function.
 * The gateway proxies the upstream SSE and appends a final `usage` + `done`
 * event carrying the model actually used and token counts.
 */
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options: StreamChatOptions,
): Promise<AgentChatResponse> {
  const token = await accessToken();
  const res = await fetch(`${GATEWAY_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'chat',
      stream: true,
      model: options.model,
      system: options.system,
      maxTokens: options.maxTokens,
      messages,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    let detail = `Gateway error (HTTP ${res.status})`;
    try {
      const json = await res.json();
      if (json.error) detail = String(json.error);
    } catch {
      // non-JSON error body — keep default
    }
    return { ok: false, error: detail };
  }

  if (!res.body) return { ok: false, error: 'Empty response' };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        let json: Record<string, unknown>;
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }

        switch (json.type) {
          case 'delta': {
            const delta = String(json.text ?? '');
            text += delta;
            options.onEvent({ type: 'delta', text: delta });
            break;
          }
          case 'usage':
            options.onEvent({
              type: 'usage',
              model: String(json.model ?? ''),
              inputTokens: Number(json.inputTokens ?? 0),
              outputTokens: Number(json.outputTokens ?? 0),
              latencyMs: Number(json.latencyMs ?? 0),
            });
            break;
          case 'done':
            options.onEvent({ type: 'done' });
            break;
          case 'error':
            options.onEvent({ type: 'error', message: String(json.message ?? 'Stream error') });
            break;
          default:
            // Plain upstream chunk (provider streamed without the wrapper
            // when the gateway fell back mid-stream).
            const choices = Array.isArray(json.choices) ? json.choices : [];
            const first = choices[0] as { delta?: { content?: unknown } } | undefined;
            const deltaText = String(first?.delta?.content ?? '');
            if (deltaText) {
              text += deltaText;
              options.onEvent({ type: 'delta', text: deltaText });
            }
        }
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'Stream aborted' };
    }
    return { ok: false, error: err instanceof Error ? err.message : 'Stream read failed' };
  }

  return { ok: true, text };
}