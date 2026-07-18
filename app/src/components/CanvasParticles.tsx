import { useEffect, useRef } from 'react';

const PARTICLE_PRESETS = [
  { left: 12, top: 45, duration: 4.2, delay: 0.5 },
  { left: 25, top: 15, duration: 3.8, delay: 1.2 },
  { left: 38, top: 78, duration: 4.9, delay: 0.1 },
  { left: 50, top: 30, duration: 3.5, delay: 1.8 },
  { left: 62, top: 85, duration: 4.7, delay: 0.8 },
  { left: 78, top: 22, duration: 3.9, delay: 1.4 },
  { left: 88, top: 65, duration: 4.4, delay: 0.3 },
  { left: 5, top: 88, duration: 4.1, delay: 1.6 },
  { left: 92, top: 12, duration: 3.6, delay: 0.9 },
  { left: 45, top: 60, duration: 4.8, delay: 0.4 },
  { left: 18, top: 72, duration: 3.7, delay: 1.1 },
  { left: 30, top: 50, duration: 4.5, delay: 0.7 },
  { left: 55, top: 10, duration: 3.4, delay: 1.5 },
  { left: 70, top: 75, duration: 4.6, delay: 0.2 },
  { left: 82, top: 55, duration: 4.0, delay: 1.3 },
  { left: 15, top: 28, duration: 3.3, delay: 1.7 },
  { left: 28, top: 90, duration: 4.3, delay: 0.6 },
  { left: 60, top: 40, duration: 4.1, delay: 1.0 },
  { left: 75, top: 95, duration: 4.9, delay: 0.3 },
  { left: 85, top: 35, duration: 3.5, delay: 1.9 },
];

export function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Detect if we are on a smaller viewport to adapt particle count
    const isMobile = window.innerWidth < 1024;
    const activeParticles = isMobile
      ? PARTICLE_PRESETS.filter((_, i) => i % 2 === 0)
      : PARTICLE_PRESETS;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        const px = (p.left / 100) * width;
        const py = (p.top / 100) * height;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
      return;
    }

    // Use passive resize listener to prevent scroll block
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // IntersectionObserver to pause rendering when hero is off-screen
    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    const startTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const elapsedSeconds = (time - startTime) / 1000;

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        
        // Calculate oscillation
        const delay = p.delay;
        const duration = p.duration;
        
        // Use Math.sin for smooth up/down oscillation
        // To match y: [0, -30, 0] over duration:
        // We want a wave that peaks at -30px and returns to 0
        const phase = ((elapsedSeconds - delay) * (Math.PI * 2)) / duration;
        
        // Offset range: 0 to -30
        const yOffset = (Math.sin(phase) - 1) * 15;
        
        // Opacity range: 0.2 to 0.7
        const opacity = 0.45 + Math.sin(phase) * 0.25;

        // Calculate absolute position
        const px = (p.left / 100) * width;
        const py = (p.top / 100) * height + yOffset;

        // Draw particle
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.9, opacity))})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
