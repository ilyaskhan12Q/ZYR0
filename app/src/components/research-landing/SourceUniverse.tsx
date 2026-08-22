import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Reveal } from './Reveal';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || !isInView) {
      setCount(target);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target, prefersReduced]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function SourceUniverse() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">Sources</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            EVERY SOURCE MATTERS.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: large source card */}
          <Reveal variant="fade-left" className="md:col-span-2">
            <div className="p-6 md:p-8 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] h-full rl-card-hover">
              <span className="rl-eyebrow text-[var(--rl-accent-dark)] mb-3 inline-block">OPENALEX</span>
              <h3 className="rl-display text-xl md:text-2xl text-[var(--rl-ink)] mb-3 leading-tight">
                Generative AI in Higher Education: A Systematic Review
              </h3>
              <p className="text-xs text-[var(--rl-muted)] mb-3">
                Chen, L. et al. · 2024 · Educational Technology Research
              </p>
              <p className="text-sm text-[var(--rl-muted)] leading-relaxed italic">
                "This systematic review examines 127 peer-reviewed studies published between 2020 and 2024
                on the integration of generative AI tools in higher education settings..."
              </p>
            </div>
          </Reveal>

          {/* Right: stacked stat cards */}
          <div className="flex flex-col gap-4">
            <Reveal variant="fade-right" delay={0}>
              <div className="p-5 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] text-center rl-card-hover">
                <span className="rl-eyebrow block mb-2">Sources found</span>
                <span className="rl-display text-4xl md:text-5xl text-[var(--rl-ink)]">
                  <AnimatedCounter target={247} />
                </span>
              </div>
            </Reveal>

            <Reveal variant="fade-right" delay={0.1}>
              <div className="p-5 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] text-center rl-card-hover">
                <span className="rl-eyebrow block mb-2">After verification</span>
                <span className="rl-display text-4xl md:text-5xl text-[var(--rl-accent-dark)]">
                  <AnimatedCounter target={18} />
                </span>
              </div>
            </Reveal>

            <Reveal variant="fade-right" delay={0.2}>
              <div className="p-5 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] text-center rl-card-hover">
                <span className="rl-eyebrow block mb-2">Research dimensions</span>
                <span className="rl-display text-4xl md:text-5xl text-[var(--rl-ink)]">
                  <AnimatedCounter target={4} />
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
