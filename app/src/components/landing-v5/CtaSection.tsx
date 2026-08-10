import { Link } from 'react-router-dom';
import { ArrowRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './motion';

export function CtaSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 v5-grid-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_60%,rgba(2,132,199,0.14),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 v5-eyebrow text-white/60">
            Get Started Today
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] text-white leading-[1.06]">
            Ready to turn your code into{' '}
            <span className="font-accent text-[#38bdf8]">career proof?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 text-[#a2a2c3] max-w-xl mx-auto leading-relaxed">
            Join thousands of students building real projects, collecting mentor-verified rubrics,
            and stacking credentials employers can actually check.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="group h-14 px-10 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white font-semibold text-base transition-colors shadow-[0_0_35px_rgba(2,132,199,0.35)]"
            >
              <Link to="/register">
                Start Internship
                <ArrowRight className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-[5px]" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 px-8 rounded-md border-white/[0.12] bg-transparent text-white/85 hover:bg-white/[0.04] hover:text-white text-base"
            >
              <Link to="/verify">
                <QrCode className="w-4.5 h-4.5 mr-1.5 text-[#38bdf8]" />
                Verify a Certificate
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Enterprise status strip */}
        <Reveal delay={0.3}>
          <div className="mt-20 border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 v5-mono text-[10px] tracking-[0.18em] uppercase text-white/40">
            <span className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
              </span>
              System Status · Operational
            </span>
            <span>Domain: zyroo.org&nbsp;&nbsp;|&nbsp;&nbsp;SSL Verified&nbsp;&nbsp;|&nbsp;&nbsp;RLS Active</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
