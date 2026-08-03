# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.20.1] - 2026-08-02

### Changed
- **Certificate Internship Title Emphasis (`style/certificate-internship-title`)**:
  - Made the internship title (e.g., "Frontend Development Intern") extra bold (`font-weight: 900`) and enlarged it above the body text size so it is the first element that catches the eye.
  - Thickened the gold underline to `2px` with a darker ink color for stronger contrast against the body copy.

## [0.20.0] - 2026-08-02

### Fixed
- **Certificate Production Hardening (`feature/certificate-production-hardening`)**:
  - Removed demo fallback records from the certificate verification flow and replaced them with honest placeholders.
  - Softened the cryptographic signature claim on certificates to accurate wording.
  - Added internship start/end dates to the company internship create form.
  - Removed the duplicate `011` migration (superseded by `027_add_certificate_dates.sql`).

## [0.19.5] - 2026-08-02

### Added
- **Real Internship Date Snapshots (`feature/certificate-real-dates`)**:
  - Added `end_date` to `internships` and internship period snapshot columns on certificates (`supabase/migrations/027_add_certificate_dates.sql`).
  - `issue-certificate` Edge Function snapshots internship start/end dates onto issued certificates.
  - Company portal: internship end date field added to the edit modal; issue flow passes dates through.
  - `CertificateDocument` renders the real internship period.

## [0.19.4] - 2026-08-02

### Changed
- **Certificate Typography Finalization (`style/certificate-typography`)**:
  - Added gold underlines beneath the signature script names.
  - Underlined the internship title in gold and bolded it for emphasis.

## [0.19.3] - 2026-08-02

### Changed
- **Certificate Layout Refinement (`style/certificate-layout`)**:
  - Removed the footer logo strip and skills section; shifted main content down for visual balance.
  - Enlarged and lowered the top partner logos; enlarged the award sub-header.
  - Made the award sub-header bold and larger.
  - Moved the title block up and enlarged the presented-to line.

## [0.19.2] - 2026-08-02

### Changed
- **Certificate Structure Reorganization (`style/certificate-structure`)**:
  - Rearranged the footer into dual signature blocks with center-aligned logos, VERIFIED SECURE seal, and QR code.
  - Replaced the government crest with partner logos in the top row.

## [0.19.1] - 2026-08-02

### Changed
- **Certificate Signature Block Redesign (`style/certificate-signature`)**:
  - Refined the signature block so script names sit directly on the signature line; dropped the duplicate role label.
  - Enlarged the signature block, moved it up, and added a ZYRO verified seal.
  - Straightened the signature above the line and adopted the Noun Project certified badge as the seal.

## [0.19.0] - 2026-08-02

### Added
- **Certificate Premium Redesign (`feature/certificate-premium-redesign`)**:
  - Rebuilt `CertificateDocument.tsx` into a premium enterprise layout, extracting a dedicated `certificateTemplate.ts` for deterministic, print-identical document styling.
  - Integrated real partner certification logos (ISO 9001:2015, ISO 9001 SGS, TÜV Rheinland, State Emblem of Pakistan) replacing generic placeholders.
  - Progressively enlarged the footer partner logos (60px → 72px → 78px) to balance empty space.
  - Replaced the recipient name pill with an elegant gold underline.

## [0.18.5] - 2026-08-02

### Changed
- **Landing Polish (`feature/landing-polish`)**:
  - Upgraded the "How It Works" section to glassmorphic cards with high-contrast step indicators.
  - Removed dark-mode conditional text color fallbacks in the community channels section for consistent high-contrast rendering.
  - Refined design tokens, card glassmorphism, and text contrast across the Landing V2 surface.
  - Enhanced hero CTA buttons and stat cards opacity and contrast.

## [0.18.4] - 2026-08-02

### Fixed
- Replaced `overflow-hidden` with `overflow-x-clip` on the Landing root to enable CSS `position: sticky` inside the journey section.

## [0.18.3] - 2026-08-02

### Changed
- **Stacking Cards Scroll Spec (`refactor/landing-stacking-spec`)**:
  - Aligned StackingCards scroll targets and card offsets with the Khoa Phan reference demo spec.
  - Updated the stacking engine to the exact scale and `topPosition` specification.

