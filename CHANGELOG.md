# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Dynamic Company Workspace Switcher (`app/src/App.tsx`, `app/src/layouts/PublicLayout.tsx`, `app/src/layouts/DashboardLayout.tsx`)**:
  - Globalized `CompanyAccessProvider` across the application router to enable seamless, zero-cost access checking for dual-role users (e.g. Students holding accepted Company Team Memberships).
  - Implemented dynamic **"Switch to Company Workspace"** button in `PublicLayout` and `DashboardLayout` profile dropdowns & mobile navigation drawers when an accepted company membership is detected.
  - Added reciprocal **"Switch to Student Workspace"** menu option when an authorized student team member is navigating within the Company Portal.

### Fixed
- **Company Portal Sidebar Navigation Gating (`app/src/layouts/DashboardLayout.tsx`, `app/src/contexts/CompanyAccessContext.tsx`, `app/src/services/companyTeam.ts`)**:
  - Resolved bug where `useCompanyNavItems` filtered all sidebar navigation links to empty during `access.loading` or when team membership role resolution was unresolved.
  - Added navigation fallback to show full static navigation items if filtering yields empty results or while access resolution is in progress.
  - Updated `canAccessTab` in `CompanyAccessContext` to default to allowing tab access while loading or when member roles are unresolved to prevent false lockouts.
  - Added cache normalizer in `getMyCompanyMembership` to auto-migrate legacy `{ data: company, error }` cache entries into `{ company, member, data, error }`.

## [0.37.5] - 2026-08-13

### Fixed
- **Workspace Switcher Missing on Mobile Dashboard (`app/src/layouts/DashboardLayout.tsx`)**:
  - The "Switch to Company/Student Workspace" entries only lived in the header avatar dropdown, which mobile users rarely open — the mobile sidebar drawer (hamburger menu) offered no way to switch workspaces even for accepted team members.
  - Added mobile-only (`lg:hidden`) **"Switch to {Company} Workspace"** and reciprocal **"Switch to {Role} Workspace"** entries to the sidebar footer, visible in the mobile drawer, which close the drawer on navigation.

## [0.37.4] - 2026-08-13

### Fixed
- **Membership Re-Resolved When Tab Regains Focus (`app/src/contexts/CompanyAccessContext.tsx`)**:
  - The `CompanyAccessProvider` previously loaded membership exactly once per signed-in user, so role edits or removals made by an owner were invisible to the member until a full page reload (cached `my_company` entries also masked them for up to 300s).
  - The provider now subscribes to `visibilitychange` and re-resolves membership (cache-bypassing) whenever the tab becomes visible again — sidebar tabs and route guards reflect the latest role/removal state on return to the tab.

## [0.37.3] - 2026-08-13

### Fixed
- **Multi-Company Membership No Longer Breaks Access Resolution (`app/src/services/companyTeam.ts`)**:
  - `getMyCompanyMembership` queried `company_team_members` with `.maybeSingle()`, so a user accepted into more than one company hit a PostgREST "multiple rows" error that resolved to `company: null` — locking the member out of every company workspace.
  - The member query now orders by `accepted_at` and applies `.limit(1)` before `.maybeSingle()`, deterministically resolving to the earliest accepted membership (single active workspace per the switcher).

## [0.37.2] - 2026-08-13

### Security
- **Company Team Rows No Longer Publicly Readable (`supabase/migrations/040_company_team_member_read_rls.sql`)**:
  - Removed the legacy `Team: company members read` policy (`USING (true)` from migration 011) which let every authenticated user read all companies' `company_team_members` rows — including other companies' pending invites, member emails, and `invite_token`s.
  - Added `Team: members read own row` (`auth.uid() = user_id`) so membership resolution still works, and `Team: public read accepted` (`status = 'accepted'`) so the public CompanyDetail team section keeps listing active members while pending invite credentials stay hidden. Owners / admin-role members / platform admins keep full team access through the existing `Team: owner or admin manage` FOR ALL policy.

## [0.37.1] - 2026-08-13

### Fixed
- **Company Access Refreshed After Invite Acceptance (`app/src/pages/public/AcceptInvite.tsx`)**:
  - `/accept-invite` now calls the `CompanyAccessProvider`'s `refresh()` immediately after a successful acceptance, so the cached `company: null` membership is replaced with the real accepted membership before the user clicks "Go to Company Dashboard". Previously the stale provider state bounced already-logged-in invitees back to their own dashboard (or hid the workspace switch button) until a full page reload.

## [0.37.0] - 2026-08-12

### Added
- **Company Team Management, Invites & Role-Based Portal Access (`supabase/migrations/039_company_team_roles_rls.sql`, `app/src/services/companyTeam.ts`, `app/src/pages/company/Team.tsx`, `app/src/pages/public/AcceptInvite.tsx`, `app/src/contexts/CompanyAccessContext.tsx`, `app/src/components/CompanyAccessRoute.tsx`, `app/src/components/TabGate.tsx`)**:
  - **Team Roles & Invite Flow**: company owners invite members by email with a role (`admin` / `hr` / `mentor` / `reviewer`); each invite carries a token and links to the recipient's account on acceptance. The Team page supports role editing, resend-invite, status badges (Invited/Active), confirm-before-remove, duplicate-email guards, and error toasts.
  - **`/accept-invite` Page**: token-based acceptance with login redirection for signed-out users (works for brand-new accounts and existing student/mentor accounts alike — the token, not the email, is the credential).
  - **Role-Scoped RLS**: internships, certificates, and offer letters are scoped to owner + admin/hr; applications to owner + admin/hr/reviewer; tasks/submissions to admin/mentor/reviewer; team management to owner + admin; company reads to owners and accepted members; messaging extended to accepted admin/hr/mentor members. New helpers: `is_company_member`, `is_company_member_with_role`, `accept_company_invite`.
  - **Portal Access Gate**: `CompanyAccessRoute` admits owners **and** accepted team members (any profile role) into `/company/*`; `CompanyAccessProvider` + `useCompanyAccess` resolve company + member role once (cached under the `my_company` key family); `getMyCompany` delegates to the membership resolver so every company page works for members.
  - **Tab Permission Matrix**: `DashboardLayout` filters the company nav by the role matrix (`useCompanyNavItems`), sidebar counts resolve via membership, and `CompanyPortal` wraps every route in `TabGate` (hard redirect) — roles can see exactly their tabs, no more, no less.
  - **send-email Edge Function**: authenticated accepted company team members may now send workflow emails (e.g. invitations).

