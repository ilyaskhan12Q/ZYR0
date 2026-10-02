'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useTheme } from 'next-themes';
import { LineArtCanvas } from './LineArtCanvas';
import type { ShapeName } from './shapes';

interface HeroShape {
  name: ShapeName;
  label: string;
  sub: string;
  yaw?: number;
  pitch?: number;
}

const HERO_SHAPES: HeroShape[] = [
  { name: 'icosahedron', label: 'Icosahedron', sub: 'Faceted wireframe', yaw: 0.3, pitch: 0.4 },
  { name: 'torus', label: 'Torus', sub: 'Parametric surface', yaw: 0.6, pitch: 0.7 },
  { name: 'sphere', label: 'Sphere', sub: 'Latitude-longitude grid', yaw: 0.5, pitch: 0.35 },
  { name: 'helix', label: 'Helix', sub: 'Spiral lattice', yaw: 0.8, pitch: 0.35 },
  { name: 'cube', label: 'Cube', sub: 'Isometric lines', yaw: 0.7, pitch: 0.45 },
  { name: 'cylinder', label: 'Cylinder', sub: 'Radial verticals', yaw: 0.4, pitch: 0.3 },
  { name: 'cone', label: 'Cone', sub: 'Meridian matrix', yaw: 0.9, pitch: 0.28 },
  { name: 'ripple', label: 'Ripple Field', sub: 'Heightwave contours', yaw: 0, pitch: 0.9 },
];

export interface HeroLineArtCycleProps {
  className?: string;
  lineColor?: string;
  intervalMs?: number;
}

export function HeroLineArtCycle({
  className = '',
  lineColor,
  intervalMs = 4000,
}: HeroLineArtCycleProps) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SHAPES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const current = HERO_SHAPES[index];

  // In light mode, use crisp high-contrast dark lines (#1a1a24); in dark mode, crisp pure white (#ffffff)
  const isDark = !mounted || resolvedTheme === 'dark';
  const effectiveLineColor = lineColor ?? (isDark ? '#ffffff' : '#1e1e28');

  return (
    <div className={`relative flex items-center justify-center w-full ${className}`}>
      {/* Ambient background glow behind the canvas - subtle and theme-aware */}
      <div
        className="pointer-events-none absolute -inset-6 sm:-inset-12 rounded-full opacity-35 dark:opacity-40 blur-3xl transition-opacity duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(123, 123, 220, 0.32) 0%, rgba(56, 189, 248, 0.16) 45%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(123, 123, 220, 0.20) 0%, rgba(99, 102, 241, 0.10) 45%, transparent 70%)',
        }}
      />

      {/* Pure, Unboxed Floating 3D Line Art Stage — compact on mobile, expansive on desktop */}
      <div className="relative aspect-square w-full max-w-[190px] xs:max-w-[220px] sm:max-w-[320px] md:max-w-[420px] lg:max-w-[650px] xl:max-w-[720px] flex items-center justify-center">
        <AnimatePresence>
          <m.div
            key={current.name}
            initial={{
              opacity: 0,
              scale: 0.82,
              filter: 'blur(8px)',
              rotate: -8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              scale: 1.18,
              filter: 'blur(10px)',
              rotate: 8,
            }}
            transition={{
              duration: 1.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 h-full w-full will-change-transform"
          >
            <LineArtCanvas
              shape={current.name}
              lineColor={effectiveLineColor}
              yaw={current.yaw}
              pitch={current.pitch}
              lineWidth={1.5}
              autoRotate={true}
              rotateSpeed={16}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
