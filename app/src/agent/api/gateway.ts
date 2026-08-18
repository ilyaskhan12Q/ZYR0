import supabase from '@/lib/supabase';
import type {
  AgentChatResponse,
  AgentChatStreamEvent,
  AgentModelsResponse,
} from '@/agent/core/types';
import type { EvidenceItem } from '@/agent/research/types';

const FUNCTION = 'ai-gateway';

const GATEWAY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION}`;

interface InvokeErrorLike {
  context?: { status?: number };
}

function isAuthError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as InvokeErrorLike).context?.status === 401,
  );
}

async function invokeWithRetry<T>(
  body?: unknown,
  init?: { method?: 'GET' | 'POST' },
): Promise<{ data: T | null; error: unknown }> {
  const opts: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {
    ...(body !== undefined ? { body: body as Record<string, unknown> } : {}),
    ...init,
  };
  const first = await supabase.functions.invoke<T>(FUNCTION, opts);
  if (!isAuthError(first.error)) return first;
  await supabase.auth.refreshSession();
  return supabase.functions.invoke<T>(FUNCTION, opts);
}

async function accessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  let current = session;

  const expiring = (s: typeof session): boolean => {
    if (!s?.expires_at) return !s;
    return s.expires_at - 60 < Date.now() / 1000;
  };
  if (expiring(current)) {
    const { data } = await supabase.auth.refreshSession();
    current = data.session;
  }

  const token = current?.access_token;
  if (!token) throw new Error('Not signed in');
  return token;
}

export async function fetchAgentModels(): Promise<AgentModelsResponse> {
  const { data, error } = await invokeWithRetry<AgentModelsResponse>(undefined, { method: 'GET' });
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
  const { data, error } = await invokeWithRetry<{ results: UrlVerificationResult[] }>({
    action: 'verify',
    urls,
  });
  if (error) throw error;
  return data?.results ?? [];
}

export type GatewayPlatform = 'openalex' | 'arxiv' | 'semanticscholar' | 'pubmed' | 'core' | 'web';

export interface GatewaySearchResult {
  results: Partial<Record<GatewayPlatform, EvidenceItem[]>>;
  skipped: string[];
  empty: string[];
}

/** Server-side platform search (S2 + PubMed + CORE + Jina web) for the gather phase. */
export async function searchPlatforms(
  queries: string[],
  platforms: GatewayPlatform[],
): Promise<GatewaySearchResult> {
  const { data, error } = await invokeWithRetry<GatewaySearchResult>({
    action: 'search',
    queries,
    platforms,
  });
  if (error) throw error;
  return { results: data?.results ?? {}, skipped: data?.skipped ?? [], empty: data?.empty ?? [] };
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
  const payload = JSON.stringify({
    action: 'chat',
    stream: true,
    model: options.model,
    system: options.system,
    maxTokens: options.maxTokens,
    messages,
  });
  let res = await fetch(`${GATEWAY_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: payload,
    signal: options.signal,
  });

  if (res.status === 401) {
    // Stale access token — refresh once and retry.
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getSession();
    const freshToken = data.session?.access_token;
    if (freshToken) {
      res = await fetch(`${GATEWAY_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`,
        },
        body: payload,
        signal: options.signal,
      });
    }
  }

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
  let streamError: string | null = null;

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
            streamError = String(json.message ?? 'Stream error');
            options.onEvent({ type: 'error', message: streamError });
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

  if (streamError) return { ok: false, error: streamError };

  return { ok: true, text };
}