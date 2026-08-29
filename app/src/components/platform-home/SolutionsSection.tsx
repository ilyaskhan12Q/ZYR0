import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ecosystemSolutions } from './data';
import Reveal from './Reveal';

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        {/* Section header */}
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-accent)' }}
            >
              Solutions
            </p>
            <h2
              className="text-4xl md:text-5xl font-display mb-4"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              Built for every step.
            </h2>
            <p
              className="text-lg"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              From first prototype to school management, academic research, and
              workforce entry.
            </p>
          </div>
        </Reveal>

        {/* Solution cards — single row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ecosystemSolutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Reveal key={solution.category} delay={index * 0.08}>
                <Link
                  to={solution.href}
                  className="group p-5 md:p-6 rounded-2xl border transition-all duration-300 block h-full"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200"
                    style={{
                      background: 'var(--zyro-accent-muted)',
                      color: 'var(--zyro-accent)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p
                    className="font-label text-[10px] tracking-[0.15em] uppercase mb-2"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    {solution.category}
                  </p>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {solution.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {solution.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--zyro-accent)' }}
                  >
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
