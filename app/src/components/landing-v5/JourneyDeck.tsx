import { useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import {
  Filter,
  FileBadge,
  ListChecks,
  GitPullRequest,
  ClipboardCheck,
  QrCode,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { JOURNEY_PHASES, type JourneyPhase } from './journey-data';
import { Reveal } from './motion';

const ACCENT_TEXT: Record<JourneyPhase['accent'], string> = {
  sky: 'text-[#38bdf8]',
  indigo: 'text-[#818cf8]',
  emerald: 'text-[#34d399]',
};

const ACCENT_GLOW: Record<JourneyPhase['accent'], string> = {
  sky: 'radial-gradient(ellipse 70% 60% at 80% 0%, rgba(2,132,199,0.10), transparent 70%)',
  indigo: 'radial-gradient(ellipse 70% 60% at 80% 0%, rgba(99,102,241,0.10), transparent 70%)',
  emerald: 'radial-gradient(ellipse 70% 60% at 80% 0%, rgba(16,185,129,0.10), transparent 70%)',
};

const VISUAL_ICON = {
  chips: Filter,
  seal: FileBadge,
  tasks: ListChecks,
  diff: GitPullRequest,
  rubric: ClipboardCheck,
  qr: QrCode,
} as const;

/* ── Micro-visuals ─────────────────────────────────────────────── */

function ChipsVisual() {
  const chips = ['Frontend', 'Full-Stack', 'AI / ML', 'Backend', 'Data', 'Design'];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <span
          key={c}
          className={`v5-mono text-xs px-3.5 py-1.5 rounded-full border ${
            i === 0
              ? 'border-[#0284c7] text-[#38bdf8] bg-[#0284c7]/10'
              : 'border-white/[0.08] text-white/55 bg-white/[0.02]'
          }`}
        >
          {c}
        </span>
      ))}
      <div className="w-full mt-3 v5-mono text-[11px] text-white/35">
        24 open drops · updated 2h ago
      </div>
    </div>
  );
}

function SealVisual() {
  return (
    <div className="relative rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="space-y-2 blur-[1.5px] opacity-70">
        <div className="h-2.5 w-3/4 rounded bg-white/15" />
        <div className="h-2 w-full rounded bg-white/10" />
        <div className="h-2 w-5/6 rounded bg-white/10" />
        <div className="h-2 w-2/3 rounded bg-white/10" />
      </div>
      <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-[#10b981]/15 border-2 border-[#10b981]/50 flex items-center justify-center rotate-[-10deg]">
        <span className="v5-mono text-[7px] tracking-[0.15em] text-[#34d399] text-center leading-tight">
          OFFICIAL
          <br />
          SEAL
        </span>
      </div>
      <div className="mt-3 v5-mono text-[11px] text-white/35">offer-letter.pdf · signed</div>
    </div>
  );
}

function TasksVisual() {
  const rows = [
    { label: 'Set up repo & branch protection', done: true },
    { label: 'Implement dashboard shell layout', done: true },
    { label: 'Wire Supabase RLS policies', done: true },
    { label: 'Pass accessibility audit', done: false },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2.5 text-[13px]">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${r.done ? 'text-[#10b981]' : 'text-white/20'}`} />
          <span className={r.done ? 'text-white/80' : 'text-white/45'}>{r.label}</span>
        </div>
      ))}
      <div className="pt-2">
        <div className="flex justify-between v5-mono text-[10px] text-white/40 mb-1.5">
          <span>MILESTONE PROGRESS</span>
          <span>75%</span>
        </div>
        <Progress value={75} className="h-1.5 bg-white/[0.06]" />
      </div>
    </div>
  );
}

function DiffVisual() {
  const lines = [
    { type: 'ctx', text: '@@ -12,6 +12,9 @@ async function submit' },
    { type: 'add', text: '+  const review = await mentor.rubric(prUrl);' },
    { type: 'add', text: '+  if (review.score >= 90) {' },
    { type: 'add', text: "+    await certificate.issue({ signed: true });" },
    { type: 'del', text: '-  // TODO: manual review queue' },
    { type: 'ctx', text: '  }' },
  ];
  return (
    <div className="rounded-lg border border-white/[0.08] bg-black/30 p-4 v5-mono text-[11.5px] leading-[1.8]">
      <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-white/[0.06] text-white/40">
        <GitPullRequest className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span>task-01 · 3 files changed</span>
        <span className="ml-auto text-[#34d399]">+128</span>
        <span className="text-[#f87171]">-14</span>
      </div>
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.type === 'add'
              ? 'text-[#86efac] bg-[#10b981]/[0.07]'
              : l.type === 'del'
                ? 'text-[#fca5a5] bg-[#ef4444]/[0.07]'
                : 'text-white/45'
          }
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}

