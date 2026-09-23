import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from './Reveal';

export default function CTASection() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      {/* Center ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--zyro-accent-muted) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1000px] mx-auto px-6 md:px-16 text-center relative z-10">
        <Reveal scale={0.96}>
          <div className="flex flex-col items-center justify-center">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 border shadow-sm"
              style={{
                borderColor: 'var(--zyro-border)',
                background: 'var(--zyro-surface)',
                color: 'var(--zyro-accent)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7B7BDC]" />
              <span>Get started in seconds</span>
            </div>

            <h2
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.05] mb-6"
              style={{ color: 'var(--zyro-text)' }}
            >
              Ready to build?
            </h2>

            <p
              className="text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Join engineers, schools, and researchers moving from idea to production with the ZYR0 ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/register?redirect=%2F"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-5 rounded-full text-sm font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-md"
                style={{
                  background: 'var(--zyro-text)',
                  color: 'var(--zyro-bg)',
                }}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-5 rounded-full text-sm font-medium border transition-all duration-200"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-text-secondary)',
                }}
              >
                <span>Book a Demo</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
