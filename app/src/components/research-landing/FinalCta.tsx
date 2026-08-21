import { Reveal } from './Reveal';

export function FinalCta() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="rl-display rl-statement-text text-[var(--rl-ink)] mb-4">
            WHAT WILL YOU<br />RESEARCH NEXT?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="rl-subheading text-[var(--rl-muted)] mb-8">
            Search deeper. Verify faster. Understand more.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/research-agent" className="rl-btn-primary text-base">
              Start researching <span aria-hidden="true">&rarr;</span>
            </a>
            <a href="#pricing" className="rl-btn-secondary text-base">
              View pricing
            </a>
          </div>
        </Reveal>

        {/* Subtle backdrop composition */}
        <Reveal delay={0.3} className="mt-16 flex justify-center gap-8 opacity-20">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-full border border-[var(--rl-border)]"
              style={{ transform: `scale(${1 + i * 0.3})` }}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
