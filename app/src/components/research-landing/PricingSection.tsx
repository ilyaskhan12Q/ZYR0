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
          <p className="rl-eyebrow mb-3">Pricing</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-2">
            RESEARCH AT YOUR PACE.
          </h2>
        </Reveal>
        <Reveal variant="fade-up" delay={0.1}>
          <p className="text-[var(--rl-muted)] text-sm mb-8 max-w-md">
            Start for free. Upgrade when you need more depth, more sources, or more sessions.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4" stagger={0.08}>
          {PLANS.map((plan) => (
            <StaggerItem key={plan.name} variant="fade-up">
              <div
                className={`rounded-xl p-5 h-full flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-[var(--rl-accent)] bg-[var(--rl-surface)] shadow-lg'
                    : 'border border-[var(--rl-border)] bg-[var(--rl-surface)] hover:border-[var(--rl-accent)]'
                }`}
              >
                {plan.highlighted && (
                  <span className="rl-eyebrow text-[var(--rl-accent-dark)] mb-1">Most popular</span>
                )}
                <h3 className="text-base font-semibold text-[var(--rl-ink)]">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="rl-display text-4xl text-[var(--rl-ink)]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[var(--rl-muted)]">{plan.period}</span>}
                </div>
                <p className="text-xs text-[var(--rl-muted)] mb-4">{plan.description}</p>
                <ul className="flex flex-col gap-1.5 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[var(--rl-ink)]">
                      <span className="text-[var(--rl-accent)] shrink-0 text-[10px]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/research-agent"
                  className={`text-center text-sm py-2.5 rounded-full transition-all ${
                    plan.highlighted
                      ? 'bg-[var(--rl-ink)] text-[var(--rl-bg)] hover:bg-[#333]'
                      : 'border border-[var(--rl-border)] text-[var(--rl-ink)] hover:border-[var(--rl-ink)]'
                  }`}
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
