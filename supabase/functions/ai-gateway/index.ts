// Edge Function: ai-gateway
// POST /functions/v1/ai-gateway   { action: 'chat', model?, system?, messages, maxTokens?, stream? }
// GET  /functions/v1/ai-gateway   -> model catalog
//
// Phase 1: free-tier Zen models (opencode.ai/zen/v1, apiKey "public") with an
// in-memory fallback chain + cooldowns, per-user DB-backed rate limiting, and
// a usage ledger in agent_usage. Every request requires a valid user JWT —
// per-user metering is the security boundary; the client orchestrates UX.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// Model registry (mirrors models.dev / OpenCode catalog shape)
// ---------------------------------------------------------------------------

interface RegistryEntry {
  id: string;              // canonical "provider/model"
  name: string;
  provider: string;
  baseURL: string;         // OpenAI-compatible root; /chat/completions appended
  apiKey: string | null;   // "public" sentinel for Zen free tier; null => envKey
  envKey?: string;         // env var holding the secret (BYOK, Phase 3)
  tier: 'free' | 'byok' | 'local';
  context: number;
  output: number;
  inputPricePer1M: number; // dollars; 0 for free tier
  outputPricePer1M: number;
}

const REGISTRY: RegistryEntry[] = [
  {
    id: 'zen/deepseek-v4-flash-free',
    name: 'DeepSeek V4 Flash (Free)',
    provider: 'zen',
    baseURL: 'https://opencode.ai/zen/v1',
    apiKey: 'public',
    tier: 'free',
    context: 128000,
    output: 8192,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
  },
  {
    id: 'zen/mimo-v2.5-free',
    name: 'Moonshot Mimo V2.5 (Free)',
    provider: 'zen',
    baseURL: 'https://opencode.ai/zen/v1',
    apiKey: 'public',
    tier: 'free',
    context: 131072,
    output: 8192,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
  },
  {
    id: 'zen/hy3-free',
    name: 'DeepSeek HY3 (Free)',
    provider: 'zen',
    baseURL: 'https://opencode.ai/zen/v1',
    apiKey: 'public',
    tier: 'free',
    context: 128000,
    output: 8192,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
  },
  // BYOK entries — dormant until the env secret is configured (Phase 3).
  {
    id: 'openai/gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    baseURL: 'https://api.openai.com/v1',
    apiKey: null,
    envKey: 'OPENAI_API_KEY',
    tier: 'byok',
    context: 400000,
    output: 32000,
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.60,
  },
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: null,
    envKey: 'GROQ_API_KEY',
    tier: 'byok',
    context: 131072,
    output: 32768,
    inputPricePer1M: 0.59,
    outputPricePer1M: 0.79,
  },
];

// Default fallback chain: free models first, then any keyed BYOK providers.
const FALLBACK_ORDER = REGISTRY.map((e) => e.id).filter((id) => {
  const e = REGISTRY.find((r) => r.id === id)!;
  return e.tier === 'free' || (e.envKey && Deno.env.get(e.envKey));
});

const PER_USER_RPM_LIMIT = 20; // requests per minute, DB-backed
const REQUEST_TIMEOUT_MS = 300_000; // OpenCode's OPENAI_HEADER_TIMEOUT_DEFAULT

// In-memory cooldowns: modelId -> cooldown-until (epoch ms)
const cooldowns = new Map<string, number>();

function resolveEntry(id: string): RegistryEntry | null {
  return REGISTRY.find((e) => e.id === id) ?? null;
}

function isUsable(entry: RegistryEntry): boolean {
  if (entry.tier === 'free') return true;
  return Boolean(entry.envKey && Deno.env.get(entry.envKey));
}

function entryApiKey(entry: RegistryEntry): string {
  if (entry.apiKey) return entry.apiKey;
  return entry.envKey ? Deno.env.get(entry.envKey)! : '';
}

function availableEntries(): RegistryEntry[] {
  return REGISTRY.filter(isUsable);
}

function cooldownMsFor(status: number, body: string): number {
  if (status === 429 || /rate limit|FreeUsageLimit/i.test(body)) return 60_000;
  if (status === 401 || status === 403 || /quota|unauthorized/i.test(body)) return 300_000;
  if (status >= 500) return 30_000;
  return 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.length / 4));

async function verifyUser(req: Request, admin: ReturnType<typeof createClient>) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized' as const };
  const { data: { user }, error } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return { error: 'Unauthorized' as const };
  return { user };
}

