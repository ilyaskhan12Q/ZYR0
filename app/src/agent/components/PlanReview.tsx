import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DIMENSION_LABELS, type SubTaskContract } from '@/agent/research/types';

interface PlanReviewProps {
  contracts: SubTaskContract[];
  provider: string;
  error?: string;
  skipReview: boolean;
  running: boolean;
  onApprove: () => void;
  onUpdate: (contracts: SubTaskContract[]) => void;
  onRegenerate: () => void;
  onSkipReviewChange: (value: boolean) => void;
  onCancel: () => void;
}

export function PlanReview({
  contracts,
  provider,
  error,
  skipReview,
  running,
  onApprove,
  onUpdate,
  onRegenerate,
  onSkipReviewChange,
  onCancel,
}: PlanReviewProps) {
  const [editable, setEditable] = useState<SubTaskContract[]>(contracts);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    setEditable(contracts);
  }, [contracts]);

  const toggle = (taskId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const patch = (taskId: number, fn: (c: SubTaskContract) => SubTaskContract) => {
    const next = editable.map((c) => (c.taskId === taskId ? fn(c) : c));
    setEditable(next);
    onUpdate(next);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Review the research plan</h2>
          <p className="text-xs text-muted-foreground">
            {contracts.length} worker contracts · {provider === 'gateway' ? 'planned by the model' : 'fallback structure'}
            {provider === 'fallback' ? ' (model output was malformed — standard structure used)' : ''}
          </p>
          {error && <p className="mt-1 text-[11px] text-amber-400">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {editable.map((contract) => {
          const isOpen = expanded.has(contract.taskId);
          return (
            <div
              key={contract.taskId}
              className="rounded-xl border border-border bg-card/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {contract.taskId}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {DIMENSION_LABELS[contract.dimension]}
                    </span>
                  </div>
                  <input
                    value={contract.focusArea}
                    onChange={(e) => patch(contract.taskId, (c) => ({ ...c, focusArea: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-transparent bg-transparent text-sm font-medium outline-none focus:border-ring focus:bg-background focus:px-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => toggle(contract.taskId)}
                  className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {isOpen ? 'Hide' : 'Details'}
                </button>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">{contract.coreObjective}</p>

              {isOpen && (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-2 text-xs">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Sub-questions
                    </p>
                    {contract.subQuestions.map((q, i) => (
                      <input
                        key={i}
                        value={q}
                        onChange={(e) =>
                          patch(contract.taskId, (c) => ({
                            ...c,
                            subQuestions: c.subQuestions.map((sq, j) => (j === i ? e.target.value : sq)),
                          }))
                        }
                        className="mb-1 w-full rounded-md border border-border bg-background px-2 py-1 outline-none focus:border-ring"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Keywords
                    </p>
                    <p className="text-muted-foreground">{contract.keywords.join(', ')}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Boundaries
                    </p>
                    <p className="text-muted-foreground">
                      Include: {contract.boundaries.include.join(', ')}
                    </p>
                    <p className="text-muted-foreground">
                      Exclude: {contract.boundaries.exclude.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Output fields
                    </p>
                    <p className="text-muted-foreground">{contract.outputFields.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={onApprove} disabled={!running || editable.length === 0}>
          Approve & research
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={!running}>
          Regenerate plan
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={!running}>
          Cancel
        </Button>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
          <input
            type="checkbox"
            checked={skipReview}
            onChange={(e) => onSkipReviewChange(e.target.checked)}
            className="accent-primary"
          />
          Skip review next time
        </label>
      </div>
    </div>
  );
}