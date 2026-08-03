# Landing Page V3 — Design System & Implementation Plan

> Branch: `landing-page-v3` · Released: **v0.22.0** · Status: Complete (Phases 0–6 + light theme)

## 1. Goal

Rebuild the ZYR0 landing page as a premium, conversion-focused page benchmarked against
leading internship platforms (Internshala, Handshake, Wellfound, LinkedIn, Forage,
ROZEE.PK, Indeed). If the result is approved it becomes the primary landing page.

## 2. Competitor Research Summary (Phase 0)

| Signal | Internshala | Handshake | Wellfound | Forage | ROZEE.PK / Indeed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Hero | Rank claim + search + dual CTAs | Benefit headline + filter chips + live cards | Serif-italic accent headline + floating chips | Mission headline + reassuring microcopy | Search-first utility |
| Trust | App ribbon stats, company strip | Logo bar, 1M+ claim | Stats row | Partner logos | Employer strip |
| Cards | 6-8px, hairline, flat | Rounded, minimal shadow | 28px radius, soft shadow, hover lift | 16-24px, flat | flat rows |

**Canonical section order:** Hero → social proof (stats/logo marquee) → dual-audience
split → catalog/content → journey/how-it-works → testimonials → final CTA → footer.

**Hero formula:** outcome/rank H1 with one emphasized word · reassurance subtext
("Free for students · Paid internships · 2,000+ companies") · two role-based CTAs
(student primary / employer secondary) · embedded search with mode + city chips ·
trust strip immediately below.

## 3. Design System (ZYR0 V3)

### 3.1 Typography

| Role | Font | Usage |
| :--- | :--- | :--- |
| Display | **Sora** (600–800) | H1–H4, section titles, `.font-display` / `.font-heading` (map in `index.css`) |
| Body / UI | **Inter** | Paragraphs, nav, buttons, forms |
| Editorial accent | **Fraunces italic** (500–600) | Accent words inside the hero H1 (Wellfound-style) |
| Eyebrows / labels | **Space Grotesk** (500–600), uppercase `0.12em` | Section eyebrows, badges, chip labels |

### 3.2 Color System

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| Primary (cobalt) | `#2563EB` | `#38BDF8` | CTAs, links, active states — matches certificate navy `#1E3A8A` family |
| Success (emerald) | `#10B981` | `#34D399` | Placement counts, "hiring" status |
| Stipend (amber) | `#F59E0B` | `#FBBF24` | Stipend/salary chips, highlights |
| Canvas | `#F8FAFC` | `#0A0F1E` | Page background (over the parabolic-pentagon canvas) |
| Surface | `#FFFFFF` / `#0F172A` | glass `white/60` · `slate-900/60` | Cards, panels (existing glass tokens retained) |
| Ink | `#0F172A` | `#F8FAFC` | Primary text |

Gradient accent (hero title): **Cobalt → Sky → Indigo** (`#2563EB → #38BDF8 → #6366F1`).

### 3.3 Shape & Depth

- Cards: `rounded-2xl` (16px) to `rounded-3xl` (24px), `border border-slate-200/80` light /
  `border-white/10` dark, `backdrop-blur-md`.
- Shadows: layered soft `shadow-[0_20px_45px_-20px_rgba(2,6,23,0.35)]`.
- Buttons: `rounded-xl`, primary = cobalt gradient, secondary = glass; hover `-translate-y-0.5`.
- Motion: respect `prefers-reduced-motion`; counters animate on scroll into view.

## 4. Page Architecture (Section Order)

| # | Section | Component / Source | Notes |
| :--- | :--- | :--- | :--- |
| 1 | **Hero V3** | New `HeroV3` (inline in `Landing.tsx`) | Rank H1 + Fraunces italic accent, reassurance subtext, dual CTAs, **animated search mockup** (typewriter + rotating mode/city chips), floating "Hiring Now" badges, mini trust row |
| 2 | **Stats band** | New `StatsBand` | Animated count-up: 2,400+ placements · 450+ companies · Rs 18M+ stipends · 4.9★ rating |
| 3 | **Employer marquee** | New `LogoMarquee` | CSS infinite marquee of employer/certification logos, pause on hover |
| 4 | **Dual-audience split** | New `AudienceSplit` | Two large cards: "For Students" / "For Employers" with checklist + CTA (Wellfound split pattern) |
| 5 | **Roles chip cloud** | New `RoleChips` | Trending roles: Frontend · AI · UI/UX · Data · Marketing … (ROZEE/Indeed pattern) |
| 6 | **Journey** | Existing `JourneySection` | Kept — stacking cards already implemented in 0.18.x |
| 7 | **Testimonials** | Existing (restyled) | High-contrast glass cards |
| 8 | **Final CTA** | Existing CTA banner (restyled) | Gradient panel + primary CTA |

`PublicLayout` (nav, footer, background canvas) is **untouched**.

## 5. Implementation Roadmap

1. **Phase 0 — Research & Plan (this doc)** · `docs:` commit. ✅ (`8dd29be`)
2. **Phase 1 — Design tokens**: fonts (Sora display map, Fraunces italic, Space Grotesk),
   cobalt/emerald/amber tokens, `.eyebrow` utility, gradient text class. Commit `feat(landing-v3): design tokens`. ✅ (`4066679`)
3. **Phase 2 — Hero V3**: headline + accent, dual CTAs, animated search mockup, floating
   badges, trust row. Commit `feat(landing-v3): hero`. ✅ (`70013f7`)
4. **Phase 3 — Social proof**: `StatsBand` (animated counters) + `LogoMarquee`. Commit `feat(landing-v3): social proof`. ✅ (`cfc3658`)
5. **Phase 4 — Audience split + role chips**. Commit `feat(landing-v3): audience split`. ✅ (`8daf08f`)
6. **Phase 5 — Testimonials & CTA polish** for the new system. Commit `feat(landing-v3): polish`. ✅ (`fc54ad1`)
7. **Phase 6 — Validation**: `npm run build`, `tsc -b`, ESLint, CHANGELOG → **v0.21.0**. Commit `chore(release): ...`.

## 6. Success Criteria (verifiable)

- [ ] Build passes (`tsc -b && vite build`) with zero errors.
- [ ] Sora renders on all headings; Fraunces italic accent renders on hero.
- [ ] Dark mode + light mode both meet WCAG AA contrast on all new sections.
- [ ] `prefers-reduced-motion` disables counters/marquee/typewriter animations.
- [ ] No layout shift (CLS < 0.05) from the animated components (fixed min-heights).
- [ ] Mobile: no horizontal overflow; hero search mockup stacks gracefully.
