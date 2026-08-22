import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Layers, ListChecks, PenLine, ShieldCheck, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DecompositionView } from './DecompositionView';
import {
  TELEMETRY_LOGS,
  TELEMETRY_STEPS,
  REPORT_FIXTURE,
  type ResearchReport,
  type TelemetryStepId,
} from '@/data/zeroAiFixtures';
import type { DecompositionResult } from '@/data/zeroAiTypes';

interface TelemetryStageProps {
  prompt: string;
  depth: 'STANDARD' | 'EXHAUSTIVE';
  decomposition?: DecompositionResult | null;
  onComplete: (report: ResearchReport) => void;
}

const STEP_ICONS: Record<TelemetryStepId, typeof ListChecks> = {
  planner: ListChecks,
  workers: Layers,
  verifier: ShieldCheck,
  synthesis: PenLine,
};

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TelemetryStage({ prompt, depth, decomposition, onComplete }: TelemetryStageProps) {
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);

  const totalDuration = useMemo(
    () => Math.ceil(TELEMETRY_STEPS.reduce((sum, step) => sum + step.durationSec, 0) * (depth === 'EXHAUSTIVE' ? 1.5 : 1)),
    [depth]
  );

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const secs = (now - startedAt) / 1000;
      setElapsed(secs);
      if (!completedRef.current && secs >= totalDuration) {
        completedRef.current = true;
        onComplete({ ...REPORT_FIXTURE, depth, durationSec: totalDuration, prompt, id: `ZYR0-AI-2026-${String(Date.now()).slice(-4)}` });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [totalDuration, prompt, depth, onComplete]);

  // Step states derived from cumulative timing
  const stepWindows = TELEMETRY_STEPS.reduce<{ step: (typeof TELEMETRY_STEPS)[number]; start: number; end: number }[]>(
    (acc, step) => {
      const start = acc.length ? acc[acc.length - 1].end : 0;
      const duration = step.durationSec * (depth === 'EXHAUSTIVE' ? 1.5 : 1);
      acc.push({ step, start, end: start + duration });
      return acc;
    },
    []
  );
  const stepStates = stepWindows.map(({ step, start, end }) => ({
    step,
    state:
      step.id === 'planner' && decomposition
        ? ('done' as const)
        : elapsed >= end
          ? ('done' as const)
          : elapsed >= start
            ? ('active' as const)
            : ('queued' as const),
  }));

  const visibleLogs = TELEMETRY_LOGS.filter((log) => log.at <= elapsed);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* User question bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {prompt}
        </div>
      </div>

      {decomposition && <DecompositionView result={decomposition} />}

      {/* Thinking card */}
      <div className="max-w-3xl">
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Researching your topic</span>
            <span className="za-mono ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              {formatTimer(elapsed)} / {formatTimer(totalDuration)}
            </span>
          </div>

          {/* Step chips */}
          <div className="mt-4 flex flex-wrap gap-2" role="status" aria-live="polite">
            {stepStates.map(({ step, state }) => {
              const Icon = STEP_ICONS[step.id];
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                    state === 'done' && 'za-step-done border-emerald-400/25 bg-emerald-400/5',
                    state === 'active' && 'za-step-active za-breathe border-amber-400/30 bg-amber-400/5',
                    state === 'queued' && 'za-step-queued border-border bg-secondary/30'
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="font-medium">{step.label}</span>
                  {state === 'done' && <Check className="size-3" />}
                  {state === 'active' && <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />}
                </div>
              );
            })}
          </div>

          {/* Streaming log lines */}
          <div className="mt-4 max-h-36 space-y-1 overflow-y-auto rounded-lg bg-background/60 p-3 font-medium">
            {visibleLogs.length === 0 && (
              <p className="za-mono text-[11px] text-muted-foreground/60">waiting for task planner…</p>
            )}
            {visibleLogs.map((log, i) => (
              <p key={i} className="za-log-in za-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-muted-foreground/50">
                  [{String(log.at).padStart(3, '0')}s]
                </span>{' '}
                {log.line}
              </p>
            ))}
          </div>
        </div>
        <p className="mt-2 px-1 text-[10px] text-muted-foreground/60">
          Simulated pipeline — Phase 1 runs entirely in your browser.
        </p>
      </div>
    </div>
  );
}