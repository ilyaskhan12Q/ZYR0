import { Reveal } from './Reveal';

export function HeroSection() {
  return (
    <section className="rl-dark-section relative overflow-hidden">
      <div className="rl-section relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow-light mb-4 text-[#999999]">Deep research, verified sources</p>
        </Reveal>

        <Reveal variant="fade-up" delay={0.1}>
          <h1 className="rl-display rl-hero-text text-white max-w-5xl leading-[0.9] tracking-tight">
            RESEARCH WITHOUT<br />THE GUESSWORK.
          </h1>
        </Reveal>

        <Reveal variant="fade-up" delay={0.2}>
          <p className="mt-6 text-lg md:text-xl text-[#999999] max-w-2xl leading-relaxed">
            One question. Multiple lines of research.<br className="hidden md:block" />
            Verified sources. Structured reports.
          </p>
        </Reveal>

        <Reveal variant="fade-up" delay={0.3}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="/research-agent" className="rl-btn-primary-dark text-base">
              Start researching <span aria-hidden="true">&rarr;</span>
            </a>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3.5 text-[0.9375rem] font-medium text-[#999999] hover:text-white transition-colors">
              See how it works <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </Reveal>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--rl-bg)] to-transparent pointer-events-none" />
    </section>
  );
}
