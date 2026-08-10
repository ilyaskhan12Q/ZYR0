import { Quote } from 'lucide-react';
import { REVIEWS } from './reviews-data';
import { Reveal } from './motion';

const BADGE_STYLE: Record<string, string> = {
  Company: 'border-[#38bdf8]/35 text-[#38bdf8]',
  Student: 'border-[#10b981]/35 text-[#34d399]',
  Intern: 'border-[#818cf8]/40 text-[#818cf8]',
  Mentor: 'border-[#f59e0b]/40 text-[#f59e0b]',
};

export function ReviewThread() {
  return (
    <section className="py-20 lg:py-28 content-visibility-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="v5-eyebrow text-[#38bdf8]">Community Thread</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Merged feedback from{' '}
            <span className="font-accent text-[#38bdf8]">the community.</span>
          </h2>
        </Reveal>

        <div className="max-w-2xl mx-auto">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.handle} delay={i * 0.06} className="relative">
              <div className="relative pl-14 sm:pl-16 pb-8">
                {/* Thread connector */}
                {i < REVIEWS.length - 1 && (
                  <span className="absolute left-[21px] sm:left-[25px] top-14 bottom-0 w-px bg-white/[0.08]" />
                )}
                {/* Avatar */}
                <img
                  src={r.image}
                  alt={`${r.name} — ZYR0 community member`}
                  width="48"
                  height="48"
                  loading="lazy"
                  className="absolute left-0 top-0 w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-full object-cover object-top ring-1 ring-white/10"
                />

                {/* Comment card */}
                <article className="v5-card rounded-xl overflow-hidden">
                  <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3 bg-white/[0.03] border-b border-white/[0.08]">
                    <span className="v5-mono text-xs text-white/85 font-semibold">{r.handle}</span>
                    <span className="v5-mono text-[11px] text-white/40">
                      commented · {r.time}
                    </span>
                    <span
                      className={`ml-auto v5-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded border ${BADGE_STYLE[r.badge]}`}
                    >
                      {r.badge}
                    </span>
                  </header>
                  <div className="p-5">
                    <Quote className="w-4 h-4 text-white/20 mb-2" />
                    <p className="v5-mono text-[14px] leading-relaxed text-white/75">{r.quote}</p>
                    <footer className="mt-4 pt-3 border-t border-white/[0.06] v5-mono text-[11px] text-white/40">
                      {r.name} · {r.role}
                    </footer>
                  </div>
                </article>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