### Changed
- **Login Redirect Preservation (`app/src/pages/auth/Login.tsx`)**: the Register link and Google/LinkedIn OAuth buttons now forward the `?redirect=` param, so invited users return to `/accept-invite` (and complete acceptance) after signing up or signing in via any method.

### Deployment Notes
- Apply `supabase/migrations/039_company_team_roles_rls.sql` and re-deploy the `send-email` Edge Function.

## [0.36.4] - 2026-08-12

### Added
- **Real Sidebar Badges (`app/src/hooks/useSidebarCounts.ts`, `app/src/services/applications.ts`, `app/src/services/tasks.ts`, `app/src/layouts/DashboardLayout.tsx`)**:
  - **Live Count Services**: `getMyActiveApplicationsCount` / `getCompanyActiveApplicationsCount` (status in Applied, Under Review, Shortlisted), `getMyPendingTasksCount` (status Pending), `getTasksToReviewCount` (status in Submitted, Under Review) — lightweight `head: true` count queries reusing the existing cache + dedup pattern.
  - **`useSidebarCounts` Hook**: per-role fetching (student: applications + tasks + messages; company: applications + messages; mentor: tasks + messages), refresh on every route change, and Supabase realtime `postgres_changes` subscriptions (RLS-scoped) that refetch on any insert/update.

### Changed
- **Sidebar Badges Now Show Real Data (`app/src/layouts/DashboardLayout.tsx`)**: removed the hardcoded placeholder counts (`Applications 4`, `Tasks 3`, `Messages 3`, company `Applications 12`, mentor `Tasks 3`) from `navConfig`; nav items now reference a `badgeKey` resolved from the live counts hook. Badges hide when the count is zero and respect the restricted-item lock state.

## [0.36.3] - 2026-08-12

### Added
- **Student Dashboard Journey Tour (`app/src/components/onboarding/tour/tours/studentJourney.ts`, `app/src/components/onboarding/tour/TourStep.ts`, `app/src/layouts/DashboardLayout.tsx`)**:
  - **Journey-Based First-Run Tour**: new 7-step `student-journey` tour that teaches the internship flow — dashboard → internships → applications → workspace → tasks → progress → certificates — by spotlighting the matching sidebar nav item instead of explaining every section; previously onboarded students (`student-workspace` recorded) are not re-annoyed.
  - **Closing Summary Card**: non-spotlight "There's more to explore" card listing Saved, Messages, Offer Letters, Portfolio, and Profile with one-liners (via a new `summary` field on `TourDefinition`).
  - **Sidebar Nav Anchors**: `data-tour` targets (`nav-*`) added to the seven student nav links through a `tourTarget` nav config field; the tour now runs in place on any dashboard page with no forced navigation.
  - **Welcome Modal Redesign (`app/src/components/onboarding/LoginWelcomeModal.tsx`)**: minimal journey-first student welcome ("Welcome to your ZYR0 workspace.") with a subtle Explore → Apply → Build → Complete strip and two CTAs — "Show me around" (starts the tour in place) and "Skip for now".

### Changed
- **Tour Popover & Spotlight Visuals (`app/src/components/onboarding/tour/TourSpotlight.tsx`)**:
  - Replaced the pulsing glow ring and glowing blue halo with a restrained static accent ring plus faint halo.
  - Lightened the dim overlay (`bg-black/35`, no backdrop blur) for a subtle focus effect.
  - Compacted the step card: step icon beside the title, optional chip note under the body, smaller progress dots, pointer notch pointing at the highlighted target, refined spacing, and subtle one-shot motion (single rise + fade, no looping animations).
  - Mobile bottom-sheet presentation preserved with safe-area padding and touch-friendly buttons.

## [0.36.2] - 2026-08-11

### Added
- **Student Workspace Guided Tour (`app/src/components/onboarding/tour/`, `app/src/layouts/DashboardLayout.tsx`)**:
  - **Custom Spotlight Tour Engine**: Lightweight zero-dependency tour engine with a `TourProvider` state machine (start/next/back/skip/finish) and a `TourSpotlight` overlay that dims the page, renders a pulsing accent ring around the target, and shows a numbered step card with progress dots, Back/Skip/Next/Finish controls.
  - **Step-by-Step Task Submission Walkthrough (`tours/studentWorkspace.ts`, `app/src/pages/student/Workspace.tsx`)**: 8-step guided flow that walks students through submitting a task — active internship context → auto-switches to the Tasks & Submission tab → pick an assigned task → read the brief/objectives/criteria → paste GitHub URL → optional live demo URL → submission notes → Submit Solution.
  - **`activateTab` Step Support (`TourStep.ts`, `TourSpotlight.tsx`)**: steps can auto-click the matching workspace tab before being shown, so form steps always have a visible target.
  - **Entry Points**: "Start Guided Tour" button on the post-login welcome modal (`LoginWelcomeModal.tsx`) and a Compass replay button in the dashboard header.
  - **First-Run Auto-Start**: the tour launches automatically once for first-time students with a completed profile; completion is persisted to `profiles.onboarding_tours` (`supabase/migrations/038_onboarding_tours.sql`, `updateMyProfile`).
  - **Tour Anchors**: `data-tour` attributes on sidebar nav, theme toggle, notifications bell, and workspace panels (internship header, tabs, task cards, detail panel, form fields, submit button).

### Changed
- **Spotlight Visibility**: darkened the tour overlay with a backdrop blur and thickened the target ring with a pulsing glow for maximum popup visibility.

## [0.36.1] - 2026-08-11

### Added
- **Real Student Review Images (`app/public/reviews/`)**: Added cropped portrait images for the landing testimonials (Akbar, Atta, Jawad, Bibi Tabassum, Saba) to give the section authentic, human faces.

### Changed
- **Landing Testimonials Redesign — V3 (`app/src/pages/public/Landing.tsx`, `app/src/components/landing/`)**:
  - Replaced the placeholder review cards with a full-width featured company card plus a 3-card student/mentor row layout.
  - Wrapped testimonials in animated blob cards for a softer, more premium visual treatment.
  - Added Saba Iftikhar (AI/ML Engineer & Mentor) review and Bibi Tabassum intern card; renamed Michael to AI/ML Engineer & Mentor.
  - Professionalized testimonial quotes for clarity and impact.
  - Removed the duplicate hero paragraph from conflict resolution.

### Fixed
- **Reviewer Name Correction (`app/src/pages/public/Landing.tsx`)**: Corrected the student reviewer name from "Atta" to "Attaullah" in the testimonials data.

## [0.36.0] - 2026-08-09

### Changed
- **Shifted Offer Letter Email Delivery to Verified Platform Links (`OfferLetters.tsx`)**:
  - Removed base64 PDF attachment payload from `send-email` Edge Function call to eliminate deliverability issues and reduce email size.
  - Redesigned email template with clear step-by-step guidance directing candidates to retrieve their official offer letters via the Student Dashboard (`/student/offer-letters`) or Public Verification Portal (`/verify?type=offer&id=...`).
  - Preserved on-demand PDF rendering and Supabase Storage persistence for student/company portal downloads.

### Fixed
- **Canonical Production Domain Hardcoding in Email Templates (`OfferLetters.tsx`, `TeamApplications.tsx`)**:
  - Explicitly hardcoded `const siteUrl = 'https://zyroo.org';` for all transactional email template links.
  - Guarantees 100% predictable URL output (`https://zyroo.org/verify?...`, `https://zyroo.org/student/offer-letters`, `https://zyroo.org/careers`) regardless of execution environment or local dev port.
  - Prevents security filters and email clients from masking or redacting `localhost` links.

## [0.35.3] - 2026-08-09

### Added
- **Offer Letter Design Token Alignment & PDF Preview Sandbox (`offerLetterConfig.ts`, `offerLetterPdf.ts`, `OfferLetterDocument.tsx`, `OfferLetters.tsx`)**:
  - **Single Source of Truth (`offerLetterConfig.ts`)**: Extracted all design system tokens (classical palette, fonts, page dimensions, and standard terms) shared by the React DOM preview and HTML5 Canvas PDF generator.
  - **Canvas Distortion Fix (`offerLetterPdf.ts`)**: Fixed canvas scaling logic to eliminate layout clipping and unneeded coordinate doubling on exported single-page A4 PDFs.
  - **CORS-Safe Canvas Rendering**: Fixed image loading fallbacks so cross-origin image errors fail gracefully to initial avatars without tainting the canvas context.
  - **"Preview Canvas PDF" Debug Utility**: Integrated instant PDF canvas preview buttons into the Company portal offer modal and document view, enabling immediate visual validation of attached PDF files before emailing.

### Docs
- **Changelog release entries for the offer-letter print & PDF work**: recorded entries `0.34.3` through `0.35.2` per `docs/GIT_WORKFLOW.md` (one entry per commit) and bumped the version to `0.35.3`.

## [0.35.2] - 2026-08-09

### Changed
- **Removed the unused `onPrint` prop from `OfferLetterDocument.tsx`**: no caller ever passed it; the print toolbar now always falls back to `window.print()`.

## [0.35.1] - 2026-08-09

### Fixed
- **Resend Email now gives real-time feedback (`OfferLetters.tsx`)**:
  - The row and modal "Resend Email" buttons show a spinner and disable while the PDF is regenerated and the email is being sent, so it is immediately clear the click registered.
  - Re-clicking during a send is blocked, preventing duplicate emails to the student.
  - Success/failure is now also rendered inline inside the preview modal, so the result is visible without closing it (previously the page-level banner was hidden behind the modal overlay).

## [0.35.0] - 2026-08-09

### Changed
- **Offer letter emails now attach a real A4 PDF (`offerLetterPdf.ts`, `offerLetters.ts`, company/student dashboards)**:
  - The canvas renderer was upscaled 2× (800×1131 → 1600×2262, ~192 DPI print) and the output is now wrapped into a genuine single-page A4 PDF via `jspdf`, so the emailed "Offer Letter.pdf" prints crisply instead of the previous ~96 DPI PNG.
  - Storage uploads, download filenames, and the "Download PDF" button now use `.pdf` with `application/pdf`; legacy `.png` URLs remain readable.
  - Added the `jspdf` dependency (code-split into the lazy offer-letters route chunk only).

## [0.34.5] - 2026-08-09

### Fixed
- **Offer letter prints on a single A4 page (`index.css` print rules)**: the offer-letter sheet is compressed so the full document — letterhead through signature — lands on one A4 page when printed or saved as PDF.

## [0.34.4] - 2026-08-09

### Fixed
- **Offer letter letterhead restored in print**: the document's own header was being hidden by the print isolation rules; `header:not(.offer-letter-header)` now keeps the letterhead visible, and the public verify page gained a print action.

## [0.34.3] - 2026-08-09

### Fixed
- **Signatory name shown once on the signature line**: the offer letter (canvas PDF and HTML document) previously rendered the signatory's name twice; it now appears a single time on the signature line.

## [0.34.2] - 2026-08-08

### Fixed
- **Post-Authentication Dashboard Navigation & Role Redirection (`Register.tsx`, `Login.tsx`, `ProtectedRoute.tsx`, `PublicLayout.tsx`)**:
  - Fixed post-registration completion action target in `Register.tsx` to dynamically route users to their respective role dashboard (`/{role}/dashboard`) instead of defaulting to the landing page (`/`).
  - Added immediate post-login role-based navigation in `Login.tsx` to prevent authentication state lag.
  - Enhanced `PublicOnlyRoute` and `PublicLayout` navigation controls to utilize `user.user_metadata.role` as a fallback when profile fetching is pending, ensuring accurate dashboard links for all user roles.

## [0.34.1] - 2026-08-08

### Added
- **Authenticated Dashboard Light/Dark Theme Toggle (`ThemeToggle.tsx`, `DashboardLayout.tsx`)**:
  - Extracted modular `ThemeToggle` component supporting reactive system/stored theme state with `next-themes` and smooth icon state transitions (`Sun` / `Moon`).
  - Added persistent theme switcher to the `DashboardLayout` top header, enabling effortless light/dark mode toggling across Student, Company, Mentor, and Admin portals.

## [0.34.0] - 2026-08-08

### Added
- **Communication & Navigation Minor Release Baseline**: Consolidated transactional email reliability, student profile fetch-on-open administrative modal, session-gated student onboarding welcome workflow, and global route scroll restoration.

## [0.33.5] - 2026-08-08

### Added
- **Global Route Transition Scroll Restoration (`ScrollToTop.tsx`)**: Implemented a global `ScrollToTop` navigation handler using `react-router-dom`'s `useLocation()` hook. Automatically resets viewport scroll coordinates to `(0,0)` on route changes while preserving deep anchor hash links (`#id`).

## [0.33.4] - 2026-08-08

### Fixed
- **Admin & Company Applicant Detail Profile Data Fetching (`ApplicationDetailDialog.tsx`)**: Implemented explicit fetch-on-open logic to retrieve complete student profile records directly from `public.profiles` upon opening the detail dialog, resolving missing attributes (Phone, Degree, Major, Graduation Year, Location, Role Interest, GitHub, LinkedIn).

## [0.33.3] - 2026-08-08

### Fixed
- **Offer Letter & Candidate Shortlist Email CTAs & Expiration Messaging (`OfferLetters.tsx`, `TeamApplications.tsx`)**:
  - Refactored CTA buttons to use robust, nested `<table>` HTML layouts and centralized `SITE_CONFIG` URL resolution to ensure full actionability across all major mail clients (Gmail, Outlook).
  - Added explicit expiration warning blocks to offer letters, directing candidates to their personalized student dashboards before deadline expiry.

## [0.33.2] - 2026-08-08

### Added
- **Student Welcome Modal & Profile Completion Enforcement (`DashboardLayout.tsx`, `ProfileCompletionModal.tsx`)**:
  - Implemented a humanized, professional post-login welcome modal clarifying one-time profile setup for multi-internship one-click applications.
  - Gated modal dismissal per session (`login_welcome_dismissed_session`) for smooth onboarding UX.

## [0.33.1] - 2026-08-08

### Added
- **AI-aware crawlability layer (`robots.txt` v2, `llms.txt`, IndexNow)**: `robots.txt` blocks AI training crawlers while allowing retrieval bots. Added `sitemap.xml` dynamic generation from Supabase, spec-compliant `llms.txt`, and IndexNow integration.

### Changed
- **Bulletproof site URL resolution & fetch-based PostgREST prerender (`generate-seo.js`)**: Validates `VITE_SITE_URL` against trusted domain hosts and falls back to production URL.
- **Platform stats canonicalization across site**: `StatsBand.tsx` canonical metrics applied consistently (500+ Placements, 50+ Partners, Rs 150K+ Stipends, 4.9★ Rating).
- **Contact page office location updated (`Contact.tsx`)**: Address updated to Islamabad, Pakistan.


## [0.33.0] - 2026-08-07

### Added
- **Database Schema Migration for Student Profiles (`037_extend_student_profile_fields.sql`)**:
  - Added dedicated database columns (`phone`, `degree`, `major`, `academic_year`, `location`, `linkedin`, `github`, `role_interest`) to `public.profiles`.

### Changed
- **Persistent Student Profile Editing (`Profile.tsx`)**:
  - Implemented auto-save draft persistence using `localStorage` so unsaved form edits are recovered if students switch tabs or navigate away before saving.
  - Added mandatory field highlighting (`*` red indicators and border callouts) for key required profile fields.
  - Refactored form population (`getServerFormData`) to prioritize structured DB columns with automatic fallback to `user_metadata`.
- **Comprehensive Applicant Profile Review (`ApplicationDetailDialog.tsx`)**:
  - Surface applicant student attributes (Phone, Degree/Program, Major/Specialization, Academic Status, Graduation Year, Location, Role Interest, GitHub, LinkedIn, Portfolio, and Resume) across Admin and Company application review dialogs.

### Changed
- **Modernized platform email templates across all modules**:
  - **Emoji-Free Enterprise Aesthetics**: Removed all decorative emojis from buttons, headers, alert boxes, and action links across all transactional and administrative email templates for a clean, formal visual presentation.
  - **Offer Letters (`OfferLetters.tsx`)**: Upgraded to ZYR0 brand design tokens (`#f8fafc` slate background, `#1e3a8a` navy header with gold accent border, `#ffffff` card container), added structured Offer Details card, prominent Emerald action CTA, 4-button quick action grid (Verify Credential, WhatsApp Channel for latest updates, Career Hub, Contact Support), and warm, encouraging candidate-centric copy.
  - **Certificate Issued (`issue-certificate/index.ts`)**: Applied standardized header, card container, primary action button, and structured quick action links.
  - **Contact Notifications (`send-email/index.ts`)**: Styled administrative header, metadata-rich details card, and direct response action button.
  - **Candidate Shortlist (`TeamApplications.tsx`)**: Applied founding team branding, role highlight card, and unified quick-action button bar.

## [0.32.1] - 2026-08-07

### Added
- **Post-login welcome popup for students**: after signing in, students with an incomplete profile now land directly on the dashboard with a professional welcome modal. It offers two clear actions based on role — students get "Apply for an Internship" (`/student/internships`) plus "Complete Your Profile" (`/student/profile`, noted as taking less than 2 minutes), with role-aware copy for company/mentor/admin users. The popup is gated per session (`login_welcome_dismissed_session`) so it shows once per login, and is sized to not overlap the existing profile-completion modal.

## [0.32.0] - 2026-08-07

### Fixed
- **Light/dark mode toggle now visible on mobile**: the theme toggle in the public navbar was only rendered on `md+` screens (inside the desktop controls wrapper). It now renders in the header on all breakpoints, so mobile users can switch themes without resizing to desktop mode.
- **Clear "Get Started" on mobile**: the hamburger menu's auth row is now role-aware — logged-out visitors get a prominent "Get Started" accent CTA alongside "Log in", and logged-in users get a "Go to Dashboard" action instead of sign-in links.
## [0.31.5] - 2026-08-07

### Changed
- **License changed to proprietary (§ All Rights Reserved)**: the project is no longer open-source. `LICENSE` now contains a ZYR0 proprietary license (copyright © 2026 ZYR0 Contributors). README badge, project tree, and License section updated, and `app/package.json` declares `"license": "UNLICENSED"`.

## [0.31.4] - 2026-08-07

### Fixed
- **Certificate email error reporting under strict type-checking**: the `issue-certificate` edge function's catch blocks accessed `.message` on an `unknown` caught value, which failed `deno check` with three `TS18046` errors. Error text now narrows with `instanceof Error` before reading `.message`.

## [0.31.3] - 2026-08-07

### Changed
- **Professional explore/stay-connected link footer on all candidate-facing emails**: the founding team shortlist email, company offer-letter email, and both certificate emails now close with a `Explore ZYR0` link row (Website, Browse Internships, For Companies, Contact, Help Center) and a `Stay Connected` row (LinkedIn, WhatsApp Community, WhatsApp Channel). Plain-text fallbacks include the full URL set too. The shortlist email's inline community link now points to the ZYR0 WhatsApp Community.

## [0.31.2] - 2026-08-07

### Fixed
- **Founding team shortlist email CTAs are reliably clickable**: the "Explore ZYR0 Careers" and "Contact Support" buttons no longer place their styling on a wrapper `<td>`; the full click surface, background, and border now sit on the `<a>` itself (bulletproof email-button pattern), so the links open `zyroo.org/careers` and `zyroo.org/contact` directly in strict clients like Outlook desktop.

### Added
- **LinkedIn follow link in the founding team shortlist email**: a new "Follow ZYR0 on LinkedIn" button in the email footer links to the ZYR0 LinkedIn company page, and the plain-text fallback now includes the LinkedIn URL as well.

## [0.31.1] - 2026-08-07

### Changed
- **Company applications moved to `/company/applications`**: the company review page was renamed from `/company/applicants` to `/company/applications` (matching the admin `applications` naming). Sidebar entry, company dashboard "View All" link, and the profile-completion restricted-routes map were updated; the old `Applicants` page was removed.

## [0.31.0] - 2026-08-07

### Added
- **Company applications page with full applicant details**: the company applicants page becomes a full applications panel — status tabs, search (name/email/university/position/skills), a **View** button opening the student-application detail dialog, a per-row status dropdown alongside the existing shortlist/accept/reject quick actions, and richer joined applicant data (graduation year, bio, skills, portfolio, resume) from `getAllCompanyApplications`.

## [0.30.5] - 2026-08-07

### Added
- **Admin applications panel now reviews applicants like team applications**: `/admin/applications` gains status tabs, search across name/email/university/internship/company/skills, a one-click **View** button that opens the student-application detail dialog, and a per-row status dropdown (all six statuses). Admin data is served by a new `getAllAdminApplications` service call that joins the applicant's full profile.

## [0.30.4] - 2026-08-07

### Added
- **Shared student-application detail dialog**: new reusable `ApplicationDetailDialog` component and shared `APPLICATION_STATUSES` constants, used by both the admin and company internship-application panels. The dialog shows the applicant's profile (avatar, name, email, university, graduation year, bio, skills, portfolio/resume links), the internship they applied to, their status, and any cover letter or application answers when present.

## [0.30.3] - 2026-08-07

### Changed
- **Bulk shortlist emails are sent with bounded concurrency and progress feedback**: a large selection previously sent each email strictly one-at-a-time with the whole UI blocked on a silent loop. Sends now run 3 at a time with a live "Sending… X of Y done" banner, while still reporting per-candidate failures when the batch completes.

## [0.30.2] - 2026-08-07

### Changed
- **Bulk shortlist email now asks for confirmation**: clicking "Email Selected" opens a confirmation dialog showing how many candidates will be emailed (with a name preview) and that their status will become "Shortlisted", so a single click can no longer fire emails to every selected candidate by accident.
- **Row selection resets when switching status tabs**: selections made in one tab no longer linger invisibly after switching to another.

## [0.30.1] - 2026-08-07

### Fixed
- **Team applications CSV export no longer breaks on multiline answers**: free-text fields (`projects`, `motivation`) containing line breaks were written into the CSV verbatim, splitting the exported rows apart in Excel. Line breaks inside fields are now collapsed to spaces and a UTF-8 BOM is prepended so Excel decodes special characters correctly.

## [0.30.0] - 2026-08-07

### Fixed
- **Shortlist emails are no longer vulnerable to HTML injection from applicant data**: the admin shortlist email template interpolated `full_name` and `preferred_role` directly into the email HTML. Both fields come from the public application form, so a candidate could embed markup/link injection into the emails the admin sends to every selected candidate. Applicant-controlled values are now HTML-escaped before interpolation (the plain-text version uses the raw values).

## [0.29.5] - 2026-08-07

### Fixed
- **Shortlist emails now record the provider message ID under SMTP too**: the `send-email` edge function returned `messageId` for SMTP deliveries but `id` for Resend, so the admin team-applications panel (which reads `id`) stored no traceable message ID — and showed no "Sent IDs" in failure banners — whenever SMTP was the active provider. Both backends now respond with a consistent `{ success, id, provider }` shape, so `email_message_id` is persisted for every send regardless of provider.

## [0.29.4] - 2026-08-07

### Fixed
- **Internal email sends are now gated on the caller's account, not a client-exposed token**: the `EMAIL_INTERNAL_TOKEN` secret was shipped to the browser as `VITE_EMAIL_INTERNAL_TOKEN`, so anyone could extract it from the public JS bundle and relay emails to arbitrary recipients through `send-email`. Internal sends now require a valid session JWT whose profile role is `admin` or `company` (admin shortlist emails, company offer letters), with the shared token kept only for server-to-server callers (`issue-certificate`). The Vite env var and its Vercel export are removed; the function secret stays.

## [0.29.3] - 2026-08-06

### Changed
- **Careers — Open Roles is now a compact preview**: the section shows the first 2 roles under the "All roles" filter with a centered "Show all 11 roles" / "Show less" toggle (chevron rotates); changing the department filter resets the preview.

## [0.29.2] - 2026-08-06

### Changed
- **Certificate of completion emails humanized**: both the real and fallback templates now use professional formal copy with a single "View Verified Certificate" CTA and a gold-outlined "Contact Support" secondary button linking to the support page; plain-text versions match.

## [0.29.1] - 2026-08-06

### Added
- **ZYR0 team WhatsApp group invite**: `SITE_CONFIG.social.whatsappTeamGroup` (env `VITE_WHATSAPP_TEAM_GROUP_URL`, fallback `https://chat.whatsapp.com/DeVmUUkldtqLR0ho5x95MX`); the shortlist email now invites shortlisted candidates to the team's WhatsApp group alongside the careers CTA and support button.

## [0.29.0] - 2026-08-06

### Changed
- **Contact Support is a real secondary button**: in transactional emails, the support link is now a gold-outlined button (navy text) linking to the support page (`/contact`) instead of a plain text link — still secondary to the single primary CTA.

## [0.28.5] - 2026-08-06

### Changed
- **Offer-letter email rewritten to a professional tone**: single CTA "Review & Respond to Offer" linking to `/student/offer-letters`, an expiry reminder derived from the offer's `expiresAt` date, a support link, and a matching plain-text version.

## [0.28.4] - 2026-08-06

### Fixed
- **Offer letter PDF shows the work arrangement once**: values that already included the type (e.g. `Remote (Remote)`) were double-labeled — the arrangement is now de-duplicated (`Remote (Remote)` → `Remote`).

## [0.28.3] - 2026-08-06

### Fixed
- **Offer letter PDF footer never clips on wide URLs**: the footer is split into three clean lines with its own reserved band (`FOOTER_H = 54`), so the full offer ID, QR prompt, and page number always render inside the page; the signature rule is clamped above the footer band.

## [0.28.2] - 2026-08-06

### Fixed
- **Offer letter QR enlarged for reliable scanning**: the scannable QR code was bumped from 60px to 76px inside a taller gold box, matching the certificate's scannability.

## [0.28.1] - 2026-08-06

### Fixed
- **Offer letter PDF text flow is now measured**: `wrapText` returns the consumed height and the layout measures every wrapped line, so the opening paragraph and terms never overlap the gold card or the signature; when content exceeds the page, a content budget trims trailing responsibilities/terms instead of overlapping them.

