import type { EvidenceItem, SubTaskContract } from '@/agent/research/types';

// Hard per-worker deadline (bounded-concurrency spec: 10-12s, Promise.allSettled isolation).
const WORKER_TIMEOUT_MS = 12_000;
const JINA_TIMEOUT_MS = 10_000;

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
// Worker A — Academic (OpenAlex + arXiv + Semantic Scholar, all keyless)
// ---------------------------------------------------------------------------

async function openAlex(query: string): Promise<EvidenceItem[]> {
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

async function arxiv(query: string): Promise<EvidenceItem[]> {
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

async function semanticScholar(query: string): Promise<EvidenceItem[]> {
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

export async function academicWorker(
  contracts: SubTaskContract[],
  onItem?: (item: EvidenceItem) => void,
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  const errors: string[] = [];
  const items: EvidenceItem[] = [];

  for (const contract of contracts) {
    for (const query of contractQueries(contract)) {
      const [oa, ax, s2] = await Promise.all([
        openAlex(query).catch(() => []),
        arxiv(query).catch(() => []),
        semanticScholar(query).catch(() => []),
      ]);
      const batch = dedupeByUrl([...oa, ...ax, ...s2]);
      for (const item of batch) {
        items.push(item);
        onItem?.(item);
      }
    }
  }

  return { items: dedupeByUrl(items).slice(0, 8), errors };
}

// ---------------------------------------------------------------------------
// Worker B — Web (Jina: s.jina.ai search + r.jina.ai content fetch, keyless)
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
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  const errors: string[] = [];
  const items: EvidenceItem[] = [];

  const queries = contracts.flatMap((contract) => contractQueries(contract)).slice(0, 3);

  for (const query of queries) {
    try {
      const links = await jinaSearch(query);
      const withSnippets = await Promise.all(
        links.slice(0, 2).map(async (link) => ({
          link,
          snippet: await jinaFetch(link.url),
        })),
      );
      for (const { link, snippet } of withSnippets) {
        const item: EvidenceItem = {
          id: nextId(),
          title: link.title,
          url: link.url,
          sourceType: 'web',
          sourceName: 'Jina Web',
          snippet: snippet.slice(0, 400),
        };
        items.push(item);
        onItem?.(item);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Jina query failed');
    }
  }

  return { items: dedupeByUrl(items).slice(0, 4), errors };
}

// ---------------------------------------------------------------------------
// Orchestrator — bounded concurrency 2, Promise.allSettled isolation
// ---------------------------------------------------------------------------

export async function runWorkers(
  contracts: SubTaskContract[],
  onWorkerStart?: (name: 'academic' | 'web') => void,
  onItem?: (item: EvidenceItem) => void,
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  onWorkerStart?.('academic');
  onWorkerStart?.('web');

  const [academic, web] = await Promise.allSettled([
    academicWorker(contracts, onItem),
    webWorker(contracts, onItem),
  ]);

  const items: EvidenceItem[] = [];
  const errors: string[] = [];

  if (academic.status === 'fulfilled') {
    items.push(...academic.value.items);
    errors.push(...academic.value.errors);
  } else {
    errors.push(`academic worker: ${academic.reason}`);
  }
  if (web.status === 'fulfilled') {
    items.push(...web.value.items);
    errors.push(...web.value.errors);
  } else {
    errors.push(`web worker: ${web.reason}`);
  }

  return { items: dedupeByUrl(items).slice(0, 12), errors };
}