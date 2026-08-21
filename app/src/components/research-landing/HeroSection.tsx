import { Reveal } from './Reveal';

export function HeroSection() {
  return (
    <section id="research" className="relative overflow-hidden" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <span className="rl-eyebrow mb-6 inline-block">Deep Research · Verified Sources · Precision Editorial</span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="rl-display rl-hero-text text-[var(--rl-ink)] mb-6">
              RESEARCH<br />
              WITHOUT THE<br />
              GUESSWORK.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="rl-subheading text-[var(--rl-muted)] max-w-xl mb-8">
              One question. Multiple lines of research. Verified sources. Structured reports.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="w-full max-w-2xl">
            {/* Product mockup — input card */}
            <div className="relative rounded-2xl bg-[var(--rl-surface)] border border-[var(--rl-border)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--rl-ink)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--rl-bg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--rl-ink)]">Research Agent</span>
              </div>

              <div className="w-full text-left px-4 py-3 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] text-[var(--rl-muted)] text-sm">
                How does generative AI affect university education?
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--rl-border)] text-[var(--rl-muted)]">Standard</span>
                  <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--rl-border)] text-[var(--rl-muted)]">Deep</span>
                </div>
                <button className="rl-btn-primary text-sm">
                  Research <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
