import { useEffect } from 'react';
import { FlaskConical, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ResearchPromptDialogProps {
  prompt: string | null;
  onQuickAnswer: () => void;
  onResearchInstead: () => void;
}

export function ResearchPromptDialog({ prompt, onQuickAnswer, onResearchInstead }: ResearchPromptDialogProps) {
  useEffect(() => {
    if (!prompt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onQuickAnswer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prompt, onQuickAnswer]);

  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Research mode prompt">
      <button
        type="button"
        aria-label="Dismiss — quick answer instead"
        onClick={onQuickAnswer}
        className="za-fade-in absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px]"
      />
      <div className="za-pop-rise relative w-full max-w-md rounded-2xl border border-z-edge-strong bg-card p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10">
            <FlaskConical className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">This looks like a research question</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <span className="line-clamp-2 text-foreground/80">"{prompt}"</span>
              <span className="mt-1 block">
                Want the full citation-grade report — planned, searched, verified and synthesized — or a quick answer?
              </span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onQuickAnswer} className="text-xs">
            <Zap className="size-3.5" />
            Quick answer
          </Button>
          <Button size="sm" onClick={onResearchInstead} className="text-xs">
            <FlaskConical className="size-3.5" />
            Research instead
          </Button>
        </div>
      </div>
    </div>
  );
}