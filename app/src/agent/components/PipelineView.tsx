import { useEffect, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { CitationLedgerEntry, EvidenceItem, PipelineStage } from '@/agent/research/types';
import type { WorkerProgress } from '@/agent/hooks/useResearchPipeline';

const STAGE_LABELS: Record<string, string> = {
  planning: 'Planning',
  working: 'Working',
  verifying: 'Verifying',
  writing: 'Writing',
};

const SOURCE_NAMES = ['OpenAlex', 'arXiv', 'Semantic Scholar', 'PubMed', 'CORE', 'Jina Web'] as const;

interface PipelineViewProps {
  stage: PipelineStage;
  message: string;
  detail?: string;
  evidence: EvidenceItem[];
  ledger: CitationLedgerEntry[];
  errors: string[];
  workerProgress: WorkerProgress;
  running: boolean;
  prefill?: { topic: string; seq: number } | null;
  onRun: (topic: string) => void;
  onStop: () => void;
}

export function PipelineView({
  stage,
  message,
  detail,
  evidence,
  ledger,
  errors,
  workerProgress,
  running,
  prefill,
  onRun,
  onStop,
}: PipelineViewProps) {
  const [value, setValue] = useState('');
  const [errorsOpen, setErrorsOpen] = useState(false);

  useEffect(() => {
    if (prefill) setValue(prefill.topic);
  }, [prefill]);
  const active =
    running && (stage === 'planning' || stage === 'working' || stage === 'verifying' || stage === 'writing');
  const verifiedUrls = new Set(ledger.map((entry) => entry.url));

  const submit = () => {
    const text = value.trim();
    if (!text || running) return;
    onRun(text);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div>
        <h2 className="text-lg font-semibold">Deep research pipeline</h2>
        <p className="text-xs text-muted-foreground">
          Planner → 2 workers (OpenAlex, arXiv, Semantic Scholar, Jina web) → verifier → editorial. Every claim is
          grounded in a verified citation ledger.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Research topic — e.g. Silicon anode batteries for EVs (Shift+Enter for newlines)"
          disabled={running}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-60"
        />
        {running ? (
          <Button variant="secondary" onClick={onStop} className="h-11 shrink-0">
            Stop
          </Button>
        ) : (
          <Button onClick={submit} disabled={!value.trim()} className="h-11 shrink-0">
            Run research
          </Button>
        )}
      </div>

      {active && (
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex gap-1">
              <span className="agent-pulse-dot size-1.5 rounded-full bg-primary" />
              <span className="agent-pulse-dot size-1.5 rounded-full bg-primary" />
              <span className="agent-pulse-dot size-1.5 rounded-full bg-primary" />
            </span>
            <span className="font-medium">
              {STAGE_LABELS[stage] ?? 'Working'} — {message}
            </span>
          </div>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
          <div className="mt-3 flex items-center gap-1.5">
            {(Object.keys(STAGE_LABELS) as string[]).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  STAGE_LABELS[s] === STAGE_LABELS[stage]
                    ? 'bg-primary'
                    : Object.keys(STAGE_LABELS).indexOf(s) < Object.keys(STAGE_LABELS).indexOf(stage)
                      ? 'bg-primary/40'
                      : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {stage === 'planning' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card/40 p-4">
              <div className="h-2.5 w-24 rounded bg-border" />
              <div className="mt-2 h-2 w-full rounded bg-border/70" />
              <div className="mt-1 h-2 w-3/4 rounded bg-border/70" />
            </div>
          ))}
        </div>
      )}

      {stage === 'working' && (
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Sources</p>
          <div className="flex flex-col gap-1.5">
            {SOURCE_NAMES.map((name) => {
              const count = workerProgress.counts[name] ?? 0;
              const done = workerProgress.active.length === 0;
              return (
                <div key={name} className="flex items-center gap-2 text-xs">
                  {done ? (
                    <span className="size-3 shrink-0 rounded-full bg-emerald-500/20 text-center text-[9px] leading-3 text-emerald-400">
                      ✓
                    </span>
                  ) : (
                    <span className="agent-pulse-dot size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="text-muted-foreground">{name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{count > 0 ? `${count} found` : '0 found'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {evidence.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Evidence gathered ({evidence.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {evidence.map((item) => {
              const verified = verifiedUrls.has(item.url);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`${item.title}${item.year ? ` (${item.year})` : ''}`}
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] transition hover:text-foreground ${
                    verified
                      ? 'border-emerald-500/40 text-emerald-300/90'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      item.sourceType === 'academic' ? 'bg-indigo-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.sourceName}</span>
                  {verified && <span className="text-emerald-400">✓</span>}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <button
            type="button"
            onClick={() => setErrorsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between font-medium"
          >
            <span>
              {errors.length} note{errors.length > 1 ? 's' : ''} — workers / verifier
            </span>
            <span>{errorsOpen ? '▲' : '▼'}</span>
          </button>
          {errorsOpen && (
            <div className="mt-2 flex flex-col gap-1">
              {errors.map((err, i) => (
                <p key={i} className="text-[11px] opacity-80">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}