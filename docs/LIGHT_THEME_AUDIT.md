# Light Theme Background & Contrast Audit

## Executive Summary
This document records the visual and structural audit of the ZYR0 Landing Page in **Light Theme** as part of the `fix/light-theme-background-optimization` task.

## Identified Light Theme Contrast & Legibility Issues

### 1. Global SVG Canvas (`BackgroundLayer.tsx` / `ParabolicPentagonBg.tsx`)
- **Issue**: In light mode, the fixed SVG background (`parabolic-pentagon.svg` and `final.svg`) uses `mix-blend-screen` with a bright background token, causing vector line graphics to wash out into `#FFFFFF` / light background color.
- **Remediation**: Adjust light-theme SVG stroke visibility, blend modes (`mix-blend-multiply` or opacity scaling), and light-mode ambient gradient overlay.

### 2. Ambient Gradient Overlay (`BackgroundLayer.tsx`)
- **Issue**: Overlay gradients tuned for dark mode lack sufficient vignette and light contrast, causing text overlays to compete with white background glare.
- **Remediation**: Implement light-mode specific overlay (`from-emerald-500/5 via-slate-100/40 to-slate-200/50`) above the SVG layer, maintaining SVG visibility while improving legibility.

### 3. Glassmorphic Surface Contrast (`Landing.tsx` & `PublicLayout.tsx`)
- **Issue**:
  - Cards currently use generic `bg-card` or hardcoded dark fills (`bg-slate-950/40`, `bg-gradient-to-b from-slate-950...`), creating dark patches in light mode.
  - Transparent cards lack sufficient light-mode border definition (`border-slate-200/80`) and soft shadows (`shadow-sm` / `shadow-md`), making them hard to distinguish against the SVG canvas.
- **Remediation**: Update glass surfaces for light mode using `bg-white/60 dark:bg-card/70`, `border-slate-200/80 dark:border-white/10`, and `shadow-sm dark:shadow-md`.

### 4. Typography & Foreground Contrast
- **Issue**:
  - Headings (`text-foreground`) in light mode need strong contrast (`text-slate-900 dark:text-foreground`).
  - Muted body text (`text-muted-foreground`) requires higher contrast (`text-slate-600 dark:text-muted-foreground`) so text remains readable without opaque container boxes.
  - Section subtitles and badges require dark/light theme aware color tokens.

### 5. Section Specific Fills
- **Community Section**: Has solid dark background (`bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950`), breaking light mode transparent continuity. Change to light-theme floating glass card container.
- **Stats Section**: Uses solid `bg-primary` / `bg-slate-950`, needs theme-aware translucent styling.
- **CTA Banner**: Needs light theme floating glass styling with high contrast text.

---
*Audit Completed for Phase 1.*
