import type { LucideIcon } from 'lucide-react';
import { useReducedMotion, motion } from 'framer-motion';
import { Reveal, SectionHeading } from './SectionHeading';
import type { TimelineStep } from './team-data';
import { cn } from '@/lib/utils';

interface TimelineSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  accent: string;
  description?: string;
  icon?: LucideIcon;
  steps: TimelineStep[];
  /** Themed accent color set for nodes + connector */
  variant?: 'blue' | 'emerald';
}

const VARIANTS = {
  blue: {
    rail: 'from-blue-600 via-sky-400 to-indigo-500',
    node: 'bg-blue-600/10 text-blue-600 dark:text-sky-400 border-blue-500/25',
    number: 'text-blue-600 dark:text-sky-400',
  },
  emerald: {
    rail: 'from-emerald-600 via-teal-400 to-cyan-500',
    node: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    number: 'text-emerald-600 dark:text-emerald-400',
  },
} as const;

export function TimelineSection({
  id,
  eyebrow,
  title,
  accent,
  description,
  icon,
  steps,
  variant = 'blue',
}: TimelineSectionProps) {
  const reduce = useReducedMotion();
  const styles = VARIANTS[variant];

  return (
    <section
      id={id}
      className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          accent={accent}
          description={description}
          icon={icon}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Static rail */}
          <div className="absolute left-[26px] sm:left-[37px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />

          {/* Animated fill rail */}
          {!reduce && (
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className={cn(
                'absolute left-[26px] sm:left-[37px] top-2 bottom-2 w-px origin-top bg-gradient-to-b',
                styles.rail
              )}
            />
          )}

          <ol className="space-y-0">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <li key={step.title} className="relative grid grid-cols-[52px_1fr] sm:grid-cols-[74px_1fr] gap-4 sm:gap-6">
                  {/* Node */}
                  <div className="relative z-10 flex justify-center">
                    <Reveal
                      delay={0}
                      y={10}
                      className={cn(
                        'w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center bg-white dark:bg-slate-900 shadow-md backdrop-blur-xl',
                        styles.node
                      )}
                    >
                      <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Reveal>
                  </div>

                  {/* Content */}
                  <Reveal delay={0.05} className="pb-10 pt-1 sm:pt-2">
                    <div className="inline-flex items-center gap-2 mb-1.5">
                      <span className={cn('font-mono text-xs font-bold', styles.number)}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-prose">
                      {step.description}
                    </p>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}