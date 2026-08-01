import { useEffect, useState } from 'react';

export function ParabolicPentagonBg() {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Subtle GPU parallax translation (moves slower than page content)
  const parallaxOffsetY = prefersReducedMotion ? 0 : Math.round(scrollY * 0.12);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Layer 1: Fixed SVG Parallax Layer */}
      <div
        className="absolute -inset-10 w-[110%] h-[110%] transition-transform duration-75 ease-out will-change-transform flex items-center justify-center"
        style={{
          transform: `translate3d(0, ${-parallaxOffsetY}px, 0) scale(1.05)`,
        }}
      >
        <img
          src="/svgs/parabolic-pentagon.svg"
          alt=""
          className="w-full h-full object-cover opacity-50 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500"
          loading="eager"
        />
      </div>

      {/* Layer 2: Sophisticated Gradient Overlay for Contrast & Depth */}
      {/* 2a. Central Radial Glow */}
      <div
        className="absolute inset-0 opacity-80 dark:opacity-90 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(62, 11, 244, 0.18) 0%, rgba(32, 10, 194, 0.08) 45%, transparent 80%)',
        }}
      />

      {/* 2b. Secondary Accent Ambient Glow */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-60"
        style={{
          background:
            'radial-gradient(circle 600px at 75% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* 2c. Adaptive Top & Bottom Vignette Transitions */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/95 pointer-events-none" />

      {/* 2d. Light-Mode-Only Overlay for Contrast & Depth (Dark Mode Unchanged) */}
      <div
        className="absolute inset-0 dark:hidden pointer-events-none transition-opacity duration-500"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255, 255, 255, 0.70) 0%, rgba(248, 250, 252, 0.40) 50%, transparent 85%),
            radial-gradient(circle 800px at 20% 40%, rgba(241, 245, 249, 0.50) 0%, transparent 70%),
            radial-gradient(circle 700px at 80% 70%, rgba(16, 185, 129, 0.04) 0%, rgba(241, 245, 249, 0.35) 60%, transparent 80%)
          `,
        }}
      />

      {/* 2e. Fine Subtle Noise Grid / Overlay Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] dark:opacity-[0.04]" />
    </div>
  );
}
