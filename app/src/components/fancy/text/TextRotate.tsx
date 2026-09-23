import React, { useState, useEffect, useCallback, useId } from 'react';
import { AnimatePresence, m } from 'framer-motion';

export interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  mainClassName?: string;
  splitLevelClassName?: string;
  staggerFrom?: 'first' | 'last' | 'center' | 'random';
  staggerDuration?: number;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  auto?: boolean;
  loop?: boolean;
  onNext?: (index: number) => void;
  ariaLabel?: string;
}

export const TextRotate: React.FC<TextRotateProps> = ({
  texts,
  rotationInterval = 3200,
  mainClassName = '',
  splitLevelClassName = '',
  staggerFrom = 'first',
  staggerDuration = 0.025,
  initial = { y: '100%', opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: '-120%', opacity: 0 },
  transition = { type: 'spring', damping: 30, stiffness: 350 },
  auto = true,
  loop = true,
  onNext,
  ariaLabel,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const keyId = useId();

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    return () => {
      media.removeEventListener('change', listener);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const nextText = useCallback(() => {
    setCurrentTextIndex((prev) => {
      const next = prev === texts.length - 1 ? (loop ? 0 : prev) : prev + 1;
      if (onNext) onNext(next);
      return next;
    });
  }, [texts.length, loop, onNext]);

  useEffect(() => {
    if (!auto || prefersReducedMotion || texts.length <= 1) return;
    const interval = setInterval(nextText, rotationInterval);
    return () => clearInterval(interval);
  }, [auto, prefersReducedMotion, texts.length, rotationInterval, nextText]);

  const currentText = texts[currentTextIndex] || '';

  if (prefersReducedMotion) {
    return (
      <span className={`inline-block ${mainClassName}`} aria-label={ariaLabel || currentText}>
        {currentText}
      </span>
    );
  }

  // On mobile viewports, animate full word/phrase as a single lightweight node to prevent CPU spring overhead
  if (isMobile) {
    return (
      <span
        className={`inline-flex items-center relative overflow-hidden py-1 ${mainClassName}`}
        aria-label={ariaLabel || currentText}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={`${keyId}-${currentTextIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`inline-block whitespace-nowrap ${splitLevelClassName}`}
            aria-hidden="true"
          >
            {currentText}
          </m.span>
        </AnimatePresence>
      </span>
    );
  }

  const words = currentText.split(' ');
  const totalCharacters = currentText.length;

  const getStaggerDelay = (index: number, total: number) => {
    switch (staggerFrom) {
      case 'last':
        return (total - 1 - index) * staggerDuration;
      case 'center': {
        const center = Math.floor(total / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      case 'random':
        return Math.random() * total * staggerDuration;
      case 'first':
      default:
        return index * staggerDuration;
    }
  };

  let globalCharIndex = 0;

  return (
    <span
      className={`inline-flex items-center relative overflow-hidden py-1 ${mainClassName}`}
      aria-label={ariaLabel || currentText}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={`${keyId}-${currentTextIndex}`}
          className={`inline-flex flex-wrap items-center ${splitLevelClassName}`}
          aria-hidden="true"
        >
          {words.map((word, wordIdx) => {
            const chars = word.split('');

            return (
              <span key={`word-${wordIdx}-${word}`} className="inline-flex whitespace-nowrap mr-[0.25em] last:mr-0">
                {chars.map((char, charIdx) => {
                  const currentIndex = globalCharIndex++;
                  return (
                    <m.span
                      key={`${charIdx}-${char}-${currentIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(currentIndex, totalCharacters),
                      }}
                      className="inline-block whitespace-pre"
                    >
                      {char}
                    </m.span>
                  );
                })}
              </span>
            );
          })}
        </m.span>
      </AnimatePresence>
    </span>
  );
};

export default TextRotate;
