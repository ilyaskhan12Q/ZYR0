import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTour } from './TourProvider';
import { cn } from '@/lib/utils';
import type { TourPlacement } from './TourStep';

const GAP = 12;
const CARD_WIDTH = 288;
const CARD_HEIGHT_EST = 170;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}

function computePlacement(rect: Rect, preferred: TourPlacement): TourPlacement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const overflows = {
    top: rect.top - GAP - CARD_HEIGHT_EST < 12,
    bottom: rect.bottom + GAP + CARD_HEIGHT_EST > vh - 12,
    left: rect.left - GAP - CARD_WIDTH < 12,
    right: rect.right + GAP + CARD_WIDTH > vw - 12,
  };
  if (preferred === 'bottom' && overflows.bottom) return overflows.top ? 'left' : 'top';
  if (preferred === 'top' && overflows.top) return overflows.bottom ? 'right' : 'bottom';
  if (preferred === 'right' && overflows.right) return overflows.left ? 'bottom' : 'left';
  if (preferred === 'left' && overflows.left) return overflows.right ? 'bottom' : 'right';
  return preferred;
}

function computeCardStyle(rect: Rect, placement: TourPlacement): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = 0;
  let y = 0;
  if (placement === 'bottom') {
    x = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    y = rect.bottom + GAP;
  } else if (placement === 'top') {
    x = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    y = rect.top - GAP - CARD_HEIGHT_EST;
  } else if (placement === 'right') {
    x = rect.right + GAP;
    y = rect.top + rect.height / 2 - CARD_HEIGHT_EST / 2;
  } else {
    x = rect.left - GAP - CARD_WIDTH;
    y = rect.top + rect.height / 2 - CARD_HEIGHT_EST / 2;
  }
  x = Math.min(Math.max(x, 12), vw - CARD_WIDTH - 12);
  y = Math.min(Math.max(y, 12), vh - CARD_HEIGHT_EST - 12);
  return { left: x, top: y, width: CARD_WIDTH };
}

export function TourSpotlight() {
  const { tour, stepIndex, next, back, skip, finish } = useTour();
  const reducedMotion = useReducedMotion();
  const step = tour?.steps[stepIndex];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [rect, setRect] = useState<Rect | null>(null);

  const recompute = useCallback(() => {
    if (!step || isMobile) return;
    setRect(getTargetRect(step.target));
  }, [step, isMobile]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    if (!step?.activateTab) return;
    const tabsEl = document.querySelector<HTMLElement>('[data-tour="workspace-tabs"]');
    const match = Array.from(tabsEl?.querySelectorAll('button') ?? []).find((btn) =>
      btn.textContent?.trim().toLowerCase().includes(step.activateTab!.toLowerCase())
    );
    match?.click();
    const timer = setTimeout(recompute, 450);
    return () => clearTimeout(timer);
  }, [step?.id, step?.activateTab, recompute]);

  useEffect(() => {
    if (!tour || isMobile) return;
    const onScroll = () => recompute();
    const onResize = () => recompute();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [tour, isMobile, recompute]);

  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tour, next, back, skip]);

  if (!tour || !step) return null;

  const isLast = stepIndex === tour.steps.length - 1;
  const placement = rect ? computePlacement(rect, step.placement ?? 'bottom') : (step.placement ?? 'bottom');
  const cardStyle = rect ? computeCardStyle(rect, placement) : null;
  const pad = 4;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {rect && !isMobile && (
        <motion.div
          key={`ring-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [1, 0.85, 1], scale: [1, 1.02, 1] }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.25 }, scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
          className="fixed z-40 pointer-events-none rounded-xl border-[2.5px] border-accent shadow-[0_0_0_6px_rgba(59,130,246,0.28),0_0_60px_rgba(59,130,246,0.45)]"
          style={{
            left: rect.left - pad,
            top: rect.top - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      <motion.div
        key={`card-${step.id}`}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', duration: 0.4 }}
        role="dialog"
        aria-label={step.title}
        className={cn(
          'fixed z-50 bg-card border border-border rounded-2xl shadow-2xl p-4',
          isMobile && 'left-4 right-4 bottom-4 top-auto'
        )}
        style={!isMobile && cardStyle ? cardStyle : undefined}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            {stepIndex + 1} of {tour.steps.length}
          </p>
          <div className="flex items-center gap-1">
            {tour.steps.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === stepIndex ? 'bg-accent' : 'bg-muted-foreground/25'
                )}
              />
            ))}
          </div>
        </div>

        <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{step.body}</p>

        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-1.5">
            {stepIndex > 0 && (
              <button
                onClick={back}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={skip}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
          <button
            onClick={isLast ? finish : next}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors shadow-md shadow-accent/10"
          >
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