## [0.28.0] - 2026-08-06

### Added
- **Offer letters now carry a human-readable offer code** (`ZYRO-OF-<year>-<random6>`, e.g. `ZYRO-OF-2026-436784`) mirroring the certificate `credential_id` pattern. New codes are generated on insert with a retry loop against unique collisions; existing offers were backfilled in place (`036_offer_codes.sql`). The code appears on the document's meta box, the canvas PDF, the company/student/admin detail views, and the offer email — and it is exactly what `/verify` accepts.
- **Offer verification accepts the offer code or the full ID**: `getOfferLetterById` resolves UUIDs directly and human-readable codes case-insensitively (`ilike` on `offer_code`), so the printed code always verifies. The `/verify` offer tab placeholder now says "Enter Offer Code (e.g., ZYRO-OF-2026-123456) or Offer ID".

### Changed
- **Printed offer documents are now fully verifiable**: the HTML document and canvas PDF footer print the complete offer UUID (previously truncated to 8–16 characters, which could never match a lookup), and the meta row was widened to fit the code on one line.
- **Offer email includes the code**: the `sendOfferLetterEmail` detail box and text version now show `Offer Code` plus a direct `zyroo.org/verify?type=offer&id=…` link.
- **Admin offer list**: search now also matches `offer_code`, the list shows the code in place of the truncated ID, and the detail panel adds an "Offer Code" row.

### Fixed
- **Offer letter QR/verify links can never fail again**: previously documents truncated the offer UUID for display while verification looked up the full UUID, so IDs shown on printed documents were unverifiable by design. Display and lookup are now unified through `offer_code` with the full ID retained for internal use and QR payloads.

## [0.27.0] - 2026-08-05

### Added
- **Contact form now really sends email**: the `/contact` page submits through the `send-email` edge function (`kind: 'contact'`) and delivers to `support@`/`info@`/`partnerships@`/`careers@zyroo.org` (team mailbox) with the submitter's address as reply-to. Spam protection: hidden honeypot field (bots silently dropped), per-email/per-IP rate limits (3 per 10 min per email, 5 per 10 min per IP), and length caps. Submissions are stored in the new `contact_messages` table (via service role) for the admin inbox.
- **Admin Inbox page (`/admin/inbox`)**: lists contact submissions with search, status tabs (new/read/replied), a detail dialog with a `mailto:` reply button, and mark-read (on open) / mark-replied actions.
- **Internal email sends now require a shared token**: the `send-email` edge function only accepts non-contact sends with the `x-internal-token` header equal to the new `EMAIL_INTERNAL_TOKEN` secret (set in Supabase via deploy workflow); client callers (`TeamApplications`, `OfferLetters`) and `issue-certificate` pass it from `VITE_EMAIL_INTERNAL_TOKEN`.

## [0.26.2] - 2026-08-05

### Changed
- **Production domain migrated `zyroo.dpdns.org` → `zyroo.org`**: the site was using a free dynamic-DNS domain (dpdns.org) that Gmail flagged as "likely unsolicited mail" — emails sent from `team@zyroo.dpdns.org` were bounced at the reputation filter. `zyroo.org` is now registered at Cloudflare (with free Email Routing mailboxes `info@`, `support@`, `careers@`, `partnerships@`, `privacy@`, `legal@`, `security@` forwarding to the team inbox) and verified in Resend (DKIM/SPF). All site/edge-function references to the old domain plus stale `zyr0.com` placeholders now use `zyroo.org`. Transactional email now sends from `team@zyroo.org`.

## [0.26.1] - 2026-08-05

### Fixed
- **Shortlist emails showed green even when they failed**: `handleBulkEmail` in the admin team-applications panel always rendered the success style (`type: failed === 0 ? 'ok' : 'ok'`), so a failed batch showed a green success banner instead of an error. It now shows red for failures and reports per-candidate failure counts.
- **Email delivery results were untraceable**: the admin UI claimed "email sent" the instant Resend accepted the message for delivery (acceptance is async — Gmail can still bounce it minutes later, which is exactly what happened with `zyroo.dpdns.org` being flagged as "likely unsolicited mail"). The app now stores the Resend message ID on the application record (`email_message_id`), surfaces it in the detail dialog and CSV export, and phrases the banner honestly ("accepted for delivery — verify in the inbox") so a queued-then-bounced email no longer masquerades as delivered.

## [0.26.0] - 2026-08-04

### Added
- **Camera permission guidance on `/verify`**: clicking "Scan QR Code" now checks the browser's stored camera permission first. If it's still undecided, the normal browser prompt appears so the user can allow it; if the permission is stored as blocked (a denied prompt is remembered forever in Chrome and never re-asked), the page now explains this and offers an "Open Camera Settings" button that jumps straight to the browser's camera settings instead of just failing.

## [0.25.5] - 2026-08-04

### Fixed
- **Camera failures showed the wrong reason in Chrome**: `html5-qrcode` wraps every `getUserMedia` failure in a plain string ("Error getting userMedia, error = …"), so the error classifier never saw the real error name and always fell back to the generic "Could not start the camera" message. The classifier now unwraps the inner error name (denied / no camera / busy camera are each reported correctly) and recognizes Chrome's legacy `ConstraintNotSatisfiedError`.

## [0.25.4] - 2026-08-04

### Fixed
- **Scanner crash wiped the whole page on first use**: when the camera failed to start (first-time permission prompt denied, no camera, or busy device), the error handler unmounted the scanner and the cleanup called `html5-qrcode.stop()` on a scanner that never started — which throws `"Cannot stop, scanner is not running or paused."` synchronously during React's commit phase, tripping the error boundary and replacing the entire page with "Application error". The scanner now only tears down when a camera actually started, and the stop call is guarded, so camera failures show the friendly inline message instead of crashing the app.

## [0.25.3] - 2026-08-04

### Fixed
- **QR scanner could not start the camera**: the camera was being initialized before the scan frame existed in the DOM, so `html5-qrcode` couldn't find its container and threw on every device. The scanner now starts in a `useEffect` after the frame is mounted (and stops via effect cleanup on cancel/leave). Also added a clear error for insecure contexts (`navigator.mediaDevices` unavailable — camera requires HTTPS/localhost) and better messages for denied / missing / busy cameras.

## [0.25.2] - 2026-08-04

### Fixed
- **Offer letter QR code is now real**: the "QR code" on generated offer letters was a non-scannable pseudo-random matrix. It now encodes the verification URL with a genuine QR encoder (`qrcode`, pure-JS, stays fully offline), so scanning the letter opens the verify page. The printed "Verify at …" text remains as a fallback.