async function rateLimitCheck(admin: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin
      .from('agent_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since);
    return (count ?? 0) < PER_USER_RPM_LIMIT;
  } catch (err) {
    console.warn('[ai-gateway] rate-limit check failed (fail open):', err.message);
    return true; // fail open — never brick the feature on a DB hiccup
  }
}

async function recordUsage(
  admin: ReturnType<typeof createClient>,
  userId: string,
  entry: RegistryEntry,
  inputTokens: number,
  outputTokens: number,
  latencyMs: number,
) {
  try {
    await admin.from('agent_usage').insert({
      user_id: userId,
      model: entry.id,
      tier: entry.tier,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: latencyMs,
    });
  } catch (err) {
    console.warn('[ai-gateway] usage ledger insert failed:', err.message);
  }
}

// ---------------------------------------------------------------------------
// URL liveness checks (research pipeline verifier)
// ---------------------------------------------------------------------------

const VERIFY_TIMEOUT_MS = 5_000;
const VERIFY_CONCURRENCY = 5;
const VERIFY_MAX_URLS = 25;

async function checkOneUrl(url: string): Promise<{ url: string; ok: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
  try {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
      return { url, ok: res.ok, status: res.status };
    } catch {
      // Some servers reject HEAD — fall back to a ranged GET.
      const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, signal: controller.signal });
      return { url, ok: res.ok, status: res.status };
    }
  } catch {
    return { url, ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyUrls(urls: string[]): Promise<{ url: string; ok: boolean; status: number }[]> {
  const results: { url: string; ok: boolean; status: number }[] = [];
  const queue = [...urls];

  const workers = Array.from(
    { length: Math.min(VERIFY_CONCURRENCY, Math.max(urls.length, 1)) },
    async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (url) results.push(await checkOneUrl(url));
      }
    },
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Platform search (research pipeline gather — keyless-first)
//
// Keyless by default (Semantic Scholar + PubMed free tiers). When the user
// later supplies free API keys they arrive as env secrets and are used to
// raise rate ceilings — code path is identical either way.
// CORE requires a key: the platform is skipped (and reported) when absent.
// ---------------------------------------------------------------------------

const SEARCH_TIMEOUT_MS = 10_000;
const SEARCH_QUERY_LIMIT = 5;
const SEARCH_MAX_QUERIES = 12;
const SEARCH_WAVE_SIZE = 3;
const SEARCH_STAGGER_MS = 150;

interface SearchEvidence {
  id: string;
  title: string;
  url: string;
  sourceType: 'academic';
  sourceName: string;
  year?: number;
  doi?: string;
  authors?: string[];
  snippet?: string;
}

const SUPPORTED_PLATFORMS = ['semanticscholar', 'pubmed', 'core'];

let searchCounter = 0;
const nextSearchId = () => `gw-${crypto.randomUUID().slice(0, 8)}-${searchCounter++}`;

async function searchFetch(url: string, headers?: Record<string, string>): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function searchSemanticScholar(queries: string[]): Promise<SearchEvidence[]> {
  const apiKey = Deno.env.get('SEMANTIC_SCHOLAR_API_KEY');
  const headers = apiKey ? { 'x-api-key': apiKey } : undefined;
  const items: SearchEvidence[] = [];

  for (let i = 0; i < queries.length; i += SEARCH_WAVE_SIZE) {
    const wave = queries.slice(i, i + SEARCH_WAVE_SIZE);
    const batches = await Promise.all(
      wave.map(async (query): Promise<SearchEvidence[]> => {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${SEARCH_QUERY_LIMIT}&fields=title,abstract,year,url,externalIds,authors`;
        const res = await searchFetch(url, headers);
        if (!res || !res.ok) return [];
        const json = await res.json().catch(() => null);
        if (!json?.data || !Array.isArray(json.data)) return [];
        return json.data
          .slice(0, SEARCH_QUERY_LIMIT)
          .map((p: Record<string, unknown>): SearchEvidence | null => {
            const title = String(p.title ?? '').trim();
            const external = p.externalIds as Record<string, unknown> | undefined;
            const doi = typeof external?.DOI === 'string' ? external.DOI : undefined;
            const url = String(p.url ?? '').trim() || (doi ? `https://doi.org/${doi}` : '');
            if (!title || !url) return null;
            const authors = Array.isArray(p.authors)
              ? (p.authors as { name?: string }[]).map((a) => a.name ?? '').filter(Boolean).slice(0, 5)
              : undefined;
            return {
              id: nextSearchId(),
              title,
              url,
              sourceType: 'academic',
              sourceName: 'Semantic Scholar',
              year: typeof p.year === 'number' ? p.year : undefined,
              doi,
              authors,
              snippet: String(p.abstract ?? '').slice(0, 400),
            };
          })
          .filter((item: SearchEvidence | null): item is SearchEvidence => item !== null);
      }),
    );
    items.push(...batches.flat());
    if (i + SEARCH_WAVE_SIZE < queries.length) {
      await new Promise((resolve) => setTimeout(resolve, SEARCH_STAGGER_MS));
    }
  }
  return items;
}

