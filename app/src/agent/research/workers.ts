import type { EvidenceItem, SubTaskContract } from '@/agent/research/types';
import { searchPlatforms, type GatewayPlatform } from '@/agent/api/gateway';

// Single server-side search covers all platforms in parallel; the gateway
// is authoritative for every platform (browser-direct arXiv is CORS-blocked,
// and slow Jina web responses blew the old 12-15s browser timeouts silently).
const GATEWAY_TIMEOUT_MS = 90_000;

// Gathering volume: target 8-16 evidence items.
const TOTAL_CAP = 16; // hard aggregate cap

export type WorkerName = 'gateway';

// ---------------------------------------------------------------------------
// Orchestrator — one parallel gateway search, allSettled isolation
// ---------------------------------------------------------------------------

const ALL_PLATFORMS: GatewayPlatform[] = ['openalex', 'arxiv', 'semanticscholar', 'pubmed', 'core', 'web'];

export async function runWorkers(
  contracts: SubTaskContract[],
  onWorkerStart?: (name: WorkerName) => void,
  onItem?: (item: EvidenceItem) => void,
  onNote?: (note: string) => void,
): Promise<{ items: EvidenceItem[]; errors: string[] }> {
  const errors: string[] = [];

  const queries = contracts
    .flatMap((c) => contractQueries(c))
    .filter((q) => q && q.trim().length > 3)
    .slice(0, 12);

  onWorkerStart?.('gateway');
  const gateway = await withTimeout(searchPlatforms(queries, ALL_PLATFORMS), GATEWAY_TIMEOUT_MS);
  if (!gateway) {
    errors.push('search: gateway request failed or timed out — no sources gathered');
    return { items: [], errors };
  }

  for (const platform of gateway.skipped) {
    onNote?.(`${platform}: no API key configured — skipped (keyless-first)`);
  }
  for (const platform of gateway.empty) {
    onNote?.(`${platform}: 0 results — possibly rate-limited or blocked`);
  }

  const interleaved = interleaveByPlatform(gateway.results, TOTAL_CAP);

  for (const item of interleaved) onItem?.(item);
  return { items: interleaved, errors };
}

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

function contractQueries(contract: SubTaskContract): string[] {
  const queries = [contract.subTopicTitle, ...contract.keywords.slice(0, 2)];
  return queries.filter((q) => q && q.trim().length > 3).slice(0, 3);
}

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

// Round-robin across platforms so one prolific platform (e.g. OpenAlex)
// cannot fill the cap before others are represented.
function interleaveByPlatform(results: Record<string, EvidenceItem[]>, cap: number): EvidenceItem[] {
  const queues = Object.entries(results)
    .map(([platform, items]) => ({ platform, items: dedupeByUrl(items) }))
    .filter((q) => q.items.length > 0);
  const out: EvidenceItem[] = [];
  let idx = 0;
  let added = true;
  while (added && out.length < cap) {
    added = false;
    for (const q of queues) {
      if (out.length >= cap) break;
      if (idx < q.items.length) {
        out.push(q.items[idx]);
        added = true;
      }
    }
    idx += 1;
  }
  return out;
}
