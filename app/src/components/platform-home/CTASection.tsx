import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { stats } from './data';
import Reveal from './Reveal';
import CountUp from './CountUp';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal scale={0.97}>
          <div
            className="rounded-2xl border p-8 md:p-14 text-center"
            style={{
              background: 'var(--zyro-surface)',
              borderColor: 'var(--zyro-border)',
            }}
          >
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-accent)' }}
            >
              Get started
            </p>

            <h2
              className="text-4xl md:text-5xl font-display mb-6"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              Ready to build the future?
            </h2>

            <p
              className="text-lg max-w-2xl mx-auto mb-10"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Create web apps in seconds, modernize institutional operations,
              automate deep research, and build verifiable proof of engineering excellence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
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
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium border transition-all duration-200"
                style={{
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-text-secondary)',
                }}
              >
                Book a Demo
              </Link>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t"
              style={{ borderColor: 'var(--zyro-border)' }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-3xl md:text-4xl font-display mb-1"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    <CountUp end={stat.number} />
                  </div>
                  <div
                    className="font-label text-[10px] tracking-[0.15em]"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
