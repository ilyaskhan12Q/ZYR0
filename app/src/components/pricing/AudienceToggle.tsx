import { m } from 'framer-motion';
import { User, Building2 } from 'lucide-react';

export type AudienceType = 'personal' | 'business';

interface AudienceToggleProps {
  audience: AudienceType;
  onChange: (audience: AudienceType) => void;
}

export default function AudienceToggle({ audience, onChange }: AudienceToggleProps) {
  return (
    <div className="inline-flex items-center">
      <div
        role="tablist"
        aria-label="Pricing audience"
        className="relative inline-flex items-center rounded-full border border-border p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={audience === 'personal'}
          onClick={() => onChange('personal')}
          className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            audience === 'personal'
              ? 'text-background'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {audience === 'personal' && (
            <m.div
              layoutId="audience-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 -z-10 rounded-full bg-foreground"
            />
          )}
          <User className="h-3.5 w-3.5" />
          <span>Personal</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={audience === 'business'}
          onClick={() => onChange('business')}
          className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            audience === 'business'
              ? 'text-background'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {audience === 'business' && (
            <m.div
              layoutId="audience-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 -z-10 rounded-full bg-foreground"
            />
          )}
          <Building2 className="h-3.5 w-3.5" />
          <span>Business</span>
        </button>
      </div>
    </div>
  );
}
