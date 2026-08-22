import { useState } from 'react';
import { ChevronDown, ShieldAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DIMENSION_LABELS, type DecompositionResult, type SubTaskContract } from '@/data/zeroAiTypes';

interface DecompositionViewProps {
  result: DecompositionResult;
}

function ContractRow({ contract, index, open, onToggle }: { contract: SubTaskContract; index: number; open: boolean; onToggle: () => void }) {
  return (
    <div
      className="za-log-in rounded-xl border bg-background/40"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="za-mono text-[10px] font-bold tracking-widest text-indigo-300">
          TASK {contract.taskId}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-foreground">{DIMENSION_LABELS[contract.dimension]}</span>
          <span className="block truncate text-[10px] text-muted-foreground">{contract.focusArea}</span>
        </span>
        <ChevronDown className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-3 border-t px-3 py-3 text-[11px] leading-relaxed">
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">SUB-TOPIC</span>
            <p className="mt-0.5 text-foreground/90">{contract.subTopicTitle}</p>
          </div>
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">CORE OBJECTIVE</span>
            <p className="mt-0.5 text-foreground/90">{contract.coreObjective}</p>
          </div>
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">SUB-QUESTIONS</span>
            <ul className="mt-1 space-y-1">
              {contract.subQuestions.map((q) => (
                <li key={q} className="flex gap-1.5 text-foreground/80">
                  <span className="text-muted-foreground/60">–</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">KEY ENTITIES & KEYWORDS</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {contract.keywords.map((k) => (
                <span key={k} className="rounded-md border border-border bg-secondary/40 px-1.5 py-0.5 text-[10px] text-foreground/80">
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="za-mono text-[9px] font-bold tracking-widest text-emerald-300/80">INCLUDE</span>
              <ul className="mt-1 space-y-1 text-foreground/80">
                {contract.boundaries.include.map((b) => (
                  <li key={b} className="flex gap-1.5">
                    <span className="text-emerald-400/70">+</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="za-mono text-[9px] font-bold tracking-widest text-rose-300/80">EXCLUDE</span>
              <ul className="mt-1 space-y-1 text-foreground/80">
                {contract.boundaries.exclude.map((b) => (
                  <li key={b} className="flex gap-1.5">
                    <span className="text-rose-400/70">−</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">REQUIRED OUTPUT FIELDS</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {contract.outputFields.map((f) => (
                <span key={f} className="rounded-md border border-border bg-secondary/40 px-1.5 py-0.5 text-[10px] text-foreground/80">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="za-mono text-[9px] font-bold tracking-widest text-muted-foreground">TARGET SOURCE TYPES</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {contract.sourceTypes.map((s) => (
                <span key={s} className="rounded-md border border-indigo-400/25 bg-indigo-400/5 px-1.5 py-0.5 text-[10px] text-indigo-300/90">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Planner output — the 4 dimension contracts that bound the worker pool. */
export function DecompositionView({ result }: DecompositionViewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isFallback = result.provider === 'fallback';

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="za-mono text-[10px] font-bold tracking-[0.2em] text-primary">DECOMPOSITION PLAN</span>
          <span className="za-mono ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {isFallback ? (
              <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/5 px-2 py-0.5 text-amber-300">
                <ShieldAlert className="size-3" /> FALLBACK TEMPLATE
              </span>
            ) : (
              <>
                planner · {result.provider} · {result.elapsedMs}ms
              </>
            )}
          </span>
        </div>
        {result.error && <p className="mt-1.5 text-[10px] text-amber-300/80">{result.error}</p>}

        <div className="mt-3 space-y-2">
          {result.contracts.map((contract, i) => (
            <ContractRow key={contract.dimension} contract={contract} index={i} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </div>
    </div>
  );
}