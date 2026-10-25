import { m } from 'framer-motion';
import { User, Building2 } from 'lucide-react';

export type AudienceType = 'personal' | 'business';

interface AudienceToggleProps {
  audience: AudienceType;
  onChange: (audience: AudienceType) => void;
}

export default function AudienceToggle({ audience, onChange }: AudienceToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        role="tablist"
        aria-label="Pricing audience"
        className="relative inline-flex items-center p-1 rounded-2xl border border-border bg-muted/80 backdrop-blur-md shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={audience === 'personal'}
          onClick={() => onChange('personal')}
          className={`relative z-10 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-200 rounded-xl flex items-center gap-2 cursor-pointer ${
            audience === 'personal' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {audience === 'personal' && (
            <m.div
              layoutId="audience-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border -z-10"
            />
          )}
          <User className="w-3.5 h-3.5" />
          <span>Personal</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={audience === 'business'}
          onClick={() => onChange('business')}
          className={`relative z-10 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-200 rounded-xl flex items-center gap-2 cursor-pointer ${
            audience === 'business' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {audience === 'business' && (
            <m.div
              layoutId="audience-pill"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border -z-10"
            />
          )}
          <Building2 className="w-3.5 h-3.5" />
          <span>Business</span>
        </button>
      </div>
    </div>
  );
}
