import type { ReactNode } from 'react';
import { useReducedMotion, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────
   Reveal — scroll-triggered fade/slide wrapper that respects
   prefers-reduced-motion (same behaviour as the landing page).
   ──────────────────────────────────────────────────────────────── */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 24, once = true }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
   SectionHeading — Landing V3 heading system:
   Space Grotesk eyebrow pill · Sora headline · Fraunces italic accent
   ──────────────────────────────────────────────────────────────── */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  accent: string;
  description?: string;
  align?: 'center' | 'left';
  icon?: LucideIcon;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = 'center',
  icon: Icon,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12 sm:mb-14',
        align === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl',
        className
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-400/10 border border-sky-400/25 text-blue-600 dark:text-sky-400 font-label text-[10px] tracking-[0.2em] shadow-xs',
          align === 'center' ? '' : 'mb-4'
        )}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {eyebrow}
      </div>
      <h2
        className={cn(
          'font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mt-4'
        )}
      >
        {title}{' '}
        <span className="font-accent text-blue-600 dark:text-sky-400">{accent}</span>
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed',
            align === 'center' ? 'mx-auto' : ''
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
