# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-07-18

### Added
- Per-page code splitting: lazy-loaded all portal sub-pages (company ~12, student ~14, admin ~10, mentor ~7) so each page loads only its own chunk.
- Lazy-loaded DashboardLayout (26 kB) so anonymous visitors don't download protected-route code.
- Separate `vendor-recharts` chunk (421 kB) — recharts only loads when visiting Analytics pages.
- Shared `RouteLoading` spinner component for consistent lazy-load UX.

### Changed
- Moved Google Fonts from CSS `@import` to `<link>` in index.html with preconnect hints for earlier font discovery.
- Removed dead code: deleted unused `Home.tsx` (Vite starter template) and `App.css` (42 lines of dead styles).
- Extracted `SEO` component, `notifications`, `messages`, and other shared modules into separate async chunks.

### Performance Improvements
- **portal-company initial load: 581 kB → ~11 kB** (98% reduction) — only the visited page loads, not all 12 company pages.
- **portal-student initial load: 301 kB → ~12 kB** (96% reduction) — only the visited page loads.
- **portal-admin initial load: 112 kB → ~5-20 kB per page** (82%+ reduction).
- **portal-mentor initial load: 70 kB → ~3-15 kB per page** (79%+ reduction).
- **Anonymous landing page: DashboardLayout (26 kB) and all its transitive deps no longer loaded** — saves ~80+ kB on first visit.
- **Font loading: CSS @import → HTML link with display=swap** — earlier font discovery, no render blocking.

## [0.5.2] - 2026-07-18

### Added
- Expanded homepage content from ~450 to ~1,071 words across all sections with Pakistan-specific context.
- Rewrote About page with new sections: Pakistan internship gap challenges, platform philosophy, and team placeholder.
- Expanded FAQ from 14 to 26 questions across 4 categories (added Mentor category).
- Added contextual internal cross-linking between Contact, FAQ, Help Center, Verify, Privacy, Terms, and Cookie pages.
- Added semantic HTML (`role="article"`, `<address>`, `<figure>`, `<time>`) across 10 public pages.
- Added FAQPage and ContactPage structured data schemas.

### Changed
- Expanded Mission/Vision on About page with Pakistan-focused second paragraphs.
- Increased About page values from 4 to 6 (added Transparency, Accessibility).
- Extended About timeline from 4 to 5 milestones.

## [0.5.1] - 2026-07-18

### Changed
- Re-enabled and optimized landing page animations on mobile using CSS `will-change`, CSS variables, and native transitions instead of heavy JavaScript execution.
- Replaced Framer Motion particle effects with a high-performance, responsive HTML5 2D Canvas-based particle rendering system (`CanvasParticles`) that respects `prefers-reduced-motion` and pauses when off-screen.
- Refined micro-interactions on the landing page (pointer hover, floating cards) for smooth 60 FPS rendering on mobile devices.

## [0.5.0] - 2026-07-17

### Added
- Realtime updates and synchronization for profiles and companies on the Admin Dashboard.
- Clean text fallback support to the `send-email` Edge Function to prevent spam filter rejections.
- Configured a DMARC DNS record and sender authentication requirements for email deliverability.

### Changed
- Upgraded CSS hover states in `index.css` with media query guards (`@media (hover: hover)`) to resolve sticky hovers and scroll lag on mobile browsers.
- Replaced desktop-heavy animations on the landing page with conditional static layouts on mobile breakpoints.
- Implemented lazy-routed modules and code-split `framer-motion` features to accelerate mobile main-thread execution.
- Rethemed and unified platform-wide branding under the ZYR0 name, including a redesigned landing page hero section.

### Fixed
- Fixed email deliverability issues by routing through authenticated sender domain.
- Enhanced certificate email triggers to include structural text content and secure links.

## [0.4.4] - 2026-07-16

### Added
- Completed end-to-end saved internships system, including DB schemas, RLS policies, query/mutation services, and cache invalidation.
- Implemented company rating features with trigger-calculated aggregate company reviews.