## [0.18.2] - 2026-08-02

### Performance Improvements
- **Landing Journey Performance (`perf/landing-stacking-cards`)**:
  - Optimized responsive sticky stacking offsets with a reduced-motion fallback.
  - Memoized `JourneyCard` and `CardVisualPreview` and enforced type-only imports.

## [0.18.1] - 2026-08-02

### Added
- **Journey Section Integration (`feature/landing-stacking-cards`)**:
  - Applied ZYR0 design system tokens and an enterprise visual redesign to the journey cards.
  - Integrated the JourneySection stacking cards into the main landing page flow.

## [0.18.0] - 2026-08-02

### Added
- **Landing Journey Stacking Cards Section (`feature/landing-stacking-cards`)**:
  - Authored the UX audit and integration plan (`docs/LANDING_STACKING_CARDS_PLAN.md`) replacing the static 4-step "How It Works" grid with a 6-phase journey (Discover → Apply → Select → Work on Real Projects → Receive Verified Certificate → Launch Your Career).
  - Added the ZYR0 6-phase journey content strategy and typed journey data model.
  - Built the JourneySection stacking cards component structure (`JourneySection.tsx`, `JourneyCard.tsx`).

## [0.17.5] - 2026-08-01

### Added
- **Landing Page V2 Ground-Up Reconstruction (`feature/landing-page-v2`)**:
  - **Phase 0: Audit**: Conducted an architecture audit documenting scroll listener overhead and GPU fill-rate degradation (`docs/LANDING_PAGE_V2_AUDIT.md`).
  - **Phase 1: Foundation**: Created a performant, pure-CSS `BackgroundLayer` component utilizing fixed viewport positioning (`z-0`) and single `parabolic-pentagon.svg` asset canvas.
  - **Phase 2: Content Architecture**: Restructured `Landing.tsx` and `PublicLayout.tsx` to ensure all content sections naturally float above the fixed SVG canvas in a `z-10` layer.
  - **Phase 3: Eliminate Opaque Blocks**: Removed all lingering solid background fills (`.hero-gradient`, layout container fills) to ensure the fixed background canvas remains visible continuously from header to footer.
  - **Phase 4: Dark Mode Optimization**: Refined dark mode typography contrast, subtle contrast overlays, and sharp glass card borders (`dark:border-white/15`, `dark:bg-slate-900/60`).
  - **Phase 5: Minimal Polish**: Applied subtle button hover scaling, micro-interactions, and uniform section spacing.
  - **Phase 6 & 7: Performance Measurement & Build Validation**: Achieved 0ms scroll JS overhead and 0 layout shifts. Validated `npm run build` with full static prerendering pipeline.
  - **Firefox Cross-Browser Rendering & Contrast Fix**: Resolved light-mode body background bleed in Firefox by adding a pinned `bg-slate-950` backdrop behind the SVG canvas. Standardized all landing section cards and typography to explicit high-contrast glass tokens (`text-white`, `text-slate-300`, `bg-slate-900/60`, `border-white/10`).

## [0.17.4] - 2026-08-01

### Added
- **Light Theme Background Optimization (`fix/light-theme-background-optimization`)**:
  - **Phase 1: Audit**: Conducted repository-wide visual audit of light theme contrast, SVG visibility, and surface transparency (`docs/LIGHT_THEME_AUDIT.md`).
  - **Phase 2: Light-Mode Gradient Overlay**: Integrated a `dark:hidden` gradient overlay (`rgba(255,255,255,0.70)`, soft slate `rgba(241,245,249,0.50)`, and subtle emerald `rgba(16,185,129,0.04)`) in `ParabolicPentagonBg.tsx` to elevate contrast in light mode while leaving dark mode completely untouched. Updated light mode SVG blend mode to `mix-blend-multiply` (`dark:mix-blend-screen`).
  - **Phase 3: Light-Mode Glass Surfaces**: Updated feature cards, role cards, credibility panels, testimonial boxes, community channel widgets, stats bar, and CTA banner to use light-theme glass surfaces (`bg-white/60 dark:bg-card/70 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-md`) without relying on solid white or dark fill blocks.
  - **Phase 4: Typography & Contrast Optimization**: Standardized navigation links, logo text, mobile menu toggles, section titles, and body copy in `PublicLayout.tsx` and `Landing.tsx` to enforce WCAG AA contrast in both light and dark themes without adding opaque backing containers.
  - **Phase 5: Verification & Build Validation**: Validated production build (`tsc -b && vite build`) and static prerendering pipeline. Verified visual balance, fixed SVG backdrop behavior, and translucency in both light and dark themes.

