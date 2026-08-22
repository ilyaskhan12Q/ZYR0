import type { ProviderId, ZeroAiKeys } from '@/hooks/useZeroAiKeys';

export type LlmResult =
  | { ok: true; text: string; provider: ProviderId }
  | { ok: false; error: string; provider: ProviderId | null };

const TIMEOUT_MS = 15_000;

const PROVIDER_MODELS: Record<ProviderId, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini'],
  anthropic: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'],
};

const PROVIDER_ORDER: ProviderId[] = ['gemini', 'openai', 'anthropic'];

export function pickProvider(keys: ZeroAiKeys): ProviderId | null {
  return PROVIDER_ORDER.find((p) => Boolean(keys[p])) ?? null;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function parseProviderText(provider: ProviderId, json: unknown): Promise<string | null> {
  if (provider === 'gemini') {
    const candidates = (json as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates;
    const text = candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    return text || null;
  }
  if (provider === 'openai') {
    const content = (json as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ?? '';
    return content || null;
  }
  const blocks = (json as { content?: { type: string; text?: string }[] })?.content ?? [];
  const text = blocks.map((b) => (b.type === 'text' ? b.text ?? '' : '')).join('');
  return text || null;
}

async function callProvider(provider: ProviderId, apiKey: string, system: string, user: string): Promise<string> {
  const models = PROVIDER_MODELS[provider];
  let lastStatus = 0;
  for (const model of models) {
    let url = '';
    let init: RequestInit = {};
    if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
        }),
      };
    } else if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 4096,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      };
    } else {
      url = 'https://api.anthropic.com/v1/messages';
      init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      };
    }
    let res: Response;
    try {
      res = await fetchWithTimeout(url, init);
    } catch (e) {
      throw new Error(e instanceof Error && e.name === 'AbortError' ? 'Request timed out' : 'Network error');
    }
    if (res.status === 404 || res.status === 400) {
      lastStatus = res.status;
      continue;
    }
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    const text = await parseProviderText(provider, await res.json());
    if (text) return text;
  }
  throw new Error(`Provider did not accept any model (last status ${lastStatus || 'unknown'})`);
}

export async function callLlm(system: string, user: string, keys: ZeroAiKeys): Promise<LlmResult> {
  const provider = pickProvider(keys);
  if (!provider) return { ok: false, error: 'No API key configured', provider: null };
  try {
    const text = await callProvider(provider, keys[provider] as string, system, user);
    return { ok: true, text, provider };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error', provider };
  }
}

export function extractJson(text: string): unknown | null {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}