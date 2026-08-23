import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Explore the research agent with basic capabilities.',
    features: ['Quick research mode', 'Basic source verification', '5 research sessions/day', 'Standard report format'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$X',
    period: '/mo',
    description: 'Full research capabilities for serious work.',
    features: ['All research depths', 'Full source verification', 'Unlimited sessions', 'Export reports (Markdown)', 'Research history'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Advanced',
    price: '$X',
    period: '/mo',
    description: 'For teams and institutions.',
    features: ['Everything in Pro', 'Custom source domains', 'API access', 'Priority processing', 'Team collaboration', 'Dedicated support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing-plans" className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-4">Pricing</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-4">
            RESEARCH AT YOUR PACE.
          </h2>
        </Reveal>
        <Reveal variant="fade-up" delay={0.1}>
          <p className="rl-subheading text-[var(--rl-muted)] max-w-lg mb-12">
            Start for free. Upgrade when you need more depth, more sources, or more sessions.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.1}>
          {PLANS.map((plan) => (
            <StaggerItem key={plan.name} variant="fade-up">
              <div
                className={`p-6 rounded-xl border h-full flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-[var(--rl-accent)] bg-[var(--rl-surface)] shadow-sm hover:shadow-lg hover:scale-[1.02]'
                    : 'border-[var(--rl-border)] bg-[var(--rl-surface)] hover:border-[var(--rl-accent)] hover:shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <span className="rl-eyebrow text-[var(--rl-accent-dark)] mb-2">Most popular</span>
                )}
                <h3 className="text-lg font-semibold text-[var(--rl-ink)]">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-3">
                  <span className="rl-display text-3xl text-[var(--rl-ink)]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[var(--rl-muted)]">{plan.period}</span>}
                </div>
                <p className="text-sm text-[var(--rl-muted)] mb-6">{plan.description}</p>
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--rl-ink)]">
                      <span className="text-[var(--rl-accent)] shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/research-agent"
                  className={plan.highlighted ? 'rl-btn-primary justify-center' : 'rl-btn-secondary justify-center'}
                >
                  {plan.cta}
                </a>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
