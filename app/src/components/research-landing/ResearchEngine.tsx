import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const FEATURES = [
  {
    icon: '◆',
    title: 'Deep Research',
    desc: 'Multi-stage pipeline across academic databases and web sources.',
  },
  {
    icon: '◇',
    title: 'Verified Sources',
    desc: 'Every citation checked. Dead links dropped.',
  },
  {
    icon: '○',
    title: 'Structured Reports',
    desc: 'Numbered citations, clear sections, executive summaries.',
  },
];

export function ResearchEngine() {
  return (
    <section id="how-it-works" className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-3">How it works</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-statement-text text-[var(--rl-ink)] mb-4">
            FROM QUESTION<br />TO UNDERSTANDING.
          </h2>
        </Reveal>
        <Reveal variant="fade-up" delay={0.1}>
          <p className="rl-subheading text-[var(--rl-muted)] max-w-xl mb-10">
            You don't need to scan hundreds of results. You need AI that researches, verifies, and delivers.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[var(--rl-border)]" stagger={0}>
          {FEATURES.map((f, i) => (
            <StaggerItem key={f.title} variant="fade-up">
              <div className={`py-6 ${i < 2 ? 'md:border-r md:border-[var(--rl-border)] md:pr-8' : ''} ${i > 0 ? 'md:pl-8' : ''} ${i > 0 ? 'border-t md:border-t-0 border-[var(--rl-border)]' : ''}`}>
                <span className="text-xl text-[var(--rl-accent)]">{f.icon}</span>
                <h3 className="mt-2 text-base font-semibold text-[var(--rl-ink)]">{f.title}</h3>
                <p className="mt-1 text-sm text-[var(--rl-muted)] leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