## [0.17.3] - 2026-08-01

### Added
- **Premium Landing Page Fixed Background (`feature/premium-landing-background`)**:
  - Integrated `parabolic-pentagon.svg` as a fixed, viewport-covering background layer behind all landing content (`ParabolicPentagonBg.tsx`).
  - Added full 50-950 color scale tokens for `text`, `background`, `primary`, `secondary`, and `accent` in `tailwind.config.js` and `src/index.css`.
  - Implemented a multi-tiered gradient overlay (radial ambient glow, secondary accent aura, and adaptive top/bottom vignettes) to ensure visual depth and 100% WCAG AA text contrast compliance in both light and dark modes.
  - Added GPU-accelerated scroll parallax translation (`translate3d`), respecting user `prefers-reduced-motion` settings.
  - Preserved cross-device responsiveness and verified 100% clean TypeScript build with zero errors.

## [0.17.2] - 2026-07-31

### Changed
- **Repository-Wide Unified Loading System Migration (`feature/unified-loading-system`)**:
  - Replaced legacy `lucide-react` `Loader2` spinners across all `mentor/` and `admin/` pages (`Dashboard`, `Companies`, `Certificates`, `Users`, `Logs`, `Analytics`, `Reports`, `Internships`, `Evaluations`, `Profile`, `Settings`, `Tasks`, `Interns`).
  - Standardized asynchronous UI states using `@/components/common/Loader` (`page`, `inline`, `button` variants) with consistent ZYR0 dot-matrix (`DotmSquare14`) glow styling.
  - Enhanced `LoaderProps` and `ButtonLoaderProps` interfaces to provide seamless backwards compatibility for `text`, `message`, `loading`, and `loadingText` props.
  - Verified 100% clean TypeScript build (`tsc --noEmit`) with zero errors across the entire codebase.

## [0.17.1] - 2026-07-31

### Fixed
- **Certificate PDF Footer Alignment (`fix/certificate-pdf-footer-alignment`)**:
  - Standardized the certificate PDF export and browser preview footer layouts using a deterministic, 3-column CSS Grid (`grid-cols-3` / `grid-template-columns: repeat(3, 1fr)`).
  - Eliminated layout drift, flexbox collapse, and absolute positioning discrepancies between browser preview, print preview, print dialogs, and exported PDF documents.
  - Symmetrically aligned metadata (Credential ID, Issue Date, Blockchain Hash) in the left column, QR code image and "Scan to Verify" label in the center column, and tamper-proof verification text with platform branding in the right column.

## [0.17.0] - 2026-07-31

### Added
- **Unified Dot Matrix Loading System (`feature/unified-loading-system`)**:
  - Integrated `@dotmatrix/dotm-square-14` Shadcn/ui component into ZYR0's design system.
  - Built centralized wrapper component `src/components/common/Loader.tsx` with multi-variant support (`page`, `container`, `inline`, `button`, `overlay`) and `grad-aurora` preset glow branding.
  - Standardized UI loading indicators across global application routes (`RouteLoading`, `ProtectedRoute`, `AuthCallback`), authentication flows, verification gates, form submissions (`TaskCreateEditModal`, `TaskReviewDrawer`), save buttons (`SaveButton`, `CompanyRatingWidget`), and student portals (`Applications`, `SavedInternships`).
  - Refactored `ui/spinner.tsx` to delegate to the new `Loader` wrapper for seamless backwards compatibility.

## [0.16.2] - 2026-07-28

### Added
- **Official LinkedIn URL & CTA Integration (`feature/social-cta-polish`)**:
  - Updated single source of truth `SITE_CONFIG` in `src/config/site.ts` with new official LinkedIn company profile: `https://linkedin.com/company/zyr0-co`.
  - Added `VITE_LINKEDIN_COMPANY_URL` to `.env` and `.env.example`.
  - Updated JSON-LD Organization schema in `generate-seo.js` and `Landing.tsx` for consistent search engine indexing.
  - Converted legacy "Coming Soon" LinkedIn placeholders into live interactive "Follow on LinkedIn" CTA cards across `Landing.tsx`, `CommunitySocialNav.tsx`, `PublicLayout.tsx` footer, and `Contact.tsx`.
  - Cleaned up legacy click-handler toasts to enforce clean semantic anchor navigation.

## [0.16.1] - 2026-07-28

### Fixed
- **Internship Deadline Cache Synchronization (`fix/internship-deadline-sync`)**:
  - Resolved cache invalidation defect where updates to internship application deadlines in Company and Admin portals failed to propagate to the public `/internships` page.
  - Refactored `updateInternship`, `createInternship`, and `closeInternship` in `src/services/internships.ts` to call `clearCache('internships')`.
  - Purged all public `getInternships` parameterized query cache keys (`internships::...`) upon internship updates, ensuring instant data synchronization across public, student, company, and admin portals.

## [0.16.0] - 2026-07-27

### Added
- **Company Task Management UX Redesign (`fix/Company-task-management-redesign`)**:
  - Modularized legacy 775-line `Tasks.tsx` monolith into modular, high-performance workspace components.
  - Created `TaskStatsHeader.tsx` for real-time KPI metrics with status tab quick-filtering.
  - Created `TaskFilterBar.tsx` supporting multi-criterion filtering, search, status tabs, priority, sorting, and view mode switching.
  - Created `TaskCardGrid.tsx` and `TaskTable.tsx` for responsive dual-view presentation.
  - Created `TaskCreateEditModal.tsx` supporting single and bulk task delegation to active interns with inline validation.
  - Implemented `TaskReviewDrawer.tsx` PR-style split-pane drawer for evaluating student task submissions using rubric-based scoring.

## [0.15.5] - 2026-07-27

### Added
- **Mobile Performance Audit Phase 1 (`performance/mobile-optimization`)**:
  - Conducted comprehensive performance audit across Landing, TextRotate, Motion layers, Canvas particles, and background filters on 4GB RAM Android baseline.
  - Documented baseline metrics (LCP: 4.2s, INP: 380ms, TBT: 540ms, FPS: 32-42 FPS).
  - Identified root causes: character-level spring animations in `TextRotate`, expensive `backdrop-filter` GPU layers on mobile, unthrottled pointer listeners, and un-memoized media queries.
  - Created detailed performance report in `docs/performance/MOBILE_AUDIT_REPORT.md`.

## [0.15.4] - 2026-07-27

### Fixed
- **Admin Dashboard & Analytics Cleanup (`fix/dashboard-dummy-metrics`)**:
  - Audited `pages/admin/Dashboard.tsx` and `pages/admin/Analytics.tsx`.
  - Removed static `userGrowthDataRaw` and `appDataRaw` fallback arrays from `AdminAnalytics.tsx`.
  - Purged hardcoded trend percentage indicators (`+3%`, `+8%`, `+12%`, etc.) from Admin KPI stat cards.
  - Implemented dynamic, database-backed monthly telemetry for user registrations and monthly application volumes over the last 6 months.
  - Removed `Math.sin(i.title.length)` pseudo-random star rating math and replaced hardcoded domain fallback percentages with clean empty states.
  - Updated `Email Service` status indicator in Admin Dashboard system health to Operational.

## [0.15.3] - 2026-07-27

### Fixed
- **Mentor Dashboard Cleanup (`fix/dashboard-dummy-metrics`)**:
  - Audited `MentorDashboard.tsx`, `MentorInterns.tsx`, and `MentorEvaluations.tsx`.
  - Verified zero placeholder metrics or mock counters exist in mentor components, ensuring all stats render dynamically from live backend tables.

## [0.15.2] - 2026-07-27

