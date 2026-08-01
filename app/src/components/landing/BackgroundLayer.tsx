import React from 'react';

interface BackgroundLayerProps {
  /** Optional parallax offset passed down from scroll listener or internal hook */
  parallaxOffsetY?: number;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ parallaxOffsetY = 0 }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Background SVG Layer (Fixed, covers viewport, non-repeating) */}
      <div
        className="absolute -inset-[5%] w-[110%] h-[110%] flex items-center justify-center will-change-transform"
        style={{
          transform: `translate3d(0, ${-parallaxOffsetY}px, 0)`,
        }}
      >
        <img
          src="/svgs/parabolic-pentagon.svg"
          alt=""
          className="w-full h-full object-cover object-center opacity-70 dark:opacity-50 mix-blend-screen transition-opacity duration-500"
          loading="eager"
        />
      </div>

      {/* 2. Gradient Overlays Layer (Depth, ambient lighting, vignette contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/90 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-70 dark:opacity-80 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 25%, rgba(62, 11, 244, 0.15) 0%, rgba(32, 10, 194, 0.05) 50%, transparent 85%)',
        }}
      />
    </div>
  );
};
