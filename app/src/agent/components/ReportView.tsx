import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { renderReportMarkdown } from '@/agent/render/renderReportMarkdown';
import type { CitationLedgerEntry, ResearchReport } from '@/agent/research/types';

interface ReportViewProps {
  report: ResearchReport;
}

export function ReportView({ report }: ReportViewProps) {
  const [highlightKey, setHighlightKey] = useState<number | null>(null);
  const elapsed = report.elapsedMs >= 60_000 ? `${(report.elapsedMs / 60_000).toFixed(1)} min` : `${report.elapsedMs}s`;
  const verifiedByKey = new Map(report.ledger.map((entry) => [entry.key, entry.verified]));
  const sorted = [...report.ledger].sort((a, b) => Number(b.verified) - Number(a.verified) || a.key - b.key);

  const handleCitation = (key: number) => {
    const el = document.getElementById(`ledger-${key}`);
    if (!el) return;
    setHighlightKey(key);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => setHighlightKey(null), 1800);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 rounded-xl border border-border bg-card/60 p-4">
          <h2 className="text-base font-semibold">{report.topic}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {report.model || '—'} · {elapsed} · {report.ledger.length} verified sources
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-5 text-sm text-foreground">
          {renderReportMarkdown(report.markdown, {
            citationVerified: (key) => verifiedByKey.get(key) ?? true,
            onCitationClick: handleCitation,
          })}
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Citation ledger ({report.ledger.length})
          </h3>
          <div className="flex flex-col gap-2">
            {sorted.map((entry) => (
              <SourceCard key={entry.key} entry={entry} highlighted={highlightKey === entry.key} />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function SourceCard({ entry, highlighted }: { entry: CitationLedgerEntry; highlighted: boolean }) {
  return (
    <a
      id={`ledger-${entry.key}`}
      href={entry.url}
      target="_blank"
      rel="noreferrer"
      className={`group rounded-lg border bg-card/60 px-3 py-2 transition ${
        highlighted
          ? 'border-ring ring-2 ring-ring/40'
          : entry.verified
            ? 'border-border hover:border-emerald-500/50'
            : 'border-amber-500/40 hover:border-amber-500/70'
      } ${entry.verified ? 'border-l-2 border-l-emerald-500/60' : 'border-l-2 border-l-amber-500/60'}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          [{entry.key}]
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium group-hover:text-foreground">{entry.title}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {entry.sourceName}
            {entry.year ? ` · ${entry.year}` : ''}
            {entry.authors?.length
              ? ` · ${entry.authors.slice(0, 3).join(', ')}${entry.authors.length > 3 ? ' et al.' : ''}`
              : ''}
          </p>
        </div>
        <span
          className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] ${
            entry.verified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {entry.verified ? '✓ verified' : '⚠ unverified'}
        </span>
      </div>
    </a>
  );
}