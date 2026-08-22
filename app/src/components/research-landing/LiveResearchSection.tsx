import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { RESEARCH_AREAS, DEMO_SOURCES } from '@/data/researchLandingDemo';

const STEPS = [
  { label: 'Understanding', status: 'complete' as const },
  { label: 'Building plan', status: 'complete' as const },
  { label: 'Searching', status: 'active' as const },
  { label: 'Verifying', status: 'pending' as const },
  { label: 'Writing', status: 'pending' as const },
];

export function LiveResearchSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">Live progress</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            WATCH THE RESEARCH UNFOLD.
          </h2>
        </Reveal>

        <Reveal variant="scale">
          <div className="rounded-2xl rl-glass p-6 md:p-8">
            {/* Progress stepper */}
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={prefersReduced ? {} : { scale: 0 }}
                      whileInView={prefersReduced ? {} : { scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-3 h-3 rounded-full ${
                        step.status === 'complete'
                          ? 'bg-[var(--rl-accent)]'
                          : step.status === 'active'
                          ? 'bg-[var(--rl-ink)] relative'
                          : 'bg-[var(--rl-border)]'
                      }`}
                    >
                      {step.status === 'active' && (
                        <motion.div
                          animate={prefersReduced ? {} : { scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-[var(--rl-ink)]"
                        />
                      )}
                    </motion.div>
                    <span className={`text-[10px] md:text-xs whitespace-nowrap ${
                      step.status === 'active' ? 'text-[var(--rl-ink)] font-medium' : 'text-[var(--rl-muted)]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`hidden md:block w-8 lg:w-12 h-px mx-1 ${
                      step.status === 'complete' ? 'bg-[var(--rl-accent)]' : 'bg-[var(--rl-border)]'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Research area chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {RESEARCH_AREAS.map((area) => (
                <span key={area.id} className="rl-chip">{area.label}</span>
              ))}
            </div>

            {/* Source cards — staggered entrance */}
            <StaggerContainer className="flex flex-col gap-3" stagger={0.15}>
              {DEMO_SOURCES.slice(0, 3).map((source) => (
                <StaggerItem key={source.title} variant="fade-left" duration={0.5}>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--rl-ink)] truncate">{source.title}</p>
                      <p className="text-xs text-[var(--rl-muted)]">{source.source} · {source.year}</p>
                    </div>
                    <span className="rl-chip ml-3 shrink-0">Verified</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
