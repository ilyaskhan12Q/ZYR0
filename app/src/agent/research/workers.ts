import type { EvidenceItem, SubTaskContract } from '@/agent/research/types';
import { searchPlatforms, type GatewayPlatform } from '@/agent/api/gateway';

// Hard per-worker deadline — with intra-platform parallel queries each
// platform finishes in ~1-9s; Promise.allSettled waits for the slowest.
const WORKER_TIMEOUT_MS = 12_000;
const GATEWAY_TIMEOUT_MS = 15_000;
const WEB_TIMEOUT_MS = 12_000;

// Gathering volume: target 8-16 evidence items.
const PLATFORM_CAP = 6; // per browser-direct academic platform
const WEB_CAP = 4; // max Jina items (gateway caps the same)
const GATEWAY_PLATFORM_CAP = 6; // per gateway platform (S2 / PubMed / CORE)
const TOTAL_CAP = 16; // hard aggregate cap

export type WorkerName = 'openalex' | 'arxiv' | 'gateway' | 'web';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      p,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch {
    return null;
  }
}

function invertAbstract(idx: Record<string, number[]> | undefined): string {
  if (!idx) return '';
  const words: [number, string][] = [];
  for (const [word, positions] of Object.entries(idx)) {
    for (const pos of positions) words.push([pos, word]);
  }
  return words
    .sort((a, b) => a[0] - b[0])
    .map(([, word]) => word)
    .join(' ');
}

function contractQueries(contract: SubTaskContract): string[] {
  const queries = [contract.subTopicTitle, ...contract.keywords.slice(0, 2)];
  return queries.filter((q) => q && q.trim().length > 3).slice(0, 3);
}

let itemCounter = 0;
const nextId = () => `ev-${Date.now()}-${itemCounter++}`;

function dedupeByUrl(items: EvidenceItem[]): EvidenceItem[] {
  const seen = new Set<string>();
  const out: EvidenceItem[] = [];
  for (const item of items) {
    const key = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Worker — OpenAlex (keyless)
// ---------------------------------------------------------------------------

async function openAlexQuery(query: string, onNote?: (note: string) => void): Promise<EvidenceItem[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=5`;
  const res = await withTimeout(fetch(url), WORKER_TIMEOUT_MS);
  if (!res) {
    onNote?.('openalex: request failed or timed out — skipping');
    return [];
  }
  if (!res.ok) {
    onNote?.(`openalex: HTTP ${res.status} — skipping`);
    return [];
  }
  const json = await res.json().catch(() => null);
  if (!json?.results || !Array.isArray(json.results)) return [];

  return json.results
    .slice(0, 5)
    .map((r: Record<string, unknown>): EvidenceItem | null => {
      const title = String(r.title ?? '').trim();
      const doi = typeof r.doi === 'string' ? r.doi.replace('https://doi.org/', '') : undefined;
      const landing = (r.primary_location as { landing_page_url?: string } | null)?.landing_page_url;
      const url = landing || (doi ? `https://doi.org/${doi}` : '');
      if (!title || !url) return null;
      return {
        id: nextId(),
        title,
        url,
        sourceType: 'academic',
        sourceName: 'OpenAlex',
        year: typeof r.publication_year === 'number' ? r.publication_year : undefined,
        doi,
        snippet: invertAbstract(r.abstract_inverted_index as Record<string, number[]> | undefined).slice(0, 400),
      };
    })
    .filter((item: EvidenceItem | null): item is EvidenceItem => item !== null);
}

export async function openAlexWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
  onNote?: (note: string) => void,
): Promise<EvidenceItem[]> {
  const batches = await Promise.all(
    contracts.flatMap((c) => contractQueries(c)).map((q) => openAlexQuery(q, onNote)),
  );
  const items = dedupeByUrl(batches.flat()).slice(0, PLATFORM_CAP);
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Worker — arXiv (keyless, Atom RSS)
// ---------------------------------------------------------------------------

async function arxivQuery(query: string, onNote?: (note: string) => void): Promise<EvidenceItem[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`;
  const res = await withTimeout(fetch(url), WORKER_TIMEOUT_MS);
  if (!res) {
    onNote?.('arxiv: request failed or timed out — skipping');
    return [];
  }
  if (!res.ok) {
    onNote?.(`arxiv: HTTP ${res.status} — skipping`);
    return [];
  }
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const entries = Array.from(doc.getElementsByTagName('entry'));

  return entries.slice(0, 5).map((entry): EvidenceItem | null => {
    const title = entry.getElementsByTagName('title')[0]?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const summary = entry.getElementsByTagName('summary')[0]?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const url = entry.getElementsByTagName('id')[0]?.textContent?.trim() ?? '';
    const published = entry.getElementsByTagName('published')[0]?.textContent ?? '';
    if (!title || !url) return null;
    return {
      id: nextId(),
      title,
      url,
      sourceType: 'academic',
      sourceName: 'arXiv',
      year: published ? new Date(published).getFullYear() : undefined,
      snippet: summary.slice(0, 400),
    };
  }).filter((item: EvidenceItem | null): item is EvidenceItem => item !== null);
}

export async function arxivWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
  onNote?: (note: string) => void,
): Promise<EvidenceItem[]> {
  const batches = await Promise.all(
    contracts.flatMap((c) => contractQueries(c)).map((q) => arxivQuery(q, onNote)),
  );
  const items = dedupeByUrl(batches.flat()).slice(0, PLATFORM_CAP);
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Worker — Gateway search (server-side; keyless-first: S2 + PubMed keyless,
// CORE and Jina web skipped when their API keys are not configured)
// ---------------------------------------------------------------------------

const ACADEMIC_GATEWAY_PLATFORMS: GatewayPlatform[] = ['semanticscholar', 'pubmed', 'core'];

async function gatewayPlatformWorker(
  contracts: SubTaskContract[],
  platforms: GatewayPlatform[],
  timeoutMs: number,
  onItem?: (item: EvidenceItem) => void,
  onSkipped?: (platform: string) => void,
  onEmpty?: (platform: string) => void,
): Promise<EvidenceItem[]> {
  const queries = contracts.flatMap((c) => contractQueries(c)).slice(0, 12);
  const gateway = await withTimeout(searchPlatforms(queries, platforms), timeoutMs);
  if (!gateway) return [];
  for (const platform of gateway.skipped) onSkipped?.(platform);
  for (const platform of gateway.empty) onEmpty?.(platform);

  const items = dedupeByUrl(
    Object.values(gateway.results).filter((v): v is EvidenceItem[] => Boolean(v)).flat(),
  ).slice(0, GATEWAY_PLATFORM_CAP * 3);
  for (const item of items) onItem?.(item);
  return items;
}

export async function gatewayAcademicWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
  onSkipped?: (platform: string) => void,
  onEmpty?: (platform: string) => void,
): Promise<EvidenceItem[]> {
  return gatewayPlatformWorker(contracts, ACADEMIC_GATEWAY_PLATFORMS, GATEWAY_TIMEOUT_MS, onItem, onSkipped, onEmpty);
}

export async function webWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
  onSkipped?: (platform: string) => void,
  onEmpty?: (platform: string) => void,
): Promise<EvidenceItem[]> {
  const items = await gatewayPlatformWorker(contracts, ['web'], WEB_TIMEOUT_MS, onItem, onSkipped, onEmpty);
  return items.slice(0, WEB_CAP);
}

// ---------------------------------------------------------------------------
// Orchestrator — 4-way parallelism, allSettled isolation
// ---------------------------------------------------------------------------

export async function runWorkers(
  contracts: SubTaskContract[],
  onWorkerStart?: (name: WorkerName) => void,
  onItem?: (item: EvidenceItem) => void,
  onNote?: (note: string) => void,
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  const workers: Array<[WorkerName, () => Promise<EvidenceItem[]>]> = [
    ['openalex', () => openAlexWorker(contracts, onItem, onNote)],
    ['arxiv', () => arxivWorker(contracts, onItem, onNote)],
    [
      'gateway',
      () =>
        gatewayAcademicWorker(
          contracts,
          onItem,
          (platform) => onNote?.(`${platform}: no API key configured — skipped (keyless-first)`),
          (platform) => onNote?.(`${platform}: 0 results — possibly rate-limited`),
        ),
    ],
    [
      'web',
      () =>
        webWorker(
          contracts,
          onItem,
          (platform) => onNote?.(`${platform}: no API key configured — skipped (keyless-first)`),
          (platform) => onNote?.(`${platform}: 0 results — search returned nothing`),
        ),
    ],
  ];

  const errors: string[] = [];
  const settled = await Promise.allSettled(
    workers.map(([name, run]) => {
      onWorkerStart?.(name);
      return run();
    }),
  );

  const items: EvidenceItem[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') items.push(...result.value);
    else errors.push(`${workers[i][0]} worker: ${result.reason}`);
  });

  return { items: dedupeByUrl(items).slice(0, TOTAL_CAP), errors };
}