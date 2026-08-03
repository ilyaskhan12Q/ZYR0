import type { LucideIcon } from 'lucide-react';
import { Reveal, SectionHeading } from './SectionHeading';
import type { FeatureCard } from './team-data';
import { cn } from '@/lib/utils';

interface FeatureGridSectionProps {
  eyebrow: string;
  title: string;
  accent: string;
  description?: string;
  icon?: LucideIcon;
  cards: FeatureCard[];
  /** Number of columns on large screens */
  columns?: 2 | 3 | 4;
  /** Render "01 — n" step numbers above each card */
  numbered?: boolean;
  className?: string;
}

const GRID_COLS: Record<NonNullable<FeatureGridSectionProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function FeatureGridSection({
  eyebrow,
  title,
  accent,
  description,
  icon,
  cards,
  columns = 3,
  numbered = false,
  className,
}: FeatureGridSectionProps) {
  return (
    <section
      className={cn('py-14 lg:py-20 px-4 bg-transparent content-visibility-auto', className)}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} description={description} icon={icon} />

        <div className={cn('grid grid-cols-1 gap-6', GRID_COLS[columns])}>
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={(i % columns) * 0.07}
                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-emerald-500/10"
              >
                <div className="flex items-start justify-between">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', card.accent)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {numbered && (
                    <span className="font-mono text-2xl font-black text-slate-900/15 dark:text-white/15">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}