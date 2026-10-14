import { m } from 'framer-motion';

export type BillingInterval = 'monthly' | 'yearly';

interface BillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export default function BillingToggle({ interval, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center">
      <div
        role="tablist"
        aria-label="Billing frequency"
        className="relative inline-flex items-center p-1 rounded-2xl border border-border bg-muted/80 backdrop-blur-md shadow-sm"
      >
        <button
          type="button"
          role="radio"
          aria-checked={interval === 'monthly'}
          onClick={() => onChange('monthly')}
          className={`relative z-10 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 rounded-xl cursor-pointer ${
            interval === 'monthly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'monthly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border -z-10"
            />
          )}
          Monthly
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={interval === 'yearly'}
          onClick={() => onChange('yearly')}
          className={`relative z-10 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 rounded-xl flex items-center gap-2 cursor-pointer ${
            interval === 'yearly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'yearly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border -z-10"
            />
          )}
          <span>Yearly</span>
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium tracking-wide uppercase rounded-md border border-border text-foreground bg-card">
            Save ~20%
          </span>
        </button>
      </div>
    </div>
  );
}