### Fixed
- **Company Dashboard Cleanup (`fix/dashboard-dummy-metrics`)**:
  - Audited `CompanyDashboard.tsx`, `CompanyAnalytics.tsx`, and `CompanyInterns.tsx`.
  - Removed artificial trend change strings (`+12%`, `+3%`, `+5%`, `+2`) and `up` comparison flags from `CompanyAnalytics.tsx`.
  - Cleaned up unused icon imports and ensured all company analytics display real database numbers.

## [0.15.1] - 2026-07-27

### Fixed
- **Student Dashboard Cleanup (`fix/dashboard-dummy-metrics`)**:
  - Removed hardcoded "Profile Views: 0" statistic card and replaced it with real dynamic "Certificates Earned" counter fetched from `getMyCertificates()`.
  - Stripped unused `change` / `changeType` demo properties from `studentStats` summary cards.
  - Eliminated arbitrary skill level percentage formula (`70 + (index * 7) % 25`) in `Progress.tsx` and updated UI to render verified skill badges with categories.
  - Replaced generic placeholder company logo fallback URLs with dynamic `ui-avatars` generator.

## [0.14.4] - 2026-07-26

### Added
- **Hero Section Premium Visual Language (`feature/hero-redesign`)**:
  - Integrated Google Font **Sora** into `index.html` and `tailwind.config.js` (`font-display`, `font-heading`) for an authoritative enterprise font pairing (Sora + Inter).
  - Enforced global Sora display font mapping for all `h1`, `h2`, `h3`, `h4` tags and `.font-heading` utility classes in `src/index.css` with `-0.035em` tracking.
  - Refined linear-gradient text fill and drop-shadow glow to `TextRotate` component using an **Emerald → Cyan → Indigo** palette (`from-emerald-300 via-cyan-300 to-indigo-300`).
  - Added layered radial ambient glows, soft blurred background nodes, and a subtle masked grid overlay for depth.
  - Refined floating preview cards with high-contrast glassmorphism, accent progress bars, and glowing status indicators.

## [0.14.1] - 2026-07-26

### Added
- **Hero Section Redesign Phases 2-4 (`feature/hero-redesign`)**:
  - Implemented oversized enterprise headline incorporating customized `TextRotate` component with career-focused rotating phrases.
  - Enhanced value proposition answering core platform identity, target audience, trust model, and next actions.
  - Added multi-tier CTA layout featuring primary "Explore Internships", secondary "For Companies", and live "WhatsApp Channel" action pills.
  - Integrated 4-column trust indicator grid highlighting student enrolment, employer ecosystem, certificate validity, and mentor rating metrics.

## [0.14.0] - 2026-07-26

### Added
- **Hero Section Redesign Phase 1 (`feature/hero-redesign`)**:
  - Audited current landing page hero architecture and reusable components.
  - Created customizable `TextRotate.tsx` component with spring physics, stagger delays, accessibility support, and prefers-reduced-motion fallbacks.

## [0.13.5] - 2026-07-26

### Added
- **Social CTA Polish Phase 5 (`feature/social-cta-polish`)**:
  - Unified footer social links and support channels across PublicLayout with official brand icons and WhatsApp Channel link.
  - Audited Contact page social cards with standardized brand SVG icons and direct channel links.

## [0.13.4] - 2026-07-26

### Added
- **Social CTA Polish Phase 4 (`feature/social-cta-polish`)**:
  - Designed and integrated a dedicated "Community / Stay Updated" section on the main landing page immediately following the hero section.
  - Featured live WhatsApp Channel card with instant alert pulse badge and coming-soon LinkedIn network card with toast fallback.

## [0.13.3] - 2026-07-26

### Added
- **Social CTA Polish Phase 3 (`feature/social-cta-polish`)**:
  - Improved header navigation spacing, responsiveness, and container alignment for community social CTAs.
  - Added subtle hover shadow effects, live status pill badges, active click scale micro-interactions, and accessibility titles.

## [0.13.2] - 2026-07-26

### Added
- **Social CTA Polish Phase 2 (`feature/social-cta-polish`)**:
  - Created brand icon system component `BrandIcons.tsx` with official high-resolution SVG assets for WhatsApp and LinkedIn.
  - Upgraded `CommunitySocialNav` with official brand icons, pixel-perfect sizing, and responsive styling.

