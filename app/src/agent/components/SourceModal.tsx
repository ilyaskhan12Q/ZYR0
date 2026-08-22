import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BadgeCheck, ExternalLink, X } from 'lucide-react';
import type { CitationLedgerEntry } from '@/agent/research/types';

interface SourceModalProps {
  entry: CitationLedgerEntry | null;
  onOpenChange: (open: boolean) => void;
}

export function SourceModal({ entry, onOpenChange }: SourceModalProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-x-0 bottom-0 flex max-h-[85dvh] w-full flex-col rounded-t-xl border border-border border-b-0 bg-card p-6 outline-none sm:inset-x-auto sm:inset-y-4 sm:right-4 sm:w-[400px] sm:max-h-none sm:rounded-[2px] sm:border-b">
        {entry && (
          <>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-secondary-foreground transition hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="shrink-0 pr-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground">
                Source {entry.key}
              </p>
              <h2 className="agent-serif mt-2 text-2xl font-semibold leading-snug text-foreground">
                {entry.title}
              </h2>
              <p className="mt-2 text-sm text-secondary-foreground">
                {entry.authors?.slice(0, 3).join(', ')}
                {entry.authors && entry.authors.length > 3 ? ' et al.' : ''}
                {entry.authors?.length ? ' · ' : ''}
                {entry.sourceName}
                {entry.year ? ` · ${entry.year}` : ''}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <BadgeCheck className="size-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
              {entry.doi && (
                <div className="flex items-center gap-2 text-primary">
                  <BadgeCheck className="size-4" />
                  <span className="text-sm font-medium">DOI verified</span>
                </div>
              )}
              {entry.snippet && (
                <div className="flex items-center gap-2 text-primary">
                  <BadgeCheck className="size-4" />
                  <span className="text-sm font-medium">Evidence verified</span>
                </div>
              )}
              {!entry.verified && (
                <p className="text-xs text-[#93000a]">
                  This link could not be confirmed during verification — it may still be reachable.
                </p>
              )}
            </div>

            <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
              <div className="flex items-end justify-between border-b border-border pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Evidence</p>
                <span className="rounded bg-accent px-2 py-0.5 text-[11px] text-secondary-foreground">
                  {entry.sourceName}
                </span>
              </div>
              {entry.snippet ? (
                <blockquote className="border-l-2 border-primary/30 pl-4 text-[15px] italic leading-relaxed text-muted-foreground">
                  “{entry.snippet}
                  {entry.snippet.length >= 400 ? '…' : ''}”
                </blockquote>
              ) : (
                <p className="text-sm text-muted-foreground">No excerpt recorded for this source.</p>
              )}
              {entry.doi && (
                <p className="truncate font-mono text-[11px] text-muted-foreground">{entry.doi}</p>
              )}
            </div>

            <div className="shrink-0 border-t border-border pt-4">
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 border border-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition hover:bg-accent"
              >
                <ExternalLink className="size-4" />
                Open original source
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}