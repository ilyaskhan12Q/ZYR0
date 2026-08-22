import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from './Reveal';

export function FinalCta() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="rl-section relative overflow-hidden" style={{ backgroundColor: 'var(--rl-surface)' }}>
      {/* Decorative backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--rl-accent)] opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--rl-accent)] opacity-[0.05]" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal variant="scale">
          <h2 className="rl-display rl-statement-text text-[var(--rl-ink)] mb-4">
            WHAT WILL YOU<br />RESEARCH NEXT?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="rl-subheading text-[var(--rl-muted)] mb-8">
            Search deeper. Verify faster. Understand more.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/research-agent" className="rl-btn-primary text-base">
              Start researching <span aria-hidden="true">&rarr;</span>
            </a>
            <a href="#pricing" className="rl-btn-secondary text-base">
              View pricing
            </a>
          </div>
        </Reveal>

        {/* Animated concentric rings */}
        <Reveal delay={0.4} className="mt-16 flex justify-center">
          <div className="relative w-32 h-32">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={prefersReduced ? {} : { scale: [1, 1.1, 1], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-[var(--rl-border)]"
                style={{ transform: `scale(${1 + i * 0.4})` }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
