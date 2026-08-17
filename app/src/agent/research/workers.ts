import type { EvidenceItem, SubTaskContract } from '@/agent/research/types';

// Hard per-worker deadline — with intra-platform parallel queries each
// platform finishes in ~1-9s; Promise.allSettled waits for the slowest.
const WORKER_TIMEOUT_MS = 12_000;
const JINA_TIMEOUT_MS = 10_000;

// Gathering volume: target 8-16 evidence items.
const PLATFORM_CAP = 6; // per academic platform
const WEB_CAP = 4; // max Jina items (2 searches + 2 fetches)
const TOTAL_CAP = 16; // hard aggregate cap

// Semantic Scholar unauthenticated rate limit ~1 rps — burst queries in
// waves of 3 with a 150ms stagger to stay under it.
const S2_WAVE_SIZE = 3;
const S2_STAGGER_MS = 150;

export type WorkerName = 'openalex' | 'arxiv' | 'semanticscholar' | 'web';

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

async function openAlexQuery(query: string): Promise<EvidenceItem[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=5`;
  const res = await withTimeout(fetch(url), WORKER_TIMEOUT_MS);
  if (!res || !res.ok) return [];
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
): Promise<EvidenceItem[]> {
  const batches = await Promise.all(contracts.flatMap((c) => contractQueries(c)).map((q) => openAlexQuery(q)));
  const items = dedupeByUrl(batches.flat()).slice(0, PLATFORM_CAP);
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Worker — arXiv (keyless, Atom RSS)
// ---------------------------------------------------------------------------

async function arxivQuery(query: string): Promise<EvidenceItem[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`;
  const res = await withTimeout(fetch(url), WORKER_TIMEOUT_MS);
  if (!res || !res.ok) return [];
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
): Promise<EvidenceItem[]> {
  const batches = await Promise.all(contracts.flatMap((c) => contractQueries(c)).map((q) => arxivQuery(q)));
  const items = dedupeByUrl(batches.flat()).slice(0, PLATFORM_CAP);
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Worker — Semantic Scholar (keyless, staggered bursts)
// ---------------------------------------------------------------------------

async function semanticScholarQuery(query: string): Promise<EvidenceItem[]> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,abstract,year,url,externalIds,authors`;
  const res = await withTimeout(fetch(url), WORKER_TIMEOUT_MS);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  if (!json?.data || !Array.isArray(json.data)) return [];

  return json.data
    .slice(0, 5)
    .map((p: Record<string, unknown>): EvidenceItem | null => {
      const title = String(p.title ?? '').trim();
      const external = p.externalIds as Record<string, unknown> | undefined;
      const doi = typeof external?.DOI === 'string' ? external.DOI : undefined;
      const url = String(p.url ?? '').trim() || (doi ? `https://doi.org/${doi}` : '');
      if (!title || !url) return null;
      const authors = Array.isArray(p.authors)
        ? (p.authors as { name?: string }[]).map((a) => a.name ?? '').filter(Boolean).slice(0, 5)
        : undefined;
      return {
        id: nextId(),
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
    .filter((item: EvidenceItem | null): item is EvidenceItem => item !== null);
}

export async function semanticScholarWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
): Promise<EvidenceItem[]> {
  const queries = contracts.flatMap((c) => contractQueries(c));
  const results: EvidenceItem[][] = [];

  for (let i = 0; i < queries.length; i += S2_WAVE_SIZE) {
    const wave = queries.slice(i, i + S2_WAVE_SIZE);
    results.push(...(await Promise.all(wave.map((q) => semanticScholarQuery(q).catch(() => [])))));
    if (i + S2_WAVE_SIZE < queries.length) {
      await new Promise((resolve) => setTimeout(resolve, S2_STAGGER_MS));
    }
  }

  const items = dedupeByUrl(results.flat()).slice(0, PLATFORM_CAP);
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Worker — Jina web (keyless, capped: 2 searches + 2 content fetches)
// ---------------------------------------------------------------------------

function extractLinks(markdown: string): { title: string; url: string }[] {
  const links: { title: string; url: string }[] = [];
  const re = /\[([^\]]{4,120})\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const url = match[2];
    if (/jina\.ai|semanticscholar\.org|openalex\.org|arxiv\.org\/(abs|pdf)/i.test(url)) continue;
    links.push({ title: match[1], url });
    if (links.length >= 10) break;
  }
  return links;
}

async function jinaSearch(query: string): Promise<{ title: string; url: string }[]> {
  const url = `https://s.jina.ai/?q=${encodeURIComponent(query)}`;
  const res = await withTimeout(fetch(url), JINA_TIMEOUT_MS);
  if (!res || !res.ok) return [];
  const text = await res.text();
  return extractLinks(text).slice(0, 6);
}

async function jinaFetch(pageUrl: string): Promise<string> {
  const res = await withTimeout(fetch(`https://r.jina.ai/${encodeURIComponent(pageUrl)}`), JINA_TIMEOUT_MS);
  if (!res || !res.ok) return '';
  return (await res.text()).slice(0, 1200);
}

export async function webWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
): Promise<EvidenceItem[]> {
  const queries = contracts.flatMap((c) => contractQueries(c)).slice(0, 2);
  const searches = await Promise.all(queries.map((q) => jinaSearch(q).catch(() => [])));

  const seen = new Set<string>();
  const links: { title: string; url: string }[] = [];
  for (const link of searches.flat()) {
    const key = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      links.push(link);
    }
    if (links.length >= WEB_CAP) break;
  }

  const withSnippets = await Promise.all(links.map(async (link) => ({ link, snippet: await jinaFetch(link.url) })));

  const items = withSnippets.map(({ link, snippet }): EvidenceItem => ({
    id: nextId(),
    title: link.title,
    url: link.url,
    sourceType: 'web',
    sourceName: 'Jina Web',
    snippet: snippet.slice(0, 400),
  }));
  for (const item of items) onItem?.(item);
  return items;
}

// ---------------------------------------------------------------------------
// Orchestrator — 4-way parallelism, allSettled isolation
// ---------------------------------------------------------------------------

export async function runWorkers(
  contracts: SubTaskContract[],
  onWorkerStart?: (name: WorkerName) => void,
  onItem?: (item: EvidenceItem) => void,
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  const workers: Array<[WorkerName, () => Promise<EvidenceItem[]>]> = [
    ['openalex', () => openAlexWorker(contracts, onItem)],
    ['arxiv', () => arxivWorker(contracts, onItem)],
    ['semanticscholar', () => semanticScholarWorker(contracts, onItem)],
    ['web', () => webWorker(contracts, onItem)],
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