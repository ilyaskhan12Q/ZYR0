import { useState } from 'react';
import { AlertTriangle, Check, RefreshCw, X } from 'lucide-react';
import { LandingView } from '@/agent/components/LandingView';
import type { CitationLedgerEntry, EvidenceItem, PipelineStage, ResearchDepth } from '@/agent/research/types';
import type { WorkerProgress } from '@/agent/hooks/useResearchPipeline';

const SOURCE_NAMES = ['OpenAlex', 'arXiv', 'Semantic Scholar', 'PubMed', 'CORE', 'Jina Web'] as const;

const STEPS = [
  { label: 'Understanding question', detail: 'Parsing your query into research dimensions' },
  { label: 'Building plan', detail: 'Drafting worker contracts and sub-questions' },
  { label: 'Searching academic sources', detail: 'OpenAlex · arXiv · Semantic Scholar · PubMed · CORE · Jina' },
  { label: 'Verifying evidence', detail: 'Checking every link and matching the citation ledger' },
  { label: 'Writing report', detail: 'Editorial agent composing the final document' },
] as const;

const ACTIVE_STEP: Partial<Record<PipelineStage, number>> = {
  planning: 0,
  working: 2,
  verifying: 3,
  writing: 4,
};

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
  onRun: (topic: string, depth: ResearchDepth) => void;
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
  const [errorsOpen, setErrorsOpen] = useState(false);
  const active =
    running && (stage === 'planning' || stage === 'working' || stage === 'verifying' || stage === 'writing');
  const failed = stage === 'failed';
  const verifiedUrls = new Set(ledger.map((entry) => entry.url));
  const activeStep = ACTIVE_STEP[stage];

  if (!active) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        {failed && (
          <div className="flex items-center gap-2 border-b border-[#ffdad6] bg-[#ffdad6] px-6 py-2.5 text-xs text-[#93000a]">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>
              {message || 'Research failed'} — {detail || 'The run was interrupted. Try again.'}
            </span>
          </div>
        )}
        {errors.length > 0 && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-xs text-amber-900">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>{errors.length} worker note{errors.length > 1 ? 's' : ''}</span>
          </div>
        )}
        <LandingView prefill={prefill} running={running} onRun={onRun} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 md:flex-row">
      {/* Stage tracker */}
      <div className="w-full shrink-0 md:w-72">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Step {activeStep !== undefined ? activeStep + 1 : '—'} of {STEPS.length}
        </p>
        <h2 className="agent-serif mt-1 text-3xl font-semibold text-foreground">Researching your question</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>

        <ol className="mt-8 space-y-8 border-l border-border pl-6">
          {STEPS.map((step, i) => {
            const done = activeStep !== undefined && i < activeStep;
            const current = activeStep !== undefined && i === activeStep;
            return (
              <li key={step.label} className="relative">
                <span
                  className={`absolute -left-[31px] top-0.5 flex size-3.5 items-center justify-center ${
                    done
                      ? 'bg-[#4f46e5] text-white'
                      : current
                        ? ''
                        : 'border-2 border-[#777587]'
                  }`}
                >
                  {done && <Check className="size-2.5" strokeWidth={3} />}
                  {current && (
                    <span className="flex gap-[3px]">
                      <span className="agent-dot size-[3px] rounded-full bg-primary" />
                      <span className="agent-dot size-[3px] rounded-full bg-primary" />
                      <span className="agent-dot size-[3px] rounded-full bg-primary" />
                    </span>
                  )}
                </span>
                <p
                  className={`text-sm font-medium ${
                    done || current ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                {(done || current) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {current ? (detail ?? step.detail) : step.detail}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            <X className="size-3.5" />
            Stop research
          </button>
          <span className="text-[11px] text-muted-foreground">Planner → workers → verifier → editorial</span>
        </div>
      </div>

      {/* Live evidence */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Live evidence discovered
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="agent-pulse-dot size-3.5" />
            <span>{evidence.length} item{evidence.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {SOURCE_NAMES.map((name) => {
            const count = workerProgress.counts[name] ?? 0;
            return (
              <span
                key={name}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {name} <span className="font-medium text-foreground">{count}</span>
              </span>
            );
          })}
        </div>

        {evidence.length === 0 ? (
          <div className="mt-6 rounded-[2px] border border-border bg-card p-6">
            <div className="h-2.5 w-32 rounded bg-border" />
            <div className="mt-3 h-2 w-full rounded bg-border/70" />
            <div className="mt-1.5 h-2 w-4/5 rounded bg-border/70" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {evidence.map((item) => {
              const verified = verifiedUrls.has(item.url);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="agent-fade-up rounded-[2px] border border-border bg-card p-4 shadow-sm transition hover:border-primary"
                >
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{item.title}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {item.authors?.[0] ? `${item.authors[0]}${item.authors.length > 1 ? ' et al.' : ''}` : item.sourceName}
                    {item.year ? ` · ${item.year}` : ''}
                  </p>
                  {verified && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded bg-[#dcfce7] px-2 py-0.5 text-[11px] font-medium text-[#166534]">
                      <Check className="size-3" strokeWidth={3} />
                      Verified
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-6 rounded-[2px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <button
              type="button"
              onClick={() => setErrorsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between font-medium"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
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
    </div>
  );
}