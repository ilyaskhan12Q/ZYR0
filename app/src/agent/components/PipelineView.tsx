import { useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { EvidenceItem, PipelineStage } from '@/agent/research/types';

const STAGE_LABELS: Record<string, string> = {
  planning: 'Planning',
  working: 'Working',
  verifying: 'Verifying',
  writing: 'Writing',
};

interface PipelineViewProps {
  stage: PipelineStage;
  message: string;
  detail?: string;
  evidence: EvidenceItem[];
  errors: string[];
  running: boolean;
  onRun: (topic: string) => void;
  onStop: () => void;
}

export function PipelineView({ stage, message, detail, evidence, errors, running, onRun, onStop }: PipelineViewProps) {
  const [value, setValue] = useState('');
  const active = running && (stage === 'planning' || stage === 'working' || stage === 'verifying' || stage === 'writing');

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

      {evidence.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Evidence gathered ({evidence.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {evidence.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${item.sourceType === 'academic' ? 'bg-indigo-400' : 'bg-emerald-400'}`}
                />
                <span className="truncate">{item.sourceName}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}