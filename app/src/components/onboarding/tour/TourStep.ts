export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Value of the `data-tour` attribute on the target element. */
  target: string;
  placement?: TourPlacement;
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}
