import { ScrollArea } from '@/components/ui/scroll-area';
import type { ResearchReport } from '@/agent/research/types';

interface ReportViewProps {
  report: ResearchReport;
}

export function ReportView({ report }: ReportViewProps) {
  const elapsed = report.elapsedMs >= 60_000 ? `${(report.elapsedMs / 60_000).toFixed(1)} min` : `${report.elapsedMs}s`;

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 rounded-xl border border-border bg-card/60 p-4">
          <h2 className="text-base font-semibold">{report.topic}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {report.model || '—'} · {elapsed} · {report.ledger.length} verified sources
          </p>
        </div>

        <pre className="agent-serif agent-whitespace-pre-wrap rounded-xl border border-border bg-card/60 p-5 text-sm leading-relaxed text-foreground">
          {report.markdown}
        </pre>

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Citation ledger ({report.ledger.length})
          </h3>
          <div className="flex flex-col gap-2">
            {report.ledger.map((entry) => (
              <a
                key={entry.key}
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-border bg-card/60 px-3 py-2 transition hover:border-ring"
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
                      {entry.authors?.length ? ` · ${entry.authors.slice(0, 3).join(', ')}${entry.authors.length > 3 ? ' et al.' : ''}` : ''}
                    </p>
                  </div>
                  <span
                    className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
                      entry.verified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {entry.verified ? 'verified' : 'unverified'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}