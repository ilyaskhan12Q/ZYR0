import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  ArrowRight,
  QrCode,
  ShieldCheck,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { V5_SPRING, usePrefersReducedMotion } from './motion';

interface IdeToken {
  text: string;
  cls?: string;
}

const IDE_LINES: IdeToken[][] = [
  [
    { text: '// task-01 · build an accessible dashboard shell', cls: 'text-[#64748b]' },
  ],
  [
    { text: 'import', cls: 'text-[#c084fc]' },
    { text: ' { createClient } ', cls: 'text-white/85' },
    { text: 'from', cls: 'text-[#c084fc]' },
    { text: ' "@supabase/supabase-js"', cls: 'text-[#86efac]' },
    { text: ';', cls: 'text-white/50' },
  ],
  [{ text: '' }],
  [
    { text: 'export async function', cls: 'text-[#c084fc]' },
    { text: ' submitMilestone', cls: 'text-[#7dd3fc]' },
    { text: '(prUrl: ', cls: 'text-white/85' },
    { text: 'string', cls: 'text-[#fbbf24]' },
    { text: ') {', cls: 'text-white/85' },
  ],
  [
    { text: '  const', cls: 'text-[#c084fc]' },
    { text: ' review ', cls: 'text-white/85' },
    { text: '=', cls: 'text-[#c084fc]' },
    { text: ' await', cls: 'text-[#c084fc]' },
    { text: ' mentor.rubric', cls: 'text-[#7dd3fc]' },
    { text: '(prUrl);', cls: 'text-white/85' },
  ],
  [
    { text: '  if', cls: 'text-[#c084fc]' },
    { text: ' (review.score >= ', cls: 'text-white/85' },
    { text: '90', cls: 'text-[#fbbf24]' },
    { text: ') {', cls: 'text-white/85' },
  ],
  [
    { text: '    await', cls: 'text-[#c084fc]' },
    { text: ' certificate.', cls: 'text-white/85' },
    { text: 'issue', cls: 'text-[#7dd3fc]' },
    { text: '({ signed: ', cls: 'text-white/85' },
    { text: 'true', cls: 'text-[#fbbf24]' },
    { text: ' });', cls: 'text-white/85' },
  ],
  [{ text: '  }', cls: 'text-white/85' }],
  [{ text: '}', cls: 'text-white/85' }],
  [
    { text: '// → PR merged · rubric 98/100 · certificate signed', cls: 'text-[#34d399]' },
  ],
];

function IdeWindow({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (reduced) {
      setLineCount(IDE_LINES.length);
      onDone();
      return;
    }
    const id = setInterval(() => {
      setLineCount((c) => {
        if (c >= IDE_LINES.length) {
          clearInterval(id);
          onDone();
          return c;
        }
        return c + 1;
      });
    }, 300);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className="v5-card rounded-xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 v5-mono text-[11px] text-white/40">task-01.tsx — zyro-workspace</span>
      </div>
      {/* Code body */}
      <div className="p-5 v5-mono text-[12.5px] leading-[1.75] min-h-[320px]">
        {IDE_LINES.slice(0, lineCount).map((tokens, i) => (
          <div key={i} className="flex whitespace-pre">
            <span className="w-8 shrink-0 select-none text-right pr-4 text-white/20">{i + 1}</span>
            <span>
              {tokens.map((t, j) => (
                <span key={j} className={t.cls ?? 'text-white/85'}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        ))}
        {lineCount < IDE_LINES.length && (
          <span className="inline-block w-2 h-4 bg-[#38bdf8] animate-pulse ml-8" />
        )}
      </div>
    </div>
  );
}

function PrReviewCard({ show }: { show: boolean }) {
  return (
    <m.div
      initial={{ y: 60, opacity: 0 }}
      animate={show ? { y: 0, opacity: 1 } : {}}
      transition={{ ...V5_SPRING, delay: 0.15 }}
      className="absolute -bottom-6 -right-2 sm:-right-6 w-[240px] v5-card rounded-xl p-4 shadow-2xl shadow-black/70 bg-[#0f1117]"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
        <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span className="v5-mono text-[11px] text-white/60">pull-request · #42</span>
      </div>
      <div className="py-3 space-y-2">
        <div className="flex items-center gap-2 text-[12px] text-white/85">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          RLS Test: <span className="text-[#34d399] v5-mono">PASSED</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/85">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          Code Quality: <span className="text-[#34d399] v5-mono">PASS</span>
        </div>
      </div>
      <div className="pt-3 border-t border-white/[0.08] flex items-end justify-between">
        <span className="v5-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">Rubric score</span>
        <span className="v5-mono text-2xl font-bold text-white">
          98<span className="text-white/40 text-sm">/100</span>
        </span>
      </div>
    </m.div>
  );
}

export function HeroV5() {
  const [typingDone, setTypingDone] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-24 lg:pt-36 lg:pb-32">
      {/* Background layers */}
      <div className="absolute inset-0 v5-grid-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
      <div className="hidden lg:block absolute top-1/3 right-1/5 w-[420px] h-[420px] bg-[#0284c7]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          {/* Left — typography */}
          <div className="lg:col-span-7 space-y-7">
            <m.div
              initial={reduced ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-[#10b981]/25 bg-[#10b981]/5 px-4 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
              </span>
              <span className="v5-eyebrow text-[#34d399]">&gt; SYSTEM_INIT: WORKFORCE_READINESS</span>
            </m.div>

            <m.h1
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.4rem] leading-[1.05] tracking-[-0.035em] text-white"
            >
              Build real projects. Submit via GitHub. Earn{' '}
              <span className="font-accent text-[#38bdf8]">verifiable</span> credentials.
            </m.h1>

            <m.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="text-base sm:text-lg text-[#a2a2c3] max-w-xl leading-relaxed"
            >
              Stop watching passive tutorials. ZYR0 gives students structured, industry-grade
              internship tasks with direct code evaluation, official offer letters, and
              QR-verifiable certificates — all built on your own repositories.
            </m.p>

            <m.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3.5"
            >
              <Button
                asChild
                className="group h-12 px-7 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white font-semibold text-sm transition-colors"
              >
                <Link to="/internships">
                  Explore Internships
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-[5px]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 rounded-md border-white/[0.12] bg-transparent text-white/85 hover:bg-white/[0.04] hover:text-white text-sm"
              >
                <Link to="/verify">
                  <QrCode className="w-4 h-4 mr-1.5 text-[#38bdf8]" />
                  Verify a Certificate
                </Link>
              </Button>
            </m.div>

            <m.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-2.5 pt-1"
            >
              {[
                { icon: ShieldCheck, label: '100% Free for Students' },
                { icon: GitBranch, label: 'Direct GitHub Integration' },
                { icon: QrCode, label: 'Cryptographic QR Proof' },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70"
                >
                  <chip.icon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  {chip.label}
                </span>
              ))}
            </m.div>
          </div>

          {/* Right — layered product mockup */}
          <div className="lg:col-span-5 relative pb-10 pr-2 sm:pr-6">
            <m.div
              initial={reduced ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <IdeWindow onDone={() => setTypingDone(true)} />
              <PrReviewCard show={typingDone || reduced} />
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
