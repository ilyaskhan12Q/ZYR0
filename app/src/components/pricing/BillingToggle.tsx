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
        className="relative inline-flex items-center rounded-full border border-border p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={interval === 'monthly'}
          onClick={() => onChange('monthly')}
          className={`relative z-10 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            interval === 'monthly'
              ? 'text-background'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'monthly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 -z-10 rounded-full bg-foreground"
            />
          )}
          Monthly
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={interval === 'yearly'}
          onClick={() => onChange('yearly')}
          className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            interval === 'yearly'
              ? 'text-background'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {interval === 'yearly' && (
            <m.div
              layoutId="billing-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 -z-10 rounded-full bg-foreground"
            />
          )}
          <span>Yearly</span>
          <span
            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
              interval === 'yearly'
                ? 'border-background/30 text-background'
                : 'border-border text-muted-foreground'
            }`}
          >
            Save ~20%
          </span>
        </button>
      </div>
    </div>
  );
}
