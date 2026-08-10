import * as React from "react";
import { cn } from "@/lib/utils";

export interface BlobCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Blob accent color (any CSS color). Used to build a soft radial gradient. */
  accent?: string;
  /** Extra classes for the inner glass panel. */
  contentClassName?: string;
}

/**
 * Optimized "bouncing blob" card (originally from Uiverse.io by dylanharriscameron).
 *
 * Perf notes vs the original:
 * - Blob is a pre-computed radial gradient instead of a solid color + `filter: blur()`,
 *   so the browser never re-rasterizes a blur per frame (the original does).
 * - Only `transform` animates and the blob is `will-change: transform`,
 *   so the animation runs on the compositor thread.
 * - Respects `prefers-reduced-motion` (animation disabled via CSS).
 * - Theme-aware (light + dark), responsive via `className`.
 */
function BlobCard({ accent = "#3b82f6", className, contentClassName, children, ...props }: BlobCardProps) {
  return (
    <div
      className={cn(
        "relative min-h-[250px] min-w-[200px] overflow-hidden rounded-[14px]",
        "shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]",
        "dark:shadow-[0_20px_45px_-20px_rgba(2,6,23,0.45)]",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="blob-card__blob animate-blob-bounce absolute left-1/2 top-1/2 h-[150px] w-[150px] rounded-full will-change-transform"
        style={{
          background: `radial-gradient(circle at center, ${accent} 0%, ${accent}00 70%)`,
        }}
      />
      <div
        className={cn(
          "absolute inset-[5px] z-[2] flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-white/95 backdrop-blur-[24px] outline-2 outline-white dark:bg-slate-900/95 dark:outline-white/10",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { BlobCard };
