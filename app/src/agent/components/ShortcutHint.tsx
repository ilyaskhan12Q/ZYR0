'use client';

import { cn } from '@/lib/utils';

/**
 * Hover/focus hint for an existing control: reveals the action's name and its
 * keyboard shortcut as `kbd` key caps. Pure CSS (group-hover + group-focus-within)
 * so it costs nothing when idle and also appears for keyboard users. Wraps the
 * control rather than replacing it, so placement and styling stay with the
 * control itself.
 */
export function ShortcutHint({
  label,
  keys,
  side = 'bottom',
  className,
  children,
}: {
  label: string;
  keys: readonly string[];
  side?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
  children: React.ReactNode;
}) {
  const position = {
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  }[side];

  return (
    <span className={cn('group/hint relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-[var(--ag-surface)] px-2 py-1 text-[11px] text-[var(--ag-text-2)] opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100',
          position
        )}
      >
        {label}
        <span className="flex items-center gap-0.5">
          {keys.map((key) => (
            <kbd
              key={key}
              className="rounded border border-white/10 bg-white/5 px-1 py-px font-sans text-[10px] text-[var(--ag-text-4)]"
            >
              {key}
            </kbd>
          ))}
        </span>
      </span>
    </span>
  );
}
