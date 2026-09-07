import { Layers, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import Reveal from './Reveal';

const benefits = [
  {
    icon: Layers,
    title: 'Unified Ecosystem',
    description:
      'Four purpose-built products operating on a shared infrastructure. Build applications, manage institutions, conduct research, and hire talent — all within a single, interconnected platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Verifiable Credentials',
    description:
      'Every certificate and proof-of-work artifact is cryptographically signed and publicly verifiable. Employers and institutions can authenticate achievements instantly, eliminating credential fraud.',
  },
  {
    icon: TrendingUp,
    title: 'Enterprise-Grade Scale',
    description:
      'Architected to serve individual users with the same reliability as large-scale institutional deployments. From a single student account to district-wide school management — the platform adapts without compromise.',
  },
  {
    icon: Zap,
    title: 'Accessible From Day One',
    description:
      'ZYR0 Work is free for students with no trial periods or credit card requirements. Organizations can evaluate School OS with a guided onboarding process tailored to their operational requirements.',
  },
];

export default function WhyZyroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-accent)' }}
            >
              Why ZYR0
            </p>
            <h2
              className="text-4xl md:text-5xl font-display mb-4"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              One platform. Every advantage.
            </h2>
            <p
              className="text-lg"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Whether you are building software, managing an educational institution,
              conducting research, or recruiting engineering talent — ZYR0 provides the
              infrastructure to operate with clarity and confidence.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Reveal key={benefit.title} delay={index * 0.08}>
                <div
                  className="p-5 md:p-6 rounded-2xl border h-full"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: 'var(--zyro-accent-muted)',
                      color: 'var(--zyro-accent)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {benefit.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
