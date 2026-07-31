import React from 'react';
import { DotmSquare14, type DotmSquare14Props } from '@/components/ui/dotm-square-14';
import { cn } from '@/lib/utils';
import type { DotMatrixColorPreset } from '@/lib/dotmatrix-core';

export type LoaderVariant = 'page' | 'container' | 'inline' | 'button' | 'overlay';

export interface LoaderProps extends Omit<DotmSquare14Props, 'size'> {
  /**
   * Layout variant for different context placements.
   * - `page`: Centered page transition or major section loader
   * - `container`: Centered within a card or dashboard content area (default)
   * - `inline`: Compact inline element for badge or table text
   * - `button`: Mini loader for action buttons
   * - `overlay`: Fixed backdrop overlay for blocking operations (PDF, certificates, uploads, email)
   */
  variant?: LoaderVariant;
  /**
   * Optional descriptive label beneath or alongside the loader.
   */
  label?: string;
  /**
   * Alias for label
   */
  text?: string;
  /**
   * Alias for label
   */
  message?: string;
  /**
   * Explicit size in pixels (overrides default variant sizes).
   */
  size?: number;
  /**
   * Custom container wrapper class name.
   */
  className?: string;
  /**
   * Color preset for the dot matrix loader. Defaults to 'grad-aurora'.
   */
  colorPreset?: DotMatrixColorPreset;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'container',
  label,
  text,
  message,
  size,
  dotSize,
  speed = 1.2,
  colorPreset = 'grad-aurora',
  bloom = true,
  animated = true,
  muted = false,
  ariaLabel = 'Loading',
  className,
  ...props
}) => {
  const displayLabel = label ?? text ?? message;
  const defaultSizes: Record<LoaderVariant, { size: number; dotSize: number }> = {
    page: { size: 48, dotSize: 6 },
    container: { size: 36, dotSize: 5 },
    overlay: { size: 44, dotSize: 6 },
    inline: { size: 24, dotSize: 3 },
    button: { size: 18, dotSize: 2.5 },
  };

  const currentSize = size ?? defaultSizes[variant].size;
  const currentDotSize = dotSize ?? defaultSizes[variant].dotSize;

  const dotmElement = (
    <DotmSquare14
      size={currentSize}
      dotSize={currentDotSize}
      speed={speed}
      colorPreset={colorPreset}
      bloom={bloom}
      animated={animated}
      muted={muted}
      ariaLabel={ariaLabel}
      {...props}
    />
  );

  if (variant === 'button') {
    return (
      <span className={cn("inline-flex items-center gap-2 align-middle shrink-0", className)}>
        {dotmElement}
        {displayLabel && <span>{displayLabel}</span>}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("inline-flex items-center gap-2 py-1 px-2 text-sm text-muted-foreground", className)}>
        {dotmElement}
        {displayLabel && <span className="font-medium text-xs tracking-wide">{displayLabel}</span>}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div
        className={cn(
          "min-h-[60vh] w-full flex flex-col items-center justify-center p-8 gap-4 text-center animate-in fade-in duration-300",
          className
        )}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="relative p-4 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 shadow-xl">
          {dotmElement}
        </div>
        {displayLabel ? (
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">{displayLabel}</p>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">ZYR0</p>
        )}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200",
          className
        )}
        aria-live="assertive"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/95 border border-border/80 shadow-2xl max-w-sm w-full">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            {dotmElement}
          </div>
          {displayLabel && (
            <p className="text-sm font-semibold text-foreground text-center animate-pulse">
              {displayLabel}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: 'container'
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 gap-3 min-h-[140px] w-full text-center",
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      {dotmElement}
      {displayLabel && (
        <p className="text-xs font-medium text-muted-foreground tracking-wide">{displayLabel}</p>
      )}
    </div>
  );
};

export default Loader;
