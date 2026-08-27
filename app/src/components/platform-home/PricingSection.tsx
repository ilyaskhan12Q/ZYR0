import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { pricing } from './data';

export default function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Transparent Pricing
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono mb-4">
          Predictable Plans for Every Stage
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 mb-8">
          Start for free, scale as your projects, research, or institution expands.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-neutral-900 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setAnnualBilling(false)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !annualBilling ? 'bg-white text-black font-semibold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setAnnualBilling(true)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              annualBilling ? 'bg-white text-black font-semibold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pricing.map((tier) => {
          const isPro = tier.popular;
          return (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all ${
                isPro
                  ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 scale-100 lg:-translate-y-2'
                  : 'bg-neutral-900/60 border border-white/10 hover:border-white/20'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-black text-xs font-bold font-mono tracking-wide uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white font-mono mb-2">{tier.name}</h3>
                  <p className="text-xs text-neutral-400">{tier.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    {annualBilling && tier.price.startsWith('$')
                      ? `$${Math.round(parseInt(tier.price.slice(1)) * 0.8)}`
                      : tier.price}
                  </span>
                  <span className="text-xs text-neutral-400">{tier.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                    Features Included:
                  </div>
                  {tier.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-2.5 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          feature.included
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-600'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={feature.included ? 'text-neutral-300' : 'text-neutral-600 line-through'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Link
                  to={tier.price === 'Custom' ? '/contact' : '/register'}
                  className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    isPro
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>{tier.price === 'Custom' ? 'Contact Sales / Book Demo' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
