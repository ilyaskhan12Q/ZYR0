import { useRef, useState } from 'react';
import { ArrowUp, Globe, LibraryBig } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Depth } from '@/data/zeroAiFixtures';

export interface ComposerSources {
  academic: boolean;
  industry: boolean;
}

interface HeroInputProps {
  depth: Depth;
  onDepthChange: (depth: Depth) => void;
  sources: ComposerSources;
  onSourceToggle: (key: keyof ComposerSources) => void;
  onStart: (prompt: string) => void;
}

const SUGGESTIONS = [
  'How does AI-powered internship matching affect hiring outcomes for first-job seekers in South Asia?',
  'What measurable impact do verifiable credentials have on shortlist conversion for junior roles?',
  'Compare structured mentorship programs vs unstructured internships for early-career retention.',
  'What design factors make remote-first internship programs succeed in emerging markets?',
];

export function HeroInput({ depth, onDepthChange, sources, onSourceToggle, onStart }: HeroInputProps) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = prompt.trim().length >= 2;

  const submit = () => {
    if (!canSubmit) {
      toast.info('Type at least 2 characters to start research.');
      return;
    }
    onStart(prompt.trim());
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Centered empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pt-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border bg-primary/10">
          <span className="za-mono text-sm font-bold tracking-tight text-primary">0-AI</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Deep research, without the busywork.
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Ask a question and 0-AI plans, searches, verifies and synthesizes sources into a
            citation-grade report — drafts, sources and everything in between.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setPrompt(s);
                requestAnimationFrame(() => {
                  textareaRef.current?.focus();
                  autoGrow();
                });
              }}
              className="max-w-[280px] truncate rounded-full border bg-secondary/40 px-3 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Composer box */}
      <div className="px-4 pb-4 sm:pb-6">
        <div
          className={cn(
            'mx-auto max-w-2xl rounded-2xl border bg-card p-2 shadow-lg shadow-black/20 transition-colors',
            focused ? 'border-primary/40 focus-within:ring-1 focus-within:ring-ring/50' : 'border-z-edge-strong'
          )}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              autoGrow();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ask anything — e.g. 'How does AI matching affect first-job outcomes in South Asia?'"
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            aria-label="Research question"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 pb-1 pt-2">
            {/* Depth segmented control */}
            <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5" role="group" aria-label="Depth">
              {(['STANDARD', 'EXHAUSTIVE'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onDepthChange(option)}
                  aria-pressed={depth === option}
                  className={cn(
                    'za-mono rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-widest transition-colors',
                    depth === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Source toggles */}
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <LibraryBig className="size-3 text-indigo-400/80" />
                Academic DOIs
                <Switch
                  checked={sources.academic}
                  onCheckedChange={() => onSourceToggle('academic')}
                  className="scale-75 origin-left"
                  aria-label="Include academic DOI sources"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <Globe className="size-3 text-emerald-400/80" />
                Industry
                <Switch
                  checked={sources.industry}
                  onCheckedChange={() => onSourceToggle('industry')}
                  className="scale-75 origin-left"
                  aria-label="Include industry whitepaper sources"
                />
              </label>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="za-mono text-[10px] tracking-wide text-muted-foreground/70">
                QUOTA 12,000 / 20,000
              </span>
              <Button
                size="icon-sm"
                onClick={submit}
                disabled={!canSubmit}
                aria-label="Submit research question"
                className="rounded-lg"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-muted-foreground/60">
          Phase 1 mock — results are simulated locally. No data leaves your browser.
        </p>
      </div>
    </div>
  );
}