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
          background: 'radial-gradient(circle at 50% 50%, rgba(18, 1, 89, 0.7) 0%, rgba(123, 123, 220, 0.15) 35%, transparent 70%)',
        }}
      />

      <div className="max-w-[1000px] mx-auto px-6 md:px-16 text-center relative z-10">
        <Reveal scale={0.96}>
          <div className="flex flex-col items-center justify-center">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 border bg-white/[0.04]"
              style={{
                borderColor: 'var(--zyro-border)',
                color: 'var(--zyro-accent)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7B7BDC]" />
              <span>Get started in seconds</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-[1.05] mb-6">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-5 rounded-full text-sm font-semibold bg-white text-black hover:bg-neutral-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_0_35px_rgba(255,255,255,0.2)]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] border border-white/[0.1] transition-all duration-200"
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
