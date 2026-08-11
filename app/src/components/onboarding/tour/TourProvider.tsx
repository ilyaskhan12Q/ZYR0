import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { TourDefinition } from './TourStep';
import { TOUR_REGISTRY } from './tours/studentWorkspace';

interface TourContextValue {
  tour: TourDefinition | null;
  stepIndex: number;
  start: (tourId: string) => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  finish: () => void;
}

interface TourProviderProps {
  children: ReactNode;
  /** Called whenever a tour ends (finished or skipped) so the caller can persist it. */
  onTourEnd?: (tourId: string, completed: boolean) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children, onTourEnd }: TourProviderProps) {
  const [tour, setTour] = useState<TourDefinition | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const endedTourId = useRef<string | null>(null);

  const end = useCallback((completed: boolean) => {
    setTour((current) => {
      if (current) endedTourId.current = current.id;
      return null;
    });
    setStepIndex(0);
    // Persist after state clears so the tour id is still available.
    setTimeout(() => {
      if (endedTourId.current) {
        onTourEnd?.(endedTourId.current, completed);
        endedTourId.current = null;
      }
    }, 0);
  }, [onTourEnd]);

  const start = useCallback((tourId: string) => {
    const definition = TOUR_REGISTRY[tourId];
    if (!definition || definition.steps.length === 0) return;
    setStepIndex(0);
    setTour(definition);
  }, []);

  const next = useCallback(() => {
    setTour((current) => {
      if (current) setStepIndex((prev) => Math.min(prev + 1, current.steps.length - 1));
      return current;
    });
  }, []);

  const back = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const value = useMemo<TourContextValue>(() => ({
    tour,
    stepIndex,
    start,
    next,
    back,
    skip: () => end(false),
    finish: () => end(true),
  }), [tour, stepIndex, start, next, back, end]);

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within a TourProvider');
  return ctx;
}
