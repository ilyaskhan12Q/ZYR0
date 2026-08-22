import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { PRICING_PLANS } from '@/data/researchLandingDemo';

export function PricingSection() {
  return (
    <section id="pricing" className="rl-section">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">Pricing</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            RESEARCH AT YOUR PACE.
          </h2>
          <p className="rl-subheading text-[var(--rl-muted)] max-w-lg mt-4">
            Start for free. Upgrade when you need more depth, more sources, or more sessions.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.1}>
          {PRICING_PLANS.map((plan) => (
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
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--rl-ink)]">
                      <span className="text-[var(--rl-accent)] shrink-0">✓</span>
                      {feature}
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
