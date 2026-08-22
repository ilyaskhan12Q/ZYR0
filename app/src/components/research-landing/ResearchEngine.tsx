import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { PIPELINE_STAGES, RESEARCH_AREAS } from '@/data/researchLandingDemo';

export function ResearchEngine() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">How it works</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            FROM QUESTION TO UNDERSTANDING.
          </h2>
        </Reveal>

        {/* Pipeline flow — animated connectors */}
        <Reveal className="mb-16">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-0">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2 px-2 md:px-3">
                  <motion.div
                    initial={prefersReduced ? {} : { scale: 0, opacity: 0 }}
                    whileInView={prefersReduced ? {} : { scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-3 h-3 rounded-full border-2 border-[var(--rl-accent)] bg-white relative"
                  >
                    {i === 0 && (
                      <motion.div
                        animate={prefersReduced ? {} : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-[var(--rl-accent)] opacity-20"
                      />
                    )}
                  </motion.div>
                  <span className="text-[10px] md:text-xs text-[var(--rl-muted)] text-center whitespace-nowrap">
                    {stage.label}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <motion.div
                    initial={prefersReduced ? {} : { scaleX: 0 }}
                    whileInView={prefersReduced ? {} : { scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.05, duration: 0.3 }}
                    className="hidden md:block w-6 lg:w-10 h-px bg-[var(--rl-border)] origin-left"
                  />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Research area cards — staggered grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5" stagger={0.1}>
          {RESEARCH_AREAS.map((area) => (
            <StaggerItem key={area.id} variant="fade-up">
              <div className="p-6 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] rl-card-hover h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--rl-accent)] shrink-0" />
                  <span className="rl-eyebrow">{area.label}</span>
                </div>
                <p className="text-sm text-[var(--rl-muted)] leading-relaxed">{area.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
