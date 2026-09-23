import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTour } from './TourProvider';
import { cn } from '@/lib/utils';
import type { TourPlacement } from './TourStep';

const GAP = 12;
const CARD_WIDTH = 300;
const CARD_HEIGHT_EST = 180;

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

/** Small pointer notch on the card edge facing the highlighted target. */
function notchClasses(placement: TourPlacement): string {
  switch (placement) {
    case 'bottom':
      return '-top-[5px] left-1/2 -translate-x-1/2 rotate-45 border-t border-l';
    case 'top':
      return '-bottom-[5px] left-1/2 -translate-x-1/2 rotate-45 border-b border-r';
    case 'right':
      return '-left-[5px] top-1/2 -translate-y-1/2 rotate-45 border-l border-b';
    default:
      return '-right-[5px] top-1/2 -translate-y-1/2 rotate-45 border-r border-t';
  }
}

export function TourSpotlight() {
  const { tour, stepIndex, next, back, skip, finish } = useTour();
  const reducedMotion = useReducedMotion();
  const step = tour?.steps[stepIndex];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [rect, setRect] = useState<Rect | null>(null);

  const isCenterStep = step?.variant === 'center';
  const isLast = isCenterStep || stepIndex === (tour?.steps.length ?? 1) - 1;
  const stepCount = (tour?.steps.length ?? 1) - (tour?.summary ? 1 : 0);

  const recompute = useCallback(() => {
    if (!step || isMobile || !step.target) {
      setRect(null);
      return;
    }
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
    if (!tour || isMobile || isCenterStep) return;
    const onScroll = () => recompute();
    const onResize = () => recompute();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [tour, isMobile, isCenterStep, recompute]);

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

  const placement = useMemo(() => {
    if (!step || !rect || !step.target) return step?.placement ?? 'bottom';
    return computePlacement(rect, step.placement ?? 'bottom');
  }, [step, rect]);

  const cardStyle = useMemo(() => {
    if (!rect || !step?.target) return null;
    return computeCardStyle(rect, placement);
  }, [rect, step, placement]);

  if (!tour || !step) return null;

  const pad = 3;

  const cardInner = (
    <>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        {isCenterStep ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            You’re all set
          </span>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            {stepIndex + 1} of {stepCount}
          </span>
        )}
        {!isCenterStep && (
          <div className="flex items-center gap-1">
            {(tour?.steps ?? []).slice(0, stepCount).map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'w-1 h-1 rounded-full transition-colors',
                  i === stepIndex ? 'bg-accent' : 'bg-border'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {isCenterStep && tour.summary ? (
        <>
          <h4 className="text-sm font-semibold text-foreground">{tour.summary.title}</h4>
          {tour.summary.body && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{tour.summary.body}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {tour.summary.items.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 rounded-lg border border-border/70 p-2.5">
                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2">
            {step.icon && <step.icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />}
            <h4 className="text-sm font-semibold text-foreground leading-snug">{step.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{step.body}</p>
          {step.chip && (
            <p className="mt-2 rounded-md bg-muted/60 border border-border/60 px-2 py-1.5 text-[11px] text-muted-foreground leading-snug">
              {step.chip}
            </p>
          )}
        </>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1">
          {stepIndex > 0 && (
            <button
              onClick={back}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          <button
            onClick={skip}
            className="px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>
        <button
          onClick={isLast ? finish : next}
          className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
        >
          {isLast ? 'Done' : 'Next'}
          {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      <m.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/35"
        aria-hidden="true"
      />

      {rect && !isMobile && !isCenterStep && (
        <m.div
          key={`ring-${step.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed z-40 pointer-events-none rounded-lg border-2 border-accent ring-4 ring-accent/15"
          style={{
            left: rect.left - pad,
            top: rect.top - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      {isCenterStep ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <m.div
            key={`card-${step.id}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-label={tour.summary?.title ?? 'Tour complete'}
            className={cn(
              'pointer-events-auto w-full max-w-[420px] bg-card border border-border rounded-xl shadow-xl p-4 max-h-[85vh] overflow-y-auto',
              isMobile && 'fixed left-4 right-4 bottom-4 top-auto'
            )}
          >
            {cardInner}
          </m.div>
        </div>
      ) : (
        <m.div
          key={`card-${step.id}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
          transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-label={step.title}
          className={cn(
            'fixed z-50 bg-card border border-border rounded-xl shadow-xl p-4 max-h-[85vh] overflow-y-auto',
            isMobile && 'left-4 right-4 bottom-4 top-auto'
          )}
          style={
            isMobile
              ? { paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }
              : cardStyle ?? undefined
          }
        >
          {!isMobile && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute w-2.5 h-2.5 bg-card border-border pointer-events-none',
                notchClasses(placement)
              )}
            />
          )}
          {cardInner}
        </m.div>
      )}
    </AnimatePresence>
  );
}