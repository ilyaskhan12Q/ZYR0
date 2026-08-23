import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const PILLARS = [
  {
    icon: '◆',
    title: 'Research',
    description: 'Multi-stage pipeline across academic databases and web sources. Parallel threads explore different angles simultaneously.',
    link: '#research',
    linkText: 'See the research agent →',
  },
  {
    icon: '◇',
    title: 'Verify',
    description: 'Every citation checked against the source. Dead links dropped. Only grounded, traceable evidence makes it into your report.',
    link: '#evidence',
    linkText: 'See how verification works →',
  },
  {
    icon: '○',
    title: 'Report',
    description: 'Structured output with numbered citations, clear sections, executive summaries. Reports that read like analyst work.',
    link: '#report',
    linkText: 'See report structure →',
  },
];

export function FeaturesSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12" stagger={0.1}>
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title} variant="fade-up">
              <div className="border-t border-[var(--rl-border)] pt-6">
                <span className="text-3xl text-[var(--rl-accent)]">{pillar.icon}</span>
                <h3 className="mt-4 text-xl font-semibold text-[var(--rl-ink)]">{pillar.title}</h3>
                <p className="mt-3 text-sm text-[var(--rl-muted)] leading-relaxed">{pillar.description}</p>
                <a
                  href={pillar.link}
                  className="mt-4 inline-block text-sm font-medium text-[var(--rl-accent-dark)] hover:text-[var(--rl-accent)] transition-colors rl-underline-anim"
                >
                  {pillar.linkText}
                </a>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
