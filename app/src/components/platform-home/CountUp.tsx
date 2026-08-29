import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  end: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

function parseNumber(str: string): { numeric: number; prefix: string; suffix: string } {
  const match = str.match(/^([^0-9]*)([0-9.]+)(.*)$/);
  if (!match) return { numeric: 0, prefix: '', suffix: str };
  return {
    prefix: match[1],
    numeric: parseFloat(match[2]),
    suffix: match[3],
  };
}

export default function CountUp({ end, duration = 2, className = '', style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { numeric, prefix, suffix } = parseNumber(end);
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (!isInView || numeric === 0) return;

    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numeric);

      setDisplay(`${prefix}${current}${suffix}`);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, numeric, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
