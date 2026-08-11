export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Value of the `data-tour` attribute on the target element. */
  target: string;
  placement?: TourPlacement;
  /**
   * When set, the spotlight clicks the workspace tab whose label matches
   * this value (case-insensitive substring) before showing the step, so
   * steps can point at content that lives in another tab.
   */
  activateTab?: string;
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}
