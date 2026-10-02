'use client';

import { useEffect, useRef, useState } from 'react';
import { LineArtRenderer } from './renderer';
import type { ShapeName } from './shapes';

export interface LineArtCanvasProps {
  shape: ShapeName;
  lineColor?: string;
  background?: string;
  lineWidth?: number;
  autoRotate?: boolean;
  /** degrees per second */
  rotateSpeed?: number;
  yaw?: number;
  pitch?: number;
  className?: string;
  fallback?: React.ReactNode;
}

const PITCH_MIN = -1.25;
const PITCH_MAX = 1.25;
const RESUME_MS = 1500;

export function LineArtCanvas({
  shape,
  lineColor = '#ffffff',
  background,
  lineWidth = 1.4,
  autoRotate = true,
  rotateSpeed = 14,
  yaw,
  pitch,
  className,
  fallback,
}: LineArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LineArtRenderer | null>(null);
  const failedRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const propsRef = useRef({ autoRotate, rotateSpeed });
  useEffect(() => {
    propsRef.current = { autoRotate, rotateSpeed };
  }, [autoRotate, rotateSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failedRef.current) return;

    let renderer: LineArtRenderer;
    try {
      renderer = new LineArtRenderer(canvas, shape, {
        lineColor,
        background,
        lineWidth,
        yaw,
        pitch,
      });
    } catch (err) {
      console.error('[lineart] init failed:', err);
      failedRef.current = true;
      setFailed(true);
      return;
    }

    rendererRef.current = renderer;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let last = performance.now();
    let lastInteract = -Infinity;
    let dragging = false;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { autoRotate: rotate, rotateSpeed: speed } = propsRef.current;
      if (rotate && !reduced && !dragging && now - lastInteract > RESUME_MS) {
        renderer.yaw += (speed * Math.PI) / 180 * dt;
      }
      renderer.render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastInteract = performance.now();
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      lastInteract = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.yaw -= dx * 0.008;
      renderer.pitch = Math.max(
        PITCH_MIN,
        Math.min(PITCH_MAX, renderer.pitch + dy * 0.006),
      );
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      lastInteract = performance.now();
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvas);

    // Watch for theme/class changes on root element (e.g. .dark toggled) to update color if CSS var used
    const mo = new MutationObserver(() => {
      if (rendererRef.current && lineColor) {
        rendererRef.current.setLineColor(lineColor);
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      renderer.dispose();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, lineColor]);

  useEffect(() => {
    if (rendererRef.current && lineColor) {
      rendererRef.current.setLineColor(lineColor);
    }
  }, [lineColor]);

  if (failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className ?? ''}`}>
        {fallback ?? (
          <span className="text-xs" style={{ color: 'var(--zyro-text-muted, #888)' }}>
            3D preview unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full cursor-grab touch-none active:cursor-grabbing ${className ?? ''}`}
      aria-label={`Interactive 3D line art: ${shape}`}
    />
  );
}
