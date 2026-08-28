import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productsList } from './data';

const deepDiveContent = [
  {
    productId: 'studio',
    figureLabel: 'FIG 0.1',
    headline: 'From prompt to production in seconds.',
    description:
      'ZYR0 Studio turns natural language into full-stack React applications. No boilerplate. No config files. Just describe what you want and deploy it live.',
    features: [
      'Natural language to production-ready code',
      'React 19 + Tailwind component stack',
      'One-click Cloudflare/Vercel deployment',
      'Full code export and Git sync',
    ],
  },
  {
    productId: 'edu',
    figureLabel: 'FIG 0.2',
    headline: 'A modern operating system for schools.',
    description:
      'ZYR0 School OS unifies admissions, biometric attendance, fee collection, grading, and timetables into a single intelligent platform — with portals for every role.',
    features: [
      'Multi-role portals (Admin, Teacher, Parent, Student)',
      'Automated fee collections and receipting',
      'AI timetable scheduler and substitutions',
      'Live academic and attendance telemetry',
    ],
  },
  {
    productId: 'research',
    figureLabel: 'FIG 0.3',
    headline: 'Autonomous deep research, verified.',
    description:
      'The 0-AI Research Agent plans, executes, cross-verifies, and synthesizes exhaustive reports. Every claim backed by a verifiable citation.',
    features: [
      'Multi-agent recursive search loops',
      'Verifiable source citations',
      'LaTeX mathematical rendering',
      'Export to PDF and Markdown',
    ],
  },
  {
    productId: 'work',
    figureLabel: 'FIG 0.4',
    headline: 'Proof-of-work that actually proves something.',
    description:
      'ZYR0 Work connects student engineering talent with companies through structured project assignments and cryptographically verifiable certificates.',
    features: [
      'GitHub-backed project delegations',
      'PR-style split-pane review drawer',
      'Cryptographic certificate verification',
      'End-to-end talent pipeline',
    ],
  },
];

export default function DeepDiveSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        {/* Section header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <p
            className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
            style={{ color: 'var(--zyro-accent)' }}
          >
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-display mb-4"
            style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
          >
            Built for every stage.
          </h2>
          <p
            className="text-lg"
            style={{ color: 'var(--zyro-text-secondary)' }}
          >
            Whether you're building an app, running a school, conducting research,
            or hiring talent — there's a product designed for the job.
          </p>
        </div>

        {/* Narrative sections */}
        <div className="space-y-24 md:space-y-32">
          {deepDiveContent.map((item, index) => {
            const product = productsList.find((p) => p.id === item.productId);
            if (!product) return null;

            const isReversed = index % 2 !== 0;

            return (
              <div
                key={item.productId}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  isReversed ? 'lg:[direction:rtl]' : ''
                }`}
              >
                {/* Text */}
                <div className="lg:[direction:ltr]">
                  <span
                    className="font-label text-[10px] tracking-[0.2em] block mb-4"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    {item.figureLabel}
                  </span>
                  <h3
                    className="text-3xl md:text-4xl font-display mb-4"
                    style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
                  >
                    {item.headline}
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-6"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {item.description}
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {item.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: 'var(--zyro-text-secondary)' }}
                      >
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                          style={{ background: 'var(--zyro-accent)' }}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={product.href}
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--zyro-accent)' }}
                  >
                    Learn more about {product.name.replace('ZYR0 ', '')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Image */}
                <div className="lg:[direction:ltr]">
                  <div
                    className="relative w-full aspect-[4/3] rounded-2xl border overflow-hidden"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                    }}
                  >
                    {/* Placeholder — replace with <img> */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'var(--zyro-accent-muted)' }}
                        >
                          <span
                            className="font-display text-xl"
                            style={{ color: 'var(--zyro-accent)' }}
                          >
                            {item.figureLabel.split(' ')[1]}
                          </span>
                        </div>
                        <p
                          className="font-label text-[10px] tracking-[0.15em]"
                          style={{ color: 'var(--zyro-text-muted)' }}
                        >
                          {product.name} screenshot
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