async function searchPubmed(queries: string[]): Promise<SearchEvidence[]> {
  const apiKey = Deno.env.get('PUBMED_API_KEY');
  const keyParam = apiKey ? `&api_key=${apiKey}` : '';
  const ids: string[] = [];

  for (let i = 0; i < queries.length; i += SEARCH_WAVE_SIZE) {
    const wave = queries.slice(i, i + SEARCH_WAVE_SIZE);
    const batches = await Promise.all(
      wave.map(async (query): Promise<string[]> => {
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${SEARCH_QUERY_LIMIT}${keyParam}`;
        const res = await searchFetch(url);
        if (!res || !res.ok) return [];
        const json = await res.json().catch(() => null);
        const list = json?.esearchresult?.idlist;
        return Array.isArray(list) ? (list as string[]).slice(0, SEARCH_QUERY_LIMIT) : [];
      }),
    );
    for (const id of batches.flat()) {
      if (!ids.includes(id)) ids.push(id);
    }
    if (i + SEARCH_WAVE_SIZE < queries.length) {
      await new Promise((resolve) => setTimeout(resolve, SEARCH_STAGGER_MS));
    }
  }

  if (ids.length === 0) return [];

  // Batch summary for all PMIDs in one call
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0, 50).join(',')}&retmode=json${keyParam}`;
  const res = await searchFetch(url);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  const result = json?.result as Record<string, Record<string, unknown>> | undefined;
  if (!result) return [];

  return ids
    .slice(0, 50)
    .map((id): SearchEvidence | null => {
      const rec = result[id] as Record<string, unknown> | undefined;
      if (!rec) return null;
      const title = String(rec.title ?? '').trim();
      if (!title) return null;
      const pubdate = String(rec.pubdate ?? '');
      const year = /(19|20)\d{2}/.exec(pubdate);
      const authors = Array.isArray(rec.authors)
        ? (rec.authors as { name?: string }[]).map((a) => a.name ?? '').filter(Boolean).slice(0, 5)
        : undefined;
      return {
        id: nextSearchId(),
        title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        sourceType: 'academic',
        sourceName: 'PubMed',
        year: year ? Number(year[0]) : undefined,
        authors,
        snippet: String(rec.source ?? '').slice(0, 200),
      };
    })
    .filter((item: SearchEvidence | null): item is SearchEvidence => item !== null);
}

async function searchCore(queries: string[]): Promise<SearchEvidence[] | null> {
  const apiKey = Deno.env.get('CORE_API_KEY');
  if (!apiKey) return null; // CORE requires a key — caller reports it skipped

  const items: SearchEvidence[] = [];
  for (const query of queries) {
    const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=${SEARCH_QUERY_LIMIT}`;
    const res = await searchFetch(url, { Authorization: `Bearer ${apiKey}` });
    if (!res || !res.ok) continue;
    const json = await res.json().catch(() => null);
    const results = json?.results;
    if (!Array.isArray(results)) continue;
    for (const r of results.slice(0, SEARCH_QUERY_LIMIT)) {
      const title = String(r.title ?? '').trim();
      const doi = typeof r.doi === 'string' && r.doi ? r.doi.replace('https://doi.org/', '') : undefined;
      const url = doi ? `https://doi.org/${doi}` : String(r.downloadUrl ?? '').trim();
      if (!title || !url) continue;
      items.push({
        id: nextSearchId(),
        title,
        url,
        sourceType: 'academic',
        sourceName: 'CORE',
        year: typeof r.yearPublished === 'number' ? r.yearPublished : undefined,
        doi,
        snippet: String(r.abstract ?? '').slice(0, 400),
      });
    }
  }
  return items;
}

async function searchPlatforms(
  queries: string[],
  platforms: string[],
): Promise<{ results: Record<string, SearchEvidence[]>; skipped: string[] }> {
  const wanted = platforms.filter((p) => (SUPPORTED_PLATFORMS as readonly string[]).includes(p));
  const results: Record<string, SearchEvidence[]> = {};
  const skipped: string[] = [];

  for (const platform of wanted) {
    if (platform === 'semanticscholar') {
      results[platform] = await searchSemanticScholar(queries).catch(() => []);
    } else if (platform === 'pubmed') {
      results[platform] = await searchPubmed(queries).catch(() => []);
    } else if (platform === 'core') {
      const items = await searchCore(queries).catch(() => null);
      if (items === null) skipped.push('core');
      else results[platform] = items;
    }
  }
  return { results, skipped };
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

interface ChatRequest {
  action?: string;
  model?: string;
  system?: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  maxTokens?: number;
  stream?: boolean;
  urls?: string[];
  queries?: string[];
  platforms?: string[];
}

function buildUpstreamBody(req: ChatRequest, entry: RegistryEntry, withUsage: boolean) {
  const maxTokens = Math.min(req.maxTokens ?? entry.output, entry.output);
  const messages: { role: string; content: string }[] = [];
  if (req.system) messages.push({ role: 'system', content: req.system });
  for (const m of req.messages.slice(-40)) {
    if (m.content.trim()) messages.push({ role: m.role, content: m.content });
  }
  const body: Record<string, unknown> = {
    model: entry.id.split('/')[1],
    messages,
    max_tokens: maxTokens,
    stream: Boolean(req.stream),
  };
  if (req.stream && withUsage) body.stream_options = { include_usage: true };
  return body;
}

async function upstreamFetch(entry: RegistryEntry, req: ChatRequest, withUsage: boolean) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${entry.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${entryApiKey(entry)}`,
      },
      body: JSON.stringify(buildUpstreamBody(req, entry, withUsage)),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readUpstreamText(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  return new TextDecoder().decode(buf);
}

// Non-stream path: returns { text, model, usage, latencyMs }
async function chatOnce(admin: ReturnType<typeof createClient>, userId: string, req: ChatRequest) {
  const chain = req.model
    ? [req.model, ...FALLBACK_ORDER.filter((id) => id !== req.model)]
    : FALLBACK_ORDER;

  let lastError = 'All models unavailable';
  for (const modelId of chain) {
    const entry = resolveEntry(modelId);
    if (!entry || !isUsable(entry)) continue;
    if ((cooldowns.get(entry.id) ?? 0) > Date.now()) continue;

    const started = Date.now();
    try {
      const res = await upstreamFetch(entry, req, false);
      const body = await readUpstreamText(res);
      if (!res.ok) {
        const cooldown = cooldownMsFor(res.status, body);
        if (cooldown > 0) cooldowns.set(entry.id, Date.now() + cooldown);
        lastError = `[${entry.id}] HTTP ${res.status}`;
        continue;
      }
      let json: Record<string, unknown>;
      try {
        json = JSON.parse(body);
      } catch {
        lastError = `[${entry.id}] upstream returned non-JSON`;
        continue;
      }
      const text = String((json.choices as { message?: { content?: string } }[])?.[0]?.message?.content ?? '');
      const usage = json.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
      const latencyMs = Date.now() - started;
      await recordUsage(
        admin, userId, entry,
        usage?.prompt_tokens ?? estimateTokens(JSON.stringify(req.messages)),
        usage?.completion_tokens ?? estimateTokens(text),
        latencyMs,
      );
      return {
        ok: true as const,
        text,
        model: entry.id,
        usage: {
          inputTokens: usage?.prompt_tokens ?? estimateTokens(JSON.stringify(req.messages)),
          outputTokens: usage?.completion_tokens ?? estimateTokens(text),
        },
        latencyMs,
      };
    } catch (err) {
      lastError = `[${entry.id}] ${err.name === 'AbortError' ? 'timeout' : err.message}`;
      cooldowns.set(entry.id, Date.now() + 30_000);
    }
  }
  return { ok: false as const, error: lastError };
}

// Stream path: forwards upstream SSE verbatim, then appends a usage + done
// event once the stream (and ledger write) completes.
async function chatStream(admin: ReturnType<typeof createClient>, userId: string, req: ChatRequest) {
  const chain = req.model
    ? [req.model, ...FALLBACK_ORDER.filter((id) => id !== req.model)]
    : FALLBACK_ORDER;

  const started = Date.now();

  for (const modelId of chain) {
    const entry = resolveEntry(modelId);
    if (!entry || !isUsable(entry)) continue;
    if ((cooldowns.get(entry.id) ?? 0) > Date.now()) continue;

    try {
      let res = await upstreamFetch(entry, req, true);

      // Some gateways reject stream_options.include_usage — retry without it.
      if (!res.ok) {
        const errText = await readUpstreamText(res);
        const cooldown = cooldownMsFor(res.status, errText);
        if (cooldown > 0) cooldowns.set(entry.id, Date.now() + cooldown);
        if (res.status === 400 && /stream_options|include_usage/i.test(errText)) {
          res = await upstreamFetch(entry, req, false);
        } else {
          continue;
        }
      }
      if (!res.ok || !res.body) {
        const errText = await readUpstreamText(res);
        const cooldown = cooldownMsFor(res.status, errText);
        if (cooldown > 0) cooldowns.set(entry.id, Date.now() + cooldown);
        continue;
      }

      const reader = res.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let buffer = '';

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let usage: { prompt_tokens: number; completion_tokens: number } | null = null;
          let estimatedOutput = 0;
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
                if (payload === '[DONE]') continue;
                try {
                  const json = JSON.parse(payload);
                  if (json.usage) {
                    usage = {
                      prompt_tokens: json.usage.prompt_tokens ?? 0,
                      completion_tokens: json.usage.completion_tokens ?? 0,
                    };
                  }
                  const delta = json.choices?.[0]?.delta?.content;
                  if (typeof delta === 'string') estimatedOutput += delta.length;
                } catch {
                  // keep forwarding even if a chunk is malformed
                }
                controller.enqueue(encoder.encode(line + '\n'));
              }
            }
          } catch (err) {
            console.warn('[ai-gateway] stream error:', err.message);
          }

          const latencyMs = Date.now() - started;
          const inputTokens = usage?.prompt_tokens ?? estimateTokens(JSON.stringify(req.messages));
          const outputTokens = (usage?.completion_tokens ?? estimateTokens(
            estimatedOutput > 0 ? String(estimatedOutput) : '',
          )) || Math.max(1, Math.ceil(estimatedOutput / 4));

          await recordUsage(admin, userId, entry, inputTokens, outputTokens, latencyMs);

          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'usage', model: entry.id, inputTokens, outputTokens, latencyMs })}\n\n`,
          ));
          controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
          controller.close();
        },
        cancel() {
          reader.cancel().catch(() => {});
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...corsHeaders,
        },
      });
    } catch {
      cooldowns.set(entry.id, Date.now() + 30_000);
    }
  }

  return new Response(JSON.stringify({ error: 'All models unavailable' }), {
    status: 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // GET -> catalog (public shape, no auth needed)
    if (req.method === 'GET') {
      const models = availableEntries().map((e) => ({
        id: e.id,
        name: e.name,
        provider: e.provider,
        tier: e.tier,
        context: e.context,
        output: e.output,
        inputPricePer1M: e.inputPricePer1M,
        outputPricePer1M: e.outputPricePer1M,
        enabled: true,
      }));
      return new Response(JSON.stringify({ models }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Every chat request requires a logged-in user (per-user metering).
    const { user, error } = await verifyUser(req, admin);
    if (error || !user) {
      return new Response(JSON.stringify({ error }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let chatReq: ChatRequest;
    try {
      chatReq = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: verify — server-side URL/DOI liveness for the research verifier.
    if (chatReq.action === 'verify') {
      const urls = Array.isArray(chatReq.urls)
        ? chatReq.urls.filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)).slice(0, VERIFY_MAX_URLS)
        : [];
      if (urls.length === 0) {
        return new Response(JSON.stringify({ error: 'urls is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const results = await verifyUrls(urls);
      return new Response(JSON.stringify({ ok: true, results }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: search — server-side platform search for the research gather
    // phase (keyless-first; CORE skipped when no key is configured).
    if (chatReq.action === 'search') {
      const queries = Array.isArray(chatReq.queries)
        ? (chatReq.queries as unknown[]).filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, SEARCH_MAX_QUERIES)
        : [];
      const platforms = Array.isArray(chatReq.platforms)
        ? (chatReq.platforms as unknown[]).filter((p): p is string => typeof p === 'string').slice(0, SUPPORTED_PLATFORMS.length)
        : SUPPORTED_PLATFORMS;
      if (queries.length === 0) {
        return new Response(JSON.stringify({ error: 'queries is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { results, skipped } = await searchPlatforms(queries, platforms);
      return new Response(JSON.stringify({ ok: true, results, skipped }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(chatReq.messages) || chatReq.messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowed = await rateLimitCheck(admin, user.id);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a moment.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (chatReq.stream) {
      return await chatStream(admin, user.id, chatReq);
    }

    const result = await chatOnce(admin, user.id, chatReq);
    const status = result.ok ? 200 : 502;
    return new Response(JSON.stringify(result.ok ? {
      ok: true,
      text: result.text,
      model: result.model,
      usage: result.usage,
      latencyMs: result.latencyMs,
    } : { ok: false, error: result.error }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});