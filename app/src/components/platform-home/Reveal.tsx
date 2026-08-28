import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  scale?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 24,
  scale,
  once = true,
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  const directionMap = {
    up: { y: distance, x: 0 },
    left: { y: 0, x: -distance },
    right: { y: 0, x: distance },
  };

  const initial = {
    opacity: 0,
    y: directionMap[direction].y,
    x: directionMap[direction].x,
    ...(scale !== undefined ? { scale } : {}),
  };

  const animate = isInView
    ? {
        opacity: 1,
        y: 0,
        x: 0,
        ...(scale !== undefined ? { scale: 1 } : {}),
      }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