## [0.13.1] - 2026-07-26

### Added
- **Social CTA Polish Phase 1 (`feature/social-cta-polish`)**:
  - Audited existing social CTA placements across header, mobile drawer, footer, and contact pages.
  - Updated `SITE_CONFIG` default fallback URL to official ZYR0 WhatsApp Channel: `https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F`.

## [0.13.0] - 2026-07-25

### Added
- **Header Navigation Enhancement Phases 3, 4 & 5 (`feature/header-social-cta`)**:
  - Implemented `CommunitySocialNav` component (`app/src/components/navigation/CommunitySocialNav.tsx`) with WhatsApp Channel CTA and LinkedIn "Coming Soon" placeholder.
  - Added social media configuration parameters in `app/src/config/site.ts`.
  - Connected `CommunitySocialNav` to desktop `#header-community-cta-slot` and mobile drawer `#mobile-community-cta-slot` in `PublicLayout.tsx`.
  - Conducted full responsive, accessibility, visual animation, and production build verification.

## [0.12.1] - 2026-07-25

### Changed
- **Header Navigation Enhancement Phase 2 (`feature/header-social-cta`)**:
  - Refactored `PublicLayout.tsx` header container layout to establish dedicated, flexible Community CTA slots (`#header-community-cta-slot` for desktop and `#mobile-community-cta-slot` for mobile drawer).
  - Maintained exact spacing, typography, alignment, and navigation behavior across all viewports.

## [0.12.0] - 2026-07-25

### Added
- **Header Navigation Enhancement Phase 1 (`feature/header-social-cta`)**:
  - Completed architectural audit of `PublicLayout.tsx` and `DashboardLayout.tsx` navigation structures.
  - Designed responsive layout strategy and component hierarchy for social CTA integration (WhatsApp Channel & LinkedIn placeholder).
- **Offer Letter System Modernization (`feature/offer-letter-modernization`)**:
  - Implemented high-fidelity `OfferLetterDocument` component with professional letterhead styling, official security seal, verification badge, and direct browser-native printing support (`window.print()`).
  - Added deterministic, offline canvas QR code generator (`renderSafeCanvasQr` in `@/lib/offerLetterPdf`) removing reliance on external QR APIs or network-restricted endpoints.
  - Integrated full document preview and summary tabs into both Company and Student offer letter modals (`OfferLetters.tsx`).
  - Upgraded ESLint configuration (`eslint.config.js`) to support React 19 and ES modules.

## [0.11.1] - 2026-07-22

### Fixed
- Included `email` in student profiles select fragments within `getApplicationsForInternship` and `getAllCompanyApplications` in `@/services/applications`.
- Added fallback profile lookup by `student.id` in `sendOfferLetterEmail` (`OfferLetters.tsx`) to guarantee email availability when generating and delivering offer letters.

## [0.11.0] - 2026-07-22

### Added
- **Company Internship Management Enhancement (`feature/company-internship-management`)**:
  - Implemented dedicated `EditInternshipModal` component allowing companies to update published and draft internships.
  - Added business rule validations: protected immutable system fields (`id`, `company_id`, `created_by`, `posted_date`, `created_at`, `applicant_count`, `view_count`), enforced location requirements based on work mode, and prevented reducing openings below the count of already accepted interns.
  - Added dirty-form detection and unsaved changes confirmation dialog to prevent accidental data loss.
  - Integrated cache invalidation in `@/services/internships` (`updateInternship`, `closeInternship`, `createInternship`) so updates reflect instantly across company dashboards, public internship detail pages, and filter options.

## [0.10.1] - 2026-07-22

### Fixed
- Consolidated duplicated HTML/text email template generation and Edge Function invocation into a shared `sendOfferLetterEmail()` utility function in the Company Offer Letters page (`OfferLetters.tsx`). Both `handleGenerate()` and `handleResend()` now use this single source of truth, preventing template drift and ensuring consistent email styling, attachments, and database status update handling.
- Extracted duplicated `blobToBase64` helper from inline declarations inside `handleGenerate()` and `handleResend()` in the Company Offer Letters page to a single module-scoped utility function, eliminating code duplication and reducing maintenance risk.

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