## [0.25.1] - 2026-08-04

### Added
- **Realtime QR scanner on `/verify`**: a "Scan QR Code" button opens the rear camera (`html5-qrcode`) with a live scan window; a detected certificate QR instantly fills the ID and verifies it with no extra click. Camera stops on success, cancel, or page leave; permission-denied / no-camera devices get a friendly message with the manual entry fallback.

## [0.25.0] - 2026-08-04

### Fixed
- **Internship cards in light theme**: `.internship-card` was hardcoded dark (`bg-slate-900/80` + `border-white/10`), making card text unreadable when the light theme is active. The card now mirrors the theme-aware `.feature-card` pattern — `bg-white/80` with `slate-200` border in light, unchanged in dark (hover: `slate-300` / `white/20`). Applies to the public `/internships` cards and the student dashboard internship cards (same class, unlayered rule previously overrode their `bg-card` overrides).

## [0.24.5] - 2026-08-04

### Fixed
- **Announcement bar on mobile**: the message now wraps naturally (was truncated to one unreadable line with the contact CTA hidden) and the CTA appears as an inline "Contact us →" link inside the message; larger tap target for the dismiss button. The page content offset now tracks the real header height (ResizeObserver) instead of a fixed `pt-9`, so no overlap regardless of message length.

## [0.24.4] - 2026-08-04

### Added
- **Admin banner management**: new `/admin/site-banners` page — list banners, toggle active/inactive, create, edit (title, message, CTA label/URL) and delete; registered in `AdminPortal` and the admin sidebar.

## [0.24.3] - 2026-08-04

### Added
- **Site-wide announcement bar**: `SiteBannerBar` renders the first active banner at the top of every public page (fixed header, above the nav), with the current maintenance notice: *"ZYR0 is undergoing scheduled maintenance. If you run into any issues while exploring, reach out — our team is here to help."* with a "Contact us" CTA (WhatsApp support group by default). Dismissible per visitor (localStorage); page content offsets for the bar height automatically.

## [0.24.2] - 2026-08-04

### Added
- **`site_banners` table** (migration `031`): site-wide announcement/notification rows (title, message, link URL/label, active flag, optional time window) with RLS — public reads only active banners, admins manage all; seeded with the current maintenance notice. `app/src/services/siteBanners.ts` provides public fetch + admin CRUD.

## [0.24.1] - 2026-08-04

### Docs
- **Versioning policy documented**: every commit produces one changelog release entry; patch bumps within a minor series and the minor bumps after five patches (`0.23.1 → … → 0.23.5 → 0.24.0 → 0.24.1 → …`). Recorded in `docs/GIT_WORKFLOW.md` §0 and this file.

## [0.24.0] - 2026-08-04

### Added
- **Support FAQ entries**: new "Support & Help" category on the public FAQ (group vs channel vs email, response times) and application-troubleshooting entries on the careers FAQ. Support email unified to `support@zyroo.dpdns.org` throughout the FAQs.

## [0.23.5] - 2026-08-04

### Changed
- **Careers call-to-action**: the "Ask a Question" button on the founding-team final CTA now opens the WhatsApp support group instead of the announcements channel; the sign-in gate gained a "Trouble signing in or applying?" line linking to the support group.

## [0.23.4] - 2026-08-04

### Added
- **Footer support links**: a second WhatsApp icon (support group, next to the channel icon) and a "WhatsApp Support Group" entry in the footer's Community & Support list; the email icon now opens `mailto:support@zyroo.dpdns.org`.

## [0.23.3] - 2026-08-04

### Added
- **Contact page**: "WhatsApp Support Group" card (community help & discussion); the WhatsApp Channel card description now reads "Latest updates & announcements".

## [0.23.2] - 2026-08-04

### Added
- **Help Center "Get Support" section**: four cards — WhatsApp Support Group (community help), WhatsApp Channel (announcements), Email Support (24h SLA), Phone (business hours) — plus the "Contact Support" card now points to the support group.

## [0.23.1] - 2026-08-04

### Changed
- **Site config**: added `SITE_CONFIG.social.whatsappSupportGroup` (env `VITE_WHATSAPP_SUPPORT_GROUP_URL`, fallback `https://chat.whatsapp.com/Hp2rnX1B61PDzVlbF89Tha`) and unified the support email to `support@zyroo.dpdns.org`.

## [0.26.3] - 2026-08-05

### Fixed
- **Students could not see their own team applications**: RLS only allowed admins to read `team_applications`, so the new tracking page showed nothing and the submit read-back could fail. Migration `032` adds an owner SELECT policy so applicants can read their own rows. Also, the status-change notification used the type `team_application`, which violates the `notifications` CHECK constraint — notifications now use the valid `application` type.

## [0.26.2] - 2026-08-05

### Added
- **Founding Development Team recruitment experience** (`/careers`, `feature/founding-development-team`):
  - Premium V3 recruitment page: FoundingHero (canvas particles + repo-window mockup + floating role cards), Mission, Why Join (6), Culture (8), Open Roles (11 roles / 20 seats across Engineering, Design, AI & Data, Platform, Community, Growth), Workflow timeline (7 steps), Selection timeline (7 steps), Expectations (9), Recognition (6), FAQ (6), and final CTA.
  - Multi-step application form (Basics → Links & Resume → Role & Skills → Commitment → Review) with client-side validation, PDF/DOC resume upload (≤5 MB) and a confirmation success screen. Collects phone and gender in the Basics step (migration `029`).
  - SEO structured data: `BreadcrumbList` + `FAQPage` on the public careers route.
  - `Careers` link in the public navigation.
- **Team applications database + admin workflow**:
  - `team_applications` table and `team-resumes` storage bucket (public read, anonymous upload) in migration `028`; RLS allows public insert, admin-only read/update/delete via `is_admin()`.
  - `app/src/services/teamApplications.ts`: anonymous submit (resume upload + insert), admin list/status/delete, email-sent tracking.
  - New admin page `/admin/team-applications`: status tabs, search, bulk "Email Selected" shortlist emails via the `send-email` edge function, CSV export, full-detail dialog, per-row status updates and delete; registered in `AdminPortal` and the admin sidebar.
- **Standalone team application form** at `/careers/apply`: applying from the careers page opens a dedicated form (no scroll-target gating), with the chosen role preselected via the `?apply=<role>` param. Registering or signing in from the careers flow now returns to the application form with the role intact.
- **Team application tracking for students**: a "Team Applications" page in the student dashboard lists every application with status tabs and a per-application timeline; the dashboard's "Join the Founding Team" card switches between "Apply" and "Track your application" based on existing applications. Application status changes raise a bell notification.

