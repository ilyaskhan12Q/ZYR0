import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const PILLARS = [
  {
    icon: '◆',
    title: 'Research',
    description: 'Multi-stage pipeline across academic databases and web sources.',
    link: '#research',
    linkText: 'See the research agent →',
  },
  {
    icon: '◇',
    title: 'Verify',
    description: 'Every citation checked against the source. Dead links dropped.',
    link: '#evidence',
    linkText: 'See how verification works →',
  },
  {
    icon: '○',
    title: 'Report',
    description: 'Structured output with numbered citations and executive summaries.',
    link: '#report',
    linkText: 'See report structure →',
  },
];

export function FeaturesSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.08}>
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title} variant="fade-up">
              <div className="border-t border-[var(--rl-border)] pt-4">
                <span className="text-xl text-[var(--rl-accent)]">{pillar.icon}</span>
                <h3 className="mt-2 text-base font-semibold text-[var(--rl-ink)]">{pillar.title}</h3>
                <p className="mt-1 text-sm text-[var(--rl-muted)] leading-relaxed">{pillar.description}</p>
                <a
                  href={pillar.link}
                  className="mt-3 inline-block text-xs font-medium text-[var(--rl-accent-dark)] hover:text-[var(--rl-accent)] transition-colors rl-underline-anim"
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
