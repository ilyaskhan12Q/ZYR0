import { XCircle, CheckCircle2, GitMerge, Play } from 'lucide-react';
import { Reveal } from './motion';

/* Seeded contribution-graph pattern (7 rows x 18 cols) */
const GRAPH = Array.from({ length: 7 * 18 }, (_, i) => {
  const v = (i * 37 + 11) % 10;
  return v < 3 ? 0 : v < 6 ? 1 : v < 8 ? 2 : 3;
});

const OLD_CLAIMS = [
  'Code trapped in browser sandboxes',
  'Multiple-choice quiz "assessment"',
  'Unverified PNG certificate downloads',
];

const NEW_CLAIMS = [
  '100% code ownership in your repo',
  'Real PR review & rubric evaluation',
  'Cryptographically verifiable credentials',
];

export function ProofSplit() {
  return (
    <section className="py-20 lg:py-28 content-visibility-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="v5-eyebrow text-[#38bdf8]">Proof of Work</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Certificates are easy to fake.{' '}
            <span className="font-accent text-[#38bdf8]">Commit history is not.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.08]">
            {/* Glowing laser divider */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 w-px v5-laser z-10" />

            {/* Left — traditional courses */}
            <div className="relative p-8 sm:p-12 bg-[#2a2522]/60">
              <span className="v5-eyebrow text-white/40">Traditional Video Courses</span>

              <div className="mt-8 aspect-video rounded-lg border border-white/[0.06] bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center">
                  <Play className="w-6 h-6 text-white/30 ml-1" />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {['A) Watch 40 hours of video', 'B) Guess the right answer', 'C) Download badge.png'].map(
                  (opt, i) => (
                    <div
                      key={opt}
                      className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                    >
                      <XCircle className={`w-4 h-4 ${i === 2 ? 'text-[#f87171]' : 'text-white/25'}`} />
                      <span className="v5-mono text-xs text-white/45">{opt}</span>
                    </div>
                  )
                )}
              </div>

              <ul className="mt-8 space-y-2.5">
                {OLD_CLAIMS.map((c) => (
                  <li key={c} className="text-sm text-white/35 line-through decoration-white/25">
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — ZYR0 proof */}
            <div className="relative p-8 sm:p-12 bg-[#0f1117]">
              <span className="v5-eyebrow text-[#34d399]">ZYR0 Proof of Work</span>

              <div className="mt-8 rounded-lg border border-white/[0.08] bg-black/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="v5-mono text-[11px] text-white/50">github.com/you · contribution activity</span>
                  <span className="v5-mono text-[11px] text-[#34d399]">214 commits this cycle</span>
                </div>
                <div className="grid grid-cols-[repeat(18,1fr)] gap-[3px]">
                  {GRAPH.map((v, i) => (
                    <span
                      key={i}
                      className="aspect-square w-full rounded-[2px]"
                      style={{
                        background:
                          v === 0
                            ? 'rgba(255,255,255,0.05)'
                            : `rgba(16,185,129,${v === 1 ? 0.25 : v === 2 ? 0.55 : 0.9})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-lg border border-[#10b981]/25 bg-[#10b981]/[0.06] px-4 py-3">
                <GitMerge className="w-4 h-4 text-[#34d399]" />
                <span className="v5-mono text-xs text-white/80">
                  PR #42 merged · rubric <span className="text-[#34d399]">98/100</span> · certificate queued
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {NEW_CLAIMS.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-white/85">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#10b981]" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
