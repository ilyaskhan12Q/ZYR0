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
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background/85 pointer-events-none" />
      
      {/* Ambient Radial Glows anchored to key landing sections */}
      <div
        className="absolute inset-0 opacity-80 dark:opacity-90 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle 650px at 50% 12%, rgba(16, 185, 129, 0.12), transparent 70%),
            radial-gradient(circle 750px at 85% 42%, rgba(99, 102, 241, 0.10), transparent 70%),
            radial-gradient(circle 650px at 15% 85%, rgba(14, 165, 233, 0.12), transparent 70%),
            radial-gradient(ellipse 90% 70% at 50% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 80%)
          `,
        }}
      />
    </div>
  );
};
