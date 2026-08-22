import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode, RefObject } from 'react';
import { useRef } from 'react';

type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'parallax';

const variantDefaults: Record<RevealVariant, { x: number; y: number; scale: number }> = {
  'fade-up':    { x: 0, y: 30, scale: 1 },
  'fade-down':  { x: 0, y: -30, scale: 1 },
  'fade-left':  { x: 40, y: 0, scale: 1 },
  'fade-right': { x: -40, y: 0, scale: 1 },
  'scale':      { x: 0, y: 0, scale: 0.92 },
  'parallax':   { x: 0, y: 60, scale: 1 },
};

export function Reveal({
  children,
  className = '',
  delay = 0,
  y,
  variant = 'fade-up',
  duration = 0.7,
  threshold = -80,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  variant?: RevealVariant;
  duration?: number;
  threshold?: number;
}) {
  const prefersReduced = useReducedMotion();
  const defaults = variantDefaults[variant];
  const offsetX = defaults.x;
  const offsetY = y ?? defaults.y;
  const scaleVal = defaults.scale;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: offsetX, y: offsetY, scale: scaleVal }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: `${threshold}px` }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({
  children,
  className = '',
  speed = 0.3,
  direction = 'y',
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'x' | 'y';
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLDivElement>,
    offset: ['start end', 'end start'],
  });

  const factor = direction === 'y' ? speed * -100 : speed * -100;
  const translate = useTransform(scrollYProgress, [0, 1], [factor, -factor]);

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ [direction]: translate }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  threshold = -60,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  threshold?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: `${threshold}px` }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  variant = 'fade-up',
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  duration?: number;
}) {
  const prefersReduced = useReducedMotion();
  const defaults = variantDefaults[variant];

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: defaults.x, y: defaults.y, scale: defaults.scale },
        visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
