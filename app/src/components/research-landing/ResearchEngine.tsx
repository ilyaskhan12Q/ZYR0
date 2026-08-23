import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const FEATURES = [
  {
    icon: '◆',
    title: 'Deep Research',
    description: 'Multi-stage pipeline across academic databases and web sources. Parallel research threads explore different angles simultaneously.',
  },
  {
    icon: '◇',
    title: 'Verified Sources',
    description: 'Every citation checked. Dead links dropped. Only grounded, traceable evidence makes it into your report.',
  },
  {
    icon: '○',
    title: 'Structured Reports',
    description: 'Numbered citations, clear sections, executive summaries. Reports that read like they were written by a research analyst.',
  },
];

export function ResearchEngine() {
  return (
    <section id="how-it-works" className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section text-center">
        <Reveal variant="fade-up">
          <h2 className="rl-display rl-statement-text text-[var(--rl-ink)] mb-6">
            FROM QUESTION TO<br />UNDERSTANDING.
          </h2>
        </Reveal>

        <Reveal variant="fade-up" delay={0.1}>
          <p className="rl-subheading text-[var(--rl-muted)] max-w-2xl mx-auto mb-16">
            You don't need to scan hundreds of search results. You don't need to verify sources manually.
            You need AI that researches across academic and web sources, verifies every citation,
            and delivers a structured report.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left" stagger={0.1}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title} variant="fade-up">
              <div className="border-t border-[var(--rl-border)] pt-6">
                <span className="text-2xl text-[var(--rl-accent)]">{feature.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--rl-ink)]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--rl-muted)] leading-relaxed">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
