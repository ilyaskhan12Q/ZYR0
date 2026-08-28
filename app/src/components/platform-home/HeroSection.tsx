import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="max-w-2xl">
            {/* Announcement badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8"
              style={{
                borderColor: 'var(--zyro-border)',
                background: 'var(--zyro-accent-muted)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--zyro-accent)' }}
              />
              <span
                className="font-label text-[11px] tracking-[0.15em]"
                style={{ color: 'var(--zyro-accent)' }}
              >
                ZYR0 2.0
              </span>
              <span style={{ color: 'var(--zyro-text-muted)' }}>·</span>
              <span
                className="text-xs"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                The Multi-Product AI & SaaS Ecosystem
              </span>
            </div>

            {/* Headline — DM Serif Display */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-display leading-[1.05] mb-6"
              style={{
                color: 'var(--zyro-text)',
                letterSpacing: '-0.03em',
              }}
            >
              Build, Learn,
              <br />
              Research, and
              <br />
              Work — with AI.
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl max-w-lg leading-relaxed mb-10"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Four interconnected products. One ecosystem.
              From prompt-to-app development to autonomous research
              agents and verified internships.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'var(--zyro-accent)',
                  color: '#FFFFFF',
                }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium border transition-all duration-200"
                style={{
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-text-secondary)',
                }}
              >
                Explore Products
              </a>
            </div>
          </div>

          {/* Right — Product Screenshot */}
          <div className="relative lg:h-[480px]">
            <div
              className="w-full h-full rounded-2xl border flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--zyro-surface)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              {/* Placeholder — replace with <img> when you have screenshots */}
              <div className="text-center p-8">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'var(--zyro-accent-muted)' }}
                >
                  <span
                    className="font-display text-2xl"
                    style={{ color: 'var(--zyro-accent)' }}
                  >
                    Z
                  </span>
                </div>
                <p
                  className="font-label text-[11px] tracking-[0.15em]"
                  style={{ color: 'var(--zyro-text-muted)' }}
                >
                  Product screenshot
                </p>
              </div>
            </div>

            {/* Subtle glow behind the screenshot */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-20"
              style={{ background: 'var(--zyro-accent)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
