import { Link } from 'react-router-dom';
import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Explore the research agent with standard capabilities.',
    features: ['Standard research queries', 'Academic citation verification', 'Standard AI limits (20 req/min)', 'Markdown & PDF export'],
    cta: 'Start Researching',
    href: '/research-agent',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    description: 'Extended depth and priority model compute across the ecosystem.',
    features: ['Deep multi-step reasoning', 'Full academic & web ledger', 'Priority compute queue', 'Unlimited session history', 'Studio & Work early access'],
    cta: 'Choose Pro',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: '',
    description: 'Tailored institutional deployments for universities and enterprise teams.',
    features: ['Everything in Pro', 'Custom source domains', 'SchoolOS & Work integrations', 'Dedicated account manager', 'Custom SLA & invoicing'],
    cta: 'Book a Demo',
    href: '/pricing',
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
            Start for free. Upgrade to Pro for high-depth reasoning, or view our{' '}
            <Link to="/pricing" className="text-[var(--rl-accent)] underline hover:opacity-80 transition-opacity">
              complete ecosystem pricing
            </Link>.
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
                <Link
                  to={plan.href}
                  className={`text-center text-sm py-2.5 rounded-full transition-all ${
                    plan.highlighted
                      ? 'bg-[var(--rl-ink)] text-[var(--rl-bg)] hover:bg-[#333]'
                      : 'border border-[var(--rl-border)] text-[var(--rl-ink)] hover:border-[var(--rl-ink)]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
