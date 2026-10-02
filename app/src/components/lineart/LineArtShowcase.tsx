'use client';

import { LineArtCanvas } from './LineArtCanvas';
import { SHAPE_NAMES, type ShapeName } from './shapes';

interface Candidate {
  name: ShapeName;
  label: string;
  note: string;
  yaw?: number;
  pitch?: number;
}

const CANDIDATES: Candidate[] = [
  { name: 'sphere', label: 'Sphere', note: 'Latitude / longitude grid', yaw: 0.5, pitch: 0.35 },
  { name: 'cube', label: 'Cube', note: 'Striped faces', yaw: 0.7, pitch: 0.45 },
  { name: 'cylinder', label: 'Cylinder', note: 'Rim rings + verticals', yaw: 0.4, pitch: 0.3 },
  { name: 'cone', label: 'Cone', note: 'Parallels + meridians', yaw: 0.9, pitch: 0.28 },
  { name: 'torus', label: 'Torus', note: 'U/V surface grid', yaw: 0.6, pitch: 0.7 },
  { name: 'icosahedron', label: 'Icosahedron', note: 'Faceted wireframe', yaw: 0.3, pitch: 0.4 },
  { name: 'ripple', label: 'Ripple field', note: 'Height function contours', yaw: 0, pitch: 0.9 },
  { name: 'helix', label: 'Helix coil', note: 'Spring tube lattice', yaw: 0.8, pitch: 0.35 },
];

export interface LineArtShowcaseProps {
  lineColor?: string;
  className?: string;
}

export function LineArtShowcase({ lineColor = '#ffffff', className }: LineArtShowcaseProps) {
  return (
    <section
      className={`relative overflow-hidden bg-black py-16 sm:py-24 ${className ?? ''}`}
      aria-label="3D line art candidates"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(120,120,160,0.18), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:mb-14">
          <span
            className="text-[11px] font-medium uppercase tracking-[0.28em]"
            style={{ color: 'var(--zyro-text-muted, #7a7a85)' }}
          >
            3D line art — hero candidates
          </span>
          <h2
            className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: 'var(--zyro-text, #f4f4f6)' }}
          >
            Vector-style solids with real hidden-line depth
          </h2>
          <p className="text-sm" style={{ color: 'var(--zyro-text-muted, #7a7a85)' }}>
            Drag any shape to orbit it. Each one renders live — no video, no image sequence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CANDIDATES.map((c, i) => (
            <figure
              key={c.name}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-white/25"
            >
              <div className="aspect-square w-full">
                <LineArtCanvas
                  shape={c.name}
                  lineColor={lineColor}
                  yaw={c.yaw}
                  pitch={c.pitch}
                  lineWidth={1.3}
                />
              </div>
              <figcaption className="flex items-baseline justify-between gap-2 border-t border-white/10 px-4 py-3">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--zyro-text, #f4f4f6)' }}
                  >
                    {c.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--zyro-text-muted, #7a7a85)' }}>
                    {c.note}
                  </div>
                </div>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: 'var(--zyro-text-muted, #7a7a85)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p
          className="mt-8 text-center text-xs"
          style={{ color: 'var(--zyro-text-muted, #7a7a85)' }}
        >
          WebGL2 · {SHAPE_NAMES.length} shapes · hidden-line removal on the GPU
        </p>
      </div>
    </section>
  );
}
