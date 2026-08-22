import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { DEMO_SOURCES } from '@/data/researchLandingDemo';

export function EvidenceSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">Evidence</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            EVERY CLAIM HAS A TRAIL.
          </h2>
        </Reveal>

        {/* Paragraph with interactive citations */}
        <Reveal variant="fade-up">
          <div className="rounded-2xl bg-[var(--rl-surface)] border border-[var(--rl-border)] p-6 md:p-8">
            <p className="text-sm leading-relaxed text-[var(--rl-ink)] mb-6">
              Generative AI tools are reshaping higher education in measurable ways. Faculty adoption remains uneven — while 67% of institutions have developed AI usage policies, only 23% provide structured training for faculty integration{' '}
              <motion.span
                whileHover={prefersReduced ? {} : { scale: 1.1, backgroundColor: 'rgba(101, 124, 104, 0.1)' }}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-[var(--rl-accent-dark)] bg-[var(--rl-accent)]/10 cursor-pointer transition-colors"
              >
                1
              </motion.span>
              . Assessment methods are shifting in response, with process-based evaluation and oral examinations replacing traditional take-home assignments in 41% of surveyed departments{' '}
              <motion.span
                whileHover={prefersReduced ? {} : { scale: 1.1, backgroundColor: 'rgba(101, 124, 104, 0.1)' }}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-[var(--rl-accent-dark)] bg-[var(--rl-accent)]/10 cursor-pointer transition-colors"
              >
                3
              </motion.span>.
            </p>

            {/* Claim → Citation → Evidence → Source strip */}
            <div className="flex flex-wrap items-center gap-3 py-3 border-t border-[var(--rl-border)]">
              <StaggerContainer className="flex flex-wrap items-center gap-3" stagger={0.08}>
                <StaggerItem variant="fade-left" duration={0.4}><span className="rl-eyebrow">Claim</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="text-[var(--rl-border)]">&rarr;</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="rl-eyebrow">Citation</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="text-[var(--rl-border)]">&rarr;</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="rl-eyebrow">Evidence</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="text-[var(--rl-border)]">&rarr;</span></StaggerItem>
                <StaggerItem variant="fade-left" duration={0.4}><span className="rl-eyebrow text-[var(--rl-accent-dark)]">Source</span></StaggerItem>
              </StaggerContainer>
            </div>

            {/* Source panel */}
            <Reveal variant="fade-up" delay={0.2}>
              <div className="mt-4 p-4 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] rl-card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="rl-eyebrow text-[var(--rl-accent-dark)]">SOURCE 01</span>
                  <span className="rl-chip">✓ Verified</span>
                </div>
                <p className="text-sm font-medium text-[var(--rl-ink)] mb-1">
                  {DEMO_SOURCES[0].title}
                </p>
                <p className="text-xs text-[var(--rl-muted)] mb-2">
                  {DEMO_SOURCES[0].authors} · {DEMO_SOURCES[0].year} · {DEMO_SOURCES[0].source}
                </p>
                <p className="text-xs text-[var(--rl-muted)] italic leading-relaxed">
                  "This systematic review examines 127 peer-reviewed studies published between 2020 and 2024 on the integration of generative AI tools in higher education settings..."
                </p>
                <a href="#" className="rl-underline-anim inline-block mt-3 text-xs font-semibold text-[var(--rl-accent-dark)]">
                  View original source &rarr;
                </a>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
