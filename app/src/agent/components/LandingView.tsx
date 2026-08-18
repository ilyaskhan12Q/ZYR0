import { useEffect, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Building2, Brain, GraduationCap, Mic, Upload } from 'lucide-react';
import type { ResearchDepth } from '@/agent/research/types';

interface LandingViewProps {
  prefill?: { topic: string; seq: number } | null;
  running: boolean;
  onRun: (topic: string, depth: ResearchDepth) => void;
}

const DEPTHS: { id: ResearchDepth; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'Faster — fewer sources, shorter report' },
  { id: 'standard', label: 'Standard', hint: 'Balanced depth and coverage' },
  { id: 'deep', label: 'Deep', hint: 'Maximum sources and analysis' },
];

const SUGGESTIONS = [
  {
    icon: GraduationCap,
    title: 'Quantum Ethics',
    description:
      'Exploring the moral implications of quantum computing in cryptography and global security frameworks.',
  },
  {
    icon: Building2,
    title: 'Sustainable Urbanism',
    description:
      'Analyzing structural paradigms for zero-emission metropolitan infrastructure in coastal regions.',
  },
  {
    icon: Brain,
    title: 'Cognitive Load Theory',
    description:
      'Evaluating the impact of high-density digital environments on academic retention and focus.',
  },
];

export function LandingView({ prefill, running, onRun }: LandingViewProps) {
  const [value, setValue] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('standard');

  useEffect(() => {
    if (prefill) setValue(prefill.topic);
  }, [prefill]);

  const submit = () => {
    const text = value.trim();
    if (!text || running) return;
    onRun(text, depth);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <h1 className="agent-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            ZYROO
          </h1>
          <p className="agent-serif mt-3 text-2xl font-medium text-muted-foreground sm:text-3xl">
            Research anything. Understand everything.
          </p>
        </div>

        <div className="group mt-12">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Enter your research query, hypothesis, or topic..."
            disabled={running}
            className="w-full resize-none border-0 border-b border-border bg-transparent pb-4 pt-1 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 opacity-0 transition group-focus-within:opacity-100">
              <button
                type="button"
                disabled
                title="Voice input (coming soon)"
                className="flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <Mic className="size-[18px]" />
              </button>
              <button
                type="button"
                disabled
                title="Attach files (coming soon)"
                className="flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <Upload className="size-[18px]" />
              </button>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              {running ? (
                <span className="text-xs text-muted-foreground">Research in progress…</span>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!value.trim()}
                  title="Run research (Enter)"
                  className="flex size-11 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-primary disabled:opacity-30"
                >
                  <ArrowUp className="size-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {DEPTHS.map((mode) => (
            <button
              key={mode.id}
              type="button"
              title={mode.hint}
              onClick={() => setDepth(mode.id)}
              className={`rounded-[2px] border px-6 py-2 text-sm font-medium transition ${
                depth === mode.id
                  ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="mt-16">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Suggested Research
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setValue(s.description)}
                className="rounded-[2px] border border-border bg-card p-6 text-left transition hover:border-primary"
              >
                <s.icon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{s.title}</p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}