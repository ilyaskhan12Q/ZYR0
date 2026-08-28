import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { pricing } from './data';

export default function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <p
            className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
            style={{ color: 'var(--zyro-accent)' }}
          >
            Pricing
          </p>
          <h2
            className="text-4xl md:text-5xl font-display mb-4"
            style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
          >
            Predictable plans.
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: 'var(--zyro-text-secondary)' }}
          >
            Start for free, scale as your projects, research, or institution expands.
          </p>

          {/* Billing Toggle */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg border"
            style={{
              background: 'var(--zyro-surface)',
              borderColor: 'var(--zyro-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                background: !annualBilling ? 'var(--zyro-accent-muted)' : 'transparent',
                color: !annualBilling ? 'var(--zyro-accent)' : 'var(--zyro-text-muted)',
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: annualBilling ? 'var(--zyro-accent-muted)' : 'transparent',
                color: annualBilling ? 'var(--zyro-accent)' : 'var(--zyro-text-muted)',
              }}
            >
              Annual
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: 'var(--zyro-accent-muted)',
                  color: 'var(--zyro-accent)',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {pricing.map((tier) => {
            const isPro = tier.popular;
            return (
              <div
                key={tier.name}
                className="relative rounded-2xl border p-6 md:p-8 flex flex-col justify-between transition-all duration-300"
                style={{
                  background: isPro ? 'var(--zyro-surface)' : 'var(--zyro-bg)',
                  borderColor: isPro ? 'var(--zyro-accent)' : 'var(--zyro-border)',
                }}
              >
                {isPro && (
                  <div
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--zyro-accent)',
                      color: '#FFFFFF',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    {tier.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-8">
                    <span
                      className="text-4xl md:text-5xl font-display"
                      style={{ color: 'var(--zyro-text)' }}
                    >
                      {annualBilling && tier.price.startsWith('$')
                        ? `$${Math.round(parseInt(tier.price.slice(1)) * 0.8)}`
                        : tier.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--zyro-text-muted)' }}
                    >
                      {tier.period}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{
                            color: feature.included
                              ? 'var(--zyro-accent)'
                              : 'var(--zyro-text-muted)',
                          }}
                        />
                        <span
                          style={{
                            color: feature.included
                              ? 'var(--zyro-text-secondary)'
                              : 'var(--zyro-text-muted)',
                            opacity: feature.included ? 1 : 0.5,
                            textDecoration: feature.included ? 'none' : 'line-through',
                          }}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={tier.price === 'Custom' ? '/contact' : '/register'}
                  className="mt-8 w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: isPro ? 'var(--zyro-accent)' : 'transparent',
                    color: isPro ? '#FFFFFF' : 'var(--zyro-text-secondary)',
                    border: isPro ? 'none' : '1px solid var(--zyro-border)',
                  }}
                >
                  {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
