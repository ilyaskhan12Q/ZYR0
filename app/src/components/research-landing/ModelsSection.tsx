import { Reveal } from './Reveal';

const DEPTHS = [
  {
    name: 'Quick',
    description: 'Fast surface scan. Best for simple factual questions.',
    sources: '~10',
    time: '~2 min',
  },
  {
    name: 'Standard',
    description: 'Balanced depth. Best for most research questions.',
    sources: '~20',
    time: '~5 min',
  },
  {
    name: 'Deep',
    description: 'Full-depth analysis. Best for complex, multi-faceted topics.',
    sources: '~50+',
    time: '~10 min',
  },
];

export function ModelsSection() {
  return (
    <section id="depth" className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-3">Research depth</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-8">
            CHOOSE HOW DEEP<br />TO GO.
          </h2>
        </Reveal>

        <div className="rl-scroll-carousel">
          {DEPTHS.map((depth) => (
            <Reveal key={depth.name} variant="fade-up" className="min-w-[260px] md:min-w-0">
              <div className="border border-[var(--rl-border)] rounded-xl p-4 bg-[var(--rl-bg)] rl-card-hover h-full">
                <h3 className="text-base font-semibold text-[var(--rl-ink)] mb-1">{depth.name}</h3>
                <p className="text-xs text-[var(--rl-muted)] leading-relaxed mb-4">{depth.description}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--rl-muted)]">
                  <span className="flex items-center gap-1">
                    <span className="text-[var(--rl-accent)]">◆</span> {depth.sources} sources
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[var(--rl-accent)]">○</span> {depth.time}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
