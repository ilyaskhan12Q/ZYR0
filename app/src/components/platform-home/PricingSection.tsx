import { Check, X } from 'lucide-react';
import { pricing } from './data';

export default function PricingSection() {
  return (
    <section className="ph-section">
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Pricing</p>
          <h2 className="ph-display ph-section-title">Simple, transparent pricing</h2>
          <p className="ph-section-subtitle">
            Start for free. Upgrade when you need more.
          </p>
        </div>

        <div className="ph-pricing-grid">
          {pricing.map((plan) => (
            <div key={plan.name} className={`ph-pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="ph-pricing-badge">Most Popular</span>}
              <h3 className="ph-pricing-name">{plan.name}</h3>
              <div className="ph-pricing-price">
                <span className="ph-pricing-amount">{plan.price}</span>
                <span className="ph-pricing-period">{plan.period}</span>
              </div>
              <p className="ph-pricing-desc">{plan.description}</p>
              <ul className="ph-pricing-features">
                {plan.features.map((f) => (
                  <li key={f.text} className={`ph-pricing-feature ${f.included ? 'included' : 'excluded'}`}>
                    {f.included ? (
                      <Check className="w-4 h-4 text-[var(--ph-accent)]" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--ph-text-muted)]" />
                    )}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <a href="/register" className="ph-btn-primary" style={{ justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