### Changed
- **Careers — signup required to apply**: the application form now shows a sign-in gate for anonymous visitors; applications are linked to the applicant's ZYR0 account (`user_id`, migration `030`) and anonymous inserts are blocked by RLS. The hero "Explore Open Roles" CTA links to the registration page instead of scrolling to the roles list.
- **Team application form**: motivation minimum lowered from 60 to 30 characters.

### Fixed
- **Team application submit error**: submission actually succeeded, but the client read-back (`insert().select().single()`) failed under RLS (admins-only SELECT), surfacing a false "Something went wrong" error. The insert now skips the read-back, so applicants get the success screen immediately.

## [0.26.1] - 2026-08-05

### Added
- **CS-focused domain dropdown**: internship Domain fields now use a grouped list of computer-science domains (Computer Science, AI & Data, Security & Cloud, Hardware & Systems, Business & Other) shared across the company post/edit internship forms, the student internship filters, and admin analytics — replacing the small generic list.

## [0.22.0] - 2026-08-03

### Added
- **Light / dark theme toggle** (`landing-page-v3`):
  - Sun/moon toggle in the public navbar (`next-themes`, dark remains default; persists to localStorage).
  - Entire landing page is now theme-aware: every V3 section, hero, glass cards, mockup, Journey timeline, AudienceSplit, RoleChips, stats band, logo marquee, nav and footer render correctly in both themes.
  - Dual-theme utilities: `.glass-card-v3`, `.feature-card`, `.text-gradient-v3`, new `.text-rotate-v3` (hero TextRotate gradient, light/dark variants).
- **AudienceSplit third card**: "For Mentors" (amber) alongside Students and Employers — "One platform. *Three journeys.*" headline.

### Changed
- **Unified heading system**: every section title now follows the Testimonials pattern — `Space Grotesk` eyebrow, Sora bold headline, Fraunces italic sky accent phrase (Community "Stay Connected in Real-Time.", Every Career "somewhere.", Features "clear outcomes.", Roles "hiring for.", Transparency "Designed for confidence.", CTA "how internships work?").
- **StatsBand**: compact size (`text-2xl sm:text-3xl`), ease-out-expo count-up with settle glow; values lowered for credibility (500+ placements · 50+ companies · Rs 150K+ stipends · 4.9★ rating).
- Hero trust-counter row removed in favor of the StatsBand.
- Fixed invisible-headings root cause: page was permanently dark because `dark:` variants never activated (html always `light`); sections now carry explicit light/dark classes.
- Per-card CTA text color on AudienceSplit (white on blue/emerald gradients, dark on amber); checklist/mockup/marquee text theme-aware.

### Fixed
- Mangled doubled `dark:` classes (slate-300/80 hero subtext, slate-400 JourneyCard labels) from bulk class rewrites.
- `.text-gradient-v3` brace nesting bug in CSS.

## [0.21.0] - 2026-08-03

### Added
- **Landing Page V3 (`landing-page-v3`)**:
  - **Hero V3**: Sora display headline with Fraunces italic gradient accent, dual CTAs (students / employers), animated search mockup (typewriter role typing + rotating location chips + floating "Hiring Now" / "Stipend Paid" badges), and a mini trust row.
  - **StatsBand**: animated count-up social proof (2,400+ placements · 450+ companies · Rs 18M+ stipends · 4.9★ rating), reduced-motion aware.
  - **LogoMarquee**: CSS infinite employer marquee, pauses on hover, disabled under `prefers-reduced-motion`.
  - **AudienceSplit**: two-card Wellfound-style "For Students" / "For Employers" split with checklists and CTAs (replaces the old employer-only section).
  - **RoleChips**: trending-roles chip cloud (Frontend, AI/ML, UI/UX, Data, Marketing, …), each linking to the internships listing.
  - **Testimonials & Final CTA** restyled to the V3 system (glass cards, cobalt gradient CTA panel).

### Changed
- Design tokens: `Sora` mapped to all display/heading typography, `Fraunces` italic accent font, `Space Grotesk` label font; new utilities (`.glass-card-v3`, `.chip-v3`, `.stat-value`, `.text-gradient-v3`, `.animate-marquee`, `.v3-pulse-dot`).
- Hero CTA "Explore Internships" → "Find an Internship" (cobalt primary).

## [0.20.3] - 2026-08-03

### Fixed
- **Broken Route Links (`fix/broken-route-links`)**:
  - Landing hero "Explore Opportunities" CTA pointed to `/explore` (no route existed, landing on the 404 page) — now points to `/internships`.
  - Public footer "Post Internship" link pointed to `/company/post-internship` (no route existed) — now points to the actual company route `/company/internships/new`.
  - Full routing audit performed across `App.tsx`, all four portal sub-routers, nav config, verification gates, sitemap, and dynamic `navigate()`/`<Link to={...}>` targets — all other routes verified consistent.

## [0.20.2] - 2026-08-02

### Changed
- **Certificate Brand Wordmark (`style/certificate-brand-wordmark`)**:
  - Replaced the "ZYRO" text with the official wordmark: "ZYR" lettering with the ZYR0 logo mark standing in as the "0" glyph.
  - Recolored the ZYR lettering from purple to dark navy blue (`#1e3a8a`) for a professional, authoritative brand presence; the logo mark retains its original brand colors.
  - Sized the logo mark (36px) to optically match the ZYR lettering height.
  - Replaced the "startupZYRO" tagline with "INTERNSHIP PLATFORM" (uppercase, letterspaced) beneath the wordmark.
  - Recolored the "ZYRO Awarding this certificate of achievement" sub-header from maroon to the ZYR0 logo blue (`#1e40af`) and pushed it down for better spacing.
- **Certificate Body Emphasis (`style/certificate-body-emphasis`)**:
  - Enlarged the body copy from `13.5px` to `15px` for readability.
  - Applied the extra-bold (`font-weight: 900`) + enlarged (`17px`) + gold-underline treatment to the company name and the internship period dates, matching the internship title, so every dynamic credential value catches the eye.
- **Certificate Signature Blocks (`style/certificate-signature-blocks`)**:
  - Left block now represents the company owner: cursive signature + printed name (dynamic from issuer), `PROGRAM COORDINATOR` title, and the real company name beneath the title.
  - Right block is the fixed ZYRO platform signature: cursive `ilyas khan` (ZYRO Director) with `ZYRO Director` name and `ZYRO Platforms` title, offset up and right for perfect footer alignment.
  - Replaced the `text-decoration` underline on script signatures with a robust `border-bottom` line that renders reliably under the cursive names.

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