## [0.4.3] - 2026-07-16

### Fixed
- Fixed canonical URL and placeholder generation: configured Vite HTML transformer plugin to replace `%VITE_SITE_URL%` at build time in `index.html` with a safe fallback of the production origin `https://zyroo.dpdns.org`.
- Enhanced client-side `SITE_CONFIG` to dynamically resolve the site URL at runtime via `import.meta.env.VITE_SITE_URL` and `window.location.origin`.
- Restructured sitemap/robots scripts to support environment-variable overrides of the production URL.

## [0.4.2] - 2026-07-16

### Security
- Hardened Supabase Storage bucket RLS policies for `resumes` and `avatars` to enforce that authenticated users can only write, update, or delete files inside their own user-scoped folders/files (`resumes/{user_id}/` and `avatars/{user_id}.*`), preventing potential cross-user file tampering or deletions.

## [0.4.1] - 2026-07-16

### Fixed
- Resolved a critical authentication redirect blocker (PGRST201/HTTP 300 Multiple Choices error) where multiple foreign keys existed between `profiles` and `companies` tables, preventing profile retrieval on login. Explicitly mapped the join to the `profiles_company_id_fkey` constraint.

## [0.4.0] - 2026-07-16

### Added
- Centered premium glassmorphism profile completion modal shown to Students, Companies, and Mentors on first login after registration.
- Persistent warning banner at the top of all dashboard views displaying the completion progress bar and current percentage.
- Role-specific profile completion checklist visual indicators.
- Route protection guard in the global dashboard layout to redirect uncompleted users to dashboards and show error toasts.
- Application submission lock in `InternshipDetail.tsx` preventing incomplete student profiles from applying to internships.

## [0.3.0] - 2026-07-16

### Added
- Dynamic supervisor and mentor signatures on student certificates fetched directly from database profiles.
- Automatic integration of company-specific logos on the certificate template with beautiful, responsive fallbacks.
- Dynamic company owner signatures, titles, and company brand configurations for PDF-generated offer letters.

### Changed
- Refactored `CertificateDocument.tsx` to remove all static placeholder names, roles, and logo placeholders, replacing them with dynamic variables.
- Refactored `generateOfferLetterPdf` to map company owner information dynamically.

### Fixed
- TypeScript compilation errors inside `CertificateDocumentProps` interface in `CertificateDocument.tsx`.

---

## [0.2.2] - 2026-07-15

### Fixed
- Auth pages (Login, Register) theme implementation to audit and improve dark/light contrast.
- Removed hardcoded white overlays from the right-hand branding panel, using theme tokens instead.
- Increased readability of authentication fields, links, and text.

---

## [0.2.1] - 2026-07-10

### Changed
- Replaced hardcoded GitHub repository references in the website footer with the user's custom portfolio link (`https://ilyaskhan12q.github.io/portfolio`).
- Enhanced landing page hero layout responsiveness across small, medium, and large breakpoints.

---

## [0.2.0] - 2026-07-09

### Added
- Complete production SEO audit and optimization setup.
- Automated dynamic `sitemap.xml` generation script referencing production domain `https://zyroo.dpdns.org`.
- Properly configured production `robots.txt` ensuring full search engine indexing capability.

---

## [0.1.1] - 2026-07-06

### Changed
- Replaced deprecated Google Charts QR code API with `qrserver.com` in certificates view.
- Added SMTP-to-Resend fallback chaining inside the `send-email` Edge Function to ensure robust email deliveries.
- Resolved orphaned brackets in Edge Functions causing bundler issues.
- Fixed routing redirection in Workspace tasks to redirect to the correct workspace views instead of loops.

---

## [0.1.0] - 2026-07-05

### Added
- Complete Company Verification System including schema setup, admin review dashboards, routing gates, and owner notifications.
- Supabase RLS policies and table triggers.
