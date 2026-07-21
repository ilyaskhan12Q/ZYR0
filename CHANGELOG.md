# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2026-07-21

### Added
- **Company Bulk Task Assignment (`feature/company-bulk-task-assignment`)**:
  - Implemented `bulkCreateTasks` service function in `@/services/tasks` for atomic multi-row task generation with duplicate prevention and cache invalidation.
  - Extended Company Task modal with an **Assignment Scope** toggle (`Selected Intern(s)` vs `All Enrolled Interns`).
  - Added dynamic filtering for accepted/enrolled interns within the chosen internship, displaying real-time intern counts and preview lists.
  - Dispatched simulated email/in-app notifications for each intern upon bulk creation.
  - Maintained complete task independence, individual submissions, and per-intern progress tracking.

## [0.5.7] - 2026-07-20

### Fixed
- **Certificate PDF: recipient name shifts out of position after printing / PDF export** (`fix/certificate-pdf-layout`)
  - **Root cause 1 — Wrong CSS display model for `.recipient`**: The print CSS used `display: inline-block`, which only centres text *within* the element's own box, not the box itself within its parent. The browser's print layout engine left-aligned the `inline-block` element, causing the name to drift sideways in the exported PDF while the in-app preview (screen renderer) appeared correct. Fixed by switching to `display: block; width: 100%` so `text-align: center` operates at the block level and is honoured identically in both renderers.
  - **Root cause 2 — `@media print` erased container padding**: The print media query applied `padding: 0` to `.cert-container`, overriding the `padding: 40px` defined by the screen rule. This shifted the visual centre-point of the interior certificate layout between preview and print. Fixed by preserving `padding: 40px` on `.cert-container` inside the print media query.
  - **Root cause 3 — Font-load race condition**: `printWindow.document.close()` triggered browser layout before the Google Fonts async `@import` for *Playfair Display Italic* had resolved. The browser fell back to a different serif with narrower character metrics, reflowing the name and breaking the centred position. Fixed by waiting on `document.fonts.ready` (with a 600 ms `setTimeout` fallback for older browsers) before calling `window.print()`.
  - No margins hardcoded; no positions manually offset; no visual redesign. Both preview and exported PDF now render identically for short, medium, and long student names.

## [0.9.0] - 2026-07-19

### Added
- Added official ZYR0 Facebook Business Page branding assets under `branding/facebook/`:
  - `profile-logo.png` (1024x1024 px): High-resolution icon centered and padded, optimized for circular cropping.
  - `cover-banner.png` (820x360 px): cover designed with a central safe zone to accommodate both mobile and desktop safe zones.
  - `post-template.png` (1024x1024 px): square layout with professional typography, signature line, and verified internship certificate design style to build authority.

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

## [0.5.4] - 2026-07-19

### Fixed
- Fixed Certificate email delivery pipeline: certificates are only marked as "Email Sent" (`email_sent = true`) after the email delivery service confirms successful acceptance.
- Prevented duplicate triggers and silent failures in the company Certificates page: added full sending loading states (`sendingCertId`) to disable interaction while certificate generation and emailing are active.
- Added comprehensive TypeScript type definitions for `email_sent` flag across frontend components and services.

## [0.5.3] - 2026-07-19

### Fixed
- Fixed Offer Letter email delivery database update sequence: database records are only updated to "Sent" and email sent flags (`email_sent`, `email_sent_at`) are set only after the email delivery service confirms successful acceptance.
- Added detailed step-by-step logging to the `send-email` Edge Function to track SMTP configuration status, Resend API key status, sanitization, attachment metadata, and API response details.
- Prevented silent email delivery failures in the company Offer Letters page: errors returned by the Edge Function or the email client are now thrown, preventing false success messages and keeping the offer letter in its initial status.

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
