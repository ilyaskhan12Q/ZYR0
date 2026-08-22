import { verifyUrls } from '@/agent/api/gateway';
import type { CitationLedgerEntry, EvidenceItem } from '@/agent/research/types';

function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

function dedupe(items: EvidenceItem[]): EvidenceItem[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: EvidenceItem[] = [];

  for (const item of items) {
    const urlKey = normalizeUrl(item.url);
    const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
    if (seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;
    seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    out.push(item);
  }
  return out;
}

/**
 * Verify + normalize evidence into a deterministic citation ledger.
 * - Dedupes by normalized URL and fuzzy title.
 * - Drops dead links (HTTP >= 400); network-timeout/unknown (status 0) are kept
 *   but flagged `verified: false` with `key: 0` (kept out of citations).
 * - Assigns citation keys [1]..[N] to verified entries only, so every [n]
 *   cited by the report points to a live-confirmed source.
 */
export async function verifyAndBuildLedger(
  items: EvidenceItem[],
): Promise<{ ledger: CitationLedgerEntry[]; dropped: number }> {
  const unique = dedupe(items);
  if (unique.length === 0) return { ledger: [], dropped: items.length };

  const results = await verifyUrls(unique.map((item) => item.url)).catch(() => null);
  const statusByUrl = new Map<string, number>();
  if (results) {
    for (const r of results) statusByUrl.set(normalizeUrl(r.url), r.status);
  }

  const ledger: CitationLedgerEntry[] = [];
  let dropped = items.length - unique.length;
  let verifiedKey = 0;

  for (let i = 0; i < unique.length; i++) {
    const item = unique[i];
    const status = statusByUrl.get(normalizeUrl(item.url)) ?? 0;
    if (status > 0 && status >= 400) {
      dropped += 1; // dead link — exclude from the ledger
      continue;
    }
    const verified = status > 0 && status < 400;
    ledger.push({
      ...item,
      key: verified ? verifiedKey + 1 : 0, // deterministic [1]..[N] for verified only
      verified,
      status,
    });
    if (verified) verifiedKey += 1;
  }

  return { ledger, dropped };
}

/** Verified entries only, in ledger order — the citation set for the report. */
export function verifiedOnly(ledger: CitationLedgerEntry[]): CitationLedgerEntry[] {
  return ledger.filter((entry) => entry.verified);
}