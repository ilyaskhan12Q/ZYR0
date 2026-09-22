import { Layers, ShieldCheck, BrainCircuit, Zap, ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

const highlights = [
  {
    number: '01',
    title: 'Unified Architecture',
    tagline: 'Zero context switching across apps',
    description:
      'A single interconnected infrastructure uniting web generation, school administration, deep intelligence, and career verification under one identity.',
    icon: Layers,
    badge: 'Single Identity',
  },
  {
    number: '02',
    title: 'Verifiable Cryptographic Proof',
    tagline: 'Tamper-proof credentials for real talent',
    description:
      'Every project milestone, school certificate, and code submission is cryptographically signed and publicly verifiable. No fabricated resumes.',
    icon: ShieldCheck,
    badge: 'SHA-256 Signed',
  },
  {
    number: '03',
    title: 'Autonomous Intelligence Engine',
    tagline: 'Multi-agent reasoning from code to research',
    description:
      'Autonomous reasoning loops that write React full-stack code, manage classroom scheduling, and cross-reference exhaustive academic literature.',
    icon: BrainCircuit,
    badge: 'Multi-Agent',
  },
  {
    number: '04',
    title: 'Production Scale From Day One',
    tagline: 'Built for solo builders and national institutions',
    description:
      'Engineered with enterprise security, sub-millisecond edge latency, and high-availability multi-tenancy that easily scales from 1 to 100,000+ users.',
    icon: Zap,
    badge: '99.9% Uptime',
  },
];

export default function FeatureHighlightStrip() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <p
                className="font-label text-[11px] tracking-[0.25em] uppercase mb-3"
                style={{ color: 'var(--zyro-accent)' }}
              >
                Why ZYR0
              </p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight"
                style={{ color: 'var(--zyro-text)' }}
              >
                Architected differently.
              </h2>
            </div>
            <p
              className="max-w-md text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Linear-grade precision engineered into an expansive multi-product suite.
              No bloated legacy software, no disconnected point solutions.
            </p>
          </div>
        </Reveal>

        {/* Linear/Vercel-style Feature Highlight Strip */}
        <div className="divide-y border-y" style={{ borderColor: 'var(--zyro-border)' }}>
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.number} delay={index * 0.07}>
                <div
                  className="group relative py-7 md:py-8 px-4 sm:px-6 transition-all duration-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--zyro-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Left Column: Number + Icon + Title */}
                  <div className="flex items-start sm:items-center gap-5 md:w-5/12 shrink-0">
                    <span
                      className="font-mono text-2xl sm:text-3xl font-semibold opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ color: 'var(--zyro-text-muted)' }}
                    >
                      {item.number}
                    </span>

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'var(--zyro-surface)',
                        border: '1px solid var(--zyro-border)',
                        color: 'var(--zyro-accent)',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-base sm:text-lg font-semibold transition-colors"
                          style={{ color: 'var(--zyro-text)' }}
                        >
                          {item.title}
                        </h3>
                        <span
                          className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border"
                          style={{
                            background: 'var(--zyro-surface)',
                            borderColor: 'var(--zyro-border)',
                            color: 'var(--zyro-text-muted)',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5 font-mono"
                        style={{ color: 'var(--zyro-text-muted)' }}
                      >
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Description */}
                  <div className="md:w-6/12">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Right Column: Arrow indicator */}
                  <div
                    className="hidden md:flex items-center justify-end w-1/12 group-hover:translate-x-1 transition-all"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
