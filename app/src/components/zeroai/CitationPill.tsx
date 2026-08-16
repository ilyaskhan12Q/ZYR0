import { useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Source } from '@/data/zeroAiFixtures';

interface CitationPillProps {
  index: number;
  source: Source;
}

/** Inline [N] citation pill with hover + click popover showing source metadata. */
export function CitationPill({ index, source }: CitationPillProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const openCard = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={openCard}
          onMouseLeave={scheduleClose}
          onClick={(e) => {
            // Radix PopoverTrigger's own onClick always calls onOpenChange(false),
            // so stop propagation or a click (mouse or keyboard Enter) can never open.
            e.stopPropagation();
            openCard();
          }}
          aria-label={`Citation ${index}: ${source.title}`}
          className="za-mono mx-0.5 inline-flex h-[15px] min-w-[15px] -translate-y-[1px] items-center justify-center rounded border border-indigo-400/40 bg-indigo-400/10 px-[3px] align-super text-[9px] leading-none text-indigo-300 transition-colors hover:border-indigo-400/70 hover:bg-indigo-400/20"
        >
          {index}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        onMouseEnter={openCard}
        onMouseLeave={scheduleClose}
        className="w-72 rounded-xl p-0"
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`za-mono rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-widest ${
                source.kind === 'academic'
                  ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300'
                  : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
              }`}
            >
              {source.kind === 'academic' ? 'ACADEMIC' : 'INDUSTRY'}
            </span>
            <span className="za-mono text-[9px] tracking-widest text-muted-foreground">[{index}]</span>
          </div>
          <p className="mt-2.5 text-xs font-semibold leading-snug text-foreground">{source.title}</p>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{source.authors}</p>
          <p className="za-mono mt-1.5 text-[10px] text-muted-foreground/70">
            {source.venue} · {source.year}
          </p>
          {source.doi && (
            <a
              href={`https://doi.org/${source.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2.5 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-primary transition-colors hover:bg-primary/10"
            >
              View DOI <ExternalLink className="size-2.5" />
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}