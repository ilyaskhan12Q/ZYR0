import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CitationLedgerEntry } from '@/agent/research/types';

interface SourceModalProps {
  entry: CitationLedgerEntry | null;
  onOpenChange: (open: boolean) => void;
}

export function SourceModal({ entry, onOpenChange }: SourceModalProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold leading-snug">{entry.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    entry.verified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {entry.verified ? '✓ verified' : '⚠ unverified'}
                </span>
                <span>{entry.sourceName}</span>
                {entry.year ? <span>· {entry.year}</span> : null}
                <span>· [{entry.key}]</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 text-xs">
              {entry.authors?.length ? (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Authors:</span>{' '}
                  {entry.authors.join(', ')}
                </p>
              ) : null}
              {entry.doi ? (
                <p className="truncate text-muted-foreground">
                  <span className="font-medium text-foreground">DOI:</span>{' '}
                  <span className="font-mono text-[11px]">{entry.doi}</span>
                </p>
              ) : null}
              {entry.snippet ? (
                <p className="leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Snippet:</span> “{entry.snippet}
                  {entry.snippet.length >= 400 ? '…' : ''}”
                </p>
              ) : null}
              {!entry.verified ? (
                <p className="text-amber-400/80">
                  This link could not be confirmed during verification — it may still be reachable.
                </p>
              ) : null}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" asChild>
                <a href={entry.url} target="_blank" rel="noreferrer">
                  Open source ↗
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}