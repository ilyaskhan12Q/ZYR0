import type { LucideIcon } from 'lucide-react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

/** How the step is presented: pointed at an element or centered on screen. */
export type TourStepVariant = 'spotlight' | 'center';

export interface TourStep {
  id: string;
  /** Required for spotlight steps; center steps use the tour summary instead. */
  title?: string;
  body?: string;
  /** Small lucide icon shown beside the title for scannability. */
  icon?: LucideIcon;
  /** Value of the `data-tour` attribute on the target element. */
  target?: string;
  /** Optional short note rendered as a chip under the body. */
  chip?: string;
  placement?: TourPlacement;
  variant?: TourStepVariant;
  /**
   * When set, the spotlight clicks the workspace tab whose label matches
   * this value (case-insensitive substring) before showing the step, so
   * steps can point at content that lives in another tab.
   */
  activateTab?: string;
}

/** Optional non-spotlight closing card listing secondary sections. */
export interface TourSummaryItem {
  label: string;
  body: string;
  icon?: LucideIcon;
}

export interface TourSummary {
  title: string;
  body?: string;
  items: TourSummaryItem[];
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
  summary?: TourSummary;
}