function RubricVisual() {
  const rows = [
    { label: 'Code Quality', score: 'PASS', pct: '34/35' },
    { label: 'Architecture', score: 'PASS', pct: '31/35' },
    { label: 'Security & RLS', score: 'PASS', pct: '33/30*' },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
        >
          <span className="text-[13px] text-white/80">{r.label}</span>
          <div className="flex items-center gap-3">
            <span className="v5-mono text-[11px] text-white/45">{r.pct}</span>
            <span className="v5-mono text-[10px] tracking-[0.15em] px-2 py-0.5 rounded border border-[#10b981]/40 text-[#34d399] bg-[#10b981]/10">
              {r.score}
            </span>
          </div>
        </div>
      ))}
      <div className="pt-1 v5-mono text-[11px] text-white/35">* bonus for edge-case coverage</div>
    </div>
  );
}

const QR_PATTERN = [
  1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1,
  1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
  0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
  1,
];

function QrVisual() {
  return (
    <div className="flex items-center gap-5">
      <div className="grid grid-cols-11 gap-[2px] p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] shrink-0">
        {QR_PATTERN.map((v, i) => (
          <span key={i} className={`w-[7px] h-[7px] rounded-[1px] ${v ? 'bg-white/85' : 'bg-transparent'}`} />
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="v5-mono text-sm text-white">ZYR0-2026-8891</div>
        <div className="v5-mono text-[11px] text-white/40">sha256:9f2c…e41a</div>
        <div className="inline-flex items-center gap-1.5 v5-mono text-[10px] tracking-[0.15em] text-[#34d399]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          PUBLICLY VERIFIABLE
        </div>
      </div>
    </div>
  );
}

const VISUALS = {
  chips: ChipsVisual,
  seal: SealVisual,
  tasks: TasksVisual,
  diff: DiffVisual,
  rubric: RubricVisual,
  qr: QrVisual,
} as const;

/* ── Card ──────────────────────────────────────────────────────── */

function JourneyCard({ phase }: { phase: JourneyPhase }) {
  const Icon = VISUAL_ICON[phase.visual];
  const Visual = VISUALS[phase.visual];
  return (
    <article
      className="v5-card rounded-2xl p-7 sm:p-10 mb-[6vh] min-h-[400px] flex flex-col justify-between relative overflow-hidden"
      style={{ background: `${ACCENT_GLOW[phase.accent]}, #0f1117` }}
    >
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className={`v5-mono text-5xl sm:text-6xl font-bold tracking-tight ${ACCENT_TEXT[phase.accent]} opacity-90`}>
            [{phase.index}]
          </div>
          <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {phase.title}
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[#a2a2c3] max-w-md leading-relaxed">
            {phase.subtitle}
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] items-center justify-center">
          <Icon className={`w-5 h-5 ${ACCENT_TEXT[phase.accent]}`} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <ul className="space-y-3">
          {phase.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-white/75 leading-relaxed">
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${ACCENT_TEXT[phase.accent]}`} />
              {p}
            </li>
          ))}
        </ul>
        <Visual />
      </div>
    </article>
  );
}

/* ── Section ───────────────────────────────────────────────────── */

export function JourneyDeck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: deckRef,
    offset: ['start center', 'end center'],
  });
  const nodeY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="py-20 lg:py-28 content-visibility-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="v5-eyebrow text-[#38bdf8]">The Lifecycle</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Six phases. Zero ambiguity.{' '}
            <span className="font-accent text-[#34d399]">Fully verified.</span>
          </h2>
          <p className="mt-4 text-[#a2a2c3] leading-relaxed">
            From first application to cryptographic credential — every internship on ZYR0 follows
            the same transparent, documented path.
          </p>
        </Reveal>

        <div ref={deckRef} className="grid lg:grid-cols-[28%_72%] gap-10">
          {/* Timeline rail (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-32 self-start">
              <div className="relative pl-8">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/[0.08]" />
                <m.span
                  style={{ top: nodeY }}
                  className="absolute left-0 w-[15px] h-[15px] rounded-full border-2 border-[#38bdf8] bg-[#08090a] shadow-[0_0_14px_rgba(56,189,248,0.55)]"
                />
                <ol className="space-y-7">
                  {JOURNEY_PHASES.map((p) => (
                    <li key={p.index} className="v5-mono text-xs tracking-[0.14em] text-white/45 uppercase">
                      <span className={ACCENT_TEXT[p.accent]}>{p.index}</span>
                      <span className="mx-2 text-white/20">·</span>
                      {p.title}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Stacking deck */}
          <div className="relative">
            {JOURNEY_PHASES.map((p, i) => (
              <div
                key={p.index}
                className="lg:sticky"
                style={{ top: `calc(5.5rem + ${i * 14}px)`, zIndex: i + 1 }}
              >
                <JourneyCard phase={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
