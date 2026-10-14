import { m } from 'framer-motion';

export type BillingInterval = 'monthly' | 'yearly';

interface BillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export default function BillingToggle({ interval, onChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <div
        role="radiogroup"
        aria-label="Billing frequency"
        className="relative inline-flex items-center p-1 rounded-full border border-border bg-muted/60 dark:bg-neutral-900/80 backdrop-blur-md shadow-inner"
      >
        <button
          type="button"
          role="radio"
          aria-checked={interval === 'monthly'}
          onClick={() => onChange('monthly')}
          className={`relative z-10 px-5 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 rounded-full cursor-pointer ${
            interval === 'monthly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'monthly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-full bg-card shadow-sm border border-border/80 -z-10"
            />
          )}
          Monthly
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={interval === 'yearly'}
          onClick={() => onChange('yearly')}
          className={`relative z-10 px-5 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 rounded-full flex items-center gap-2 cursor-pointer ${
            interval === 'yearly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'yearly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-full bg-card shadow-sm border border-border/80 -z-10"
            />
          )}
          <span>Yearly</span>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wide uppercase rounded-full border border-border text-foreground bg-muted">
            Save ~20%
          </span>
        </button>
      </div>
      <span className="text-[11px] text-muted-foreground hidden sm:inline">
        (Billed annually at $95.90/yr)
      </span>
    </div>
  );
}
