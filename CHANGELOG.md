# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.96.1] - 2026-11-16

### Changed
- **Use pipe separators in detail SEO titles (`app/src/pages/public/ToolDetail.tsx`)**:
  - Use pipe separators in detail SEO titles.

## [3.96.0] - 2026-11-16

### Added
- **Ship Gruvbox detail page and command label defaults (`app/src/components/tools/SubmitToolDialog.tsx, app/src/pages/public/ToolDetail.tsx, app/src/styles/tool-detail.css`)**:
  - Ship Gruvbox detail page and command label defaults.

## [3.95.5] - 2026-11-16

### Added
- **Label commands and lead with them on detail pages (`app/src/components/tools/SubmitToolDialog.tsx, app/src/pages/public/ToolDetail.tsx`)**:
  - Label commands and lead with them on detail pages.

## [3.95.4] - 2026-11-15

### Changed
- **Merge pull request #171 from ilyaskhan12Q/feat/tool-submission-redesign**:
  - Redesign tool & skill submission as a guided 3-stage editor.

## [3.95.3] - 2026-11-14

### Added
- **Add listing SEO controls and rebuild public pages (`app/package-lock.json, app/package.json, app/scripts/generate-seo.js, app/src/components/markdown/MarkdownContent.tsx, app/src/components/tools/SubmitToolDialog.tsx`)**:
  - Add editable SEO title, meta description, and slug to the submission flow; persist SEO fields; render listing Markdown with shared safe component; show every install method; add canonical/OG/JSON-LD and noindex 404; pre-render tool page body content; restore anon read migration and add SEO columns.

## [3.95.2] - 2026-11-14

### Added
- **Redesign tool and skill submission as a 3-stage editor (`app/src/components/tools/SubmitToolDialog.tsx, app/src/components/tools/submitToolForm.ts`)**:
  - Replace the single long form with Basics, Listing Content, and Review stages. Add a Markdown editor with toolbar, split preview and mobile Write/Preview tabs, expandable secondary sections, removable tag chips, a live public-listing preview, completeness and validation review, and browser-local draft autosave/restore.
  - All 16 publishing fields, submitTool(), admin-only status/featured/badge/cover fields, moderation flow, and schema remain unchanged.

## [3.95.1] - 2026-10-30

### Changed
- **Merge pull request #169 from ilyaskhan12Q/fix-resume-timeouts**:
  - Fix(applications): resolve resumes signing timeout by switching to on-demand resolution.

## [3.95.0] - 2026-10-28

### Fixed
- **Lift WhatsApp FAB clear of bottom-right toasts (`app/src/pages/student/Tasks.tsx, app/src/pages/student/Workspace.tsx`)**:
  - Lift WhatsApp FAB clear of bottom-right toasts.

## [3.94.5] - 2026-10-28

### Fixed
- **Surface silent failures and unify toast feedback (`app/src/components/ui/sonner.tsx, app/src/layouts/DashboardLayout.tsx, app/src/pages/public/InternshipDetail.tsx, app/src/pages/student/Dashboard.tsx, app/src/pages/student/Messages.tsx`)**:
  - Clean bottom-right toast styling shared by all roles.
  - Sidebar sign out now actually signs the user out.
  - Messages keep the draft when sending fails.
  - Apply, offer accept/reject and portfolio copy give feedback.
  - Replace alert/confirm with toasts and AlertDialog.
  - Load failures on dashboard, progress, portfolio and tools are reported.
  - Settings validate the password before saving.

## [3.94.4] - 2026-10-28

### Added
- **Add toast notifications across company actions and mutations (`app/src/components/company/tasks/TaskExtendDeadlineModal.tsx, app/src/components/company/tasks/TaskReviewDrawer.tsx, app/src/pages/company/Applications.tsx, app/src/pages/company/Certificates.tsx, app/src/pages/company/EditInternshipModal.tsx`)**:
  - Add toast notifications across company actions and mutations.

## [3.94.3] - 2026-10-27

### Fixed
- **Resolve resumes signing timeout by switching to on-demand resolution (`app/src/components/applications/ApplicationDetailDialog.tsx, app/src/pages/company/Applications.tsx, app/src/services/applications.ts`)**:
  - Resolve resumes signing timeout by switching to on-demand resolution.

## [3.94.2] - 2026-10-27

### Changed
- **Merge pull request #168 from ilyaskhan12Q/fix-company-tasks-load**:
  - Fix(workflow): resolve company task timeouts, storage policies, and public certificate verification.

## [3.94.1] - 2026-10-27

### Fixed
- **Resolve public certificate verification, task storage policies, and company list timeouts (`app/src/pages/company/Certificates.tsx, app/src/pages/company/Interns.tsx, app/src/services/certificates.ts, app/src/services/tasks.ts, supabase/migrations/075_public_certificate_verification.sql`)**:
  - Resolve public certificate verification, task storage policies, and company list timeouts.

## [3.94.0] - 2026-10-27

### Fixed
- **Resolve task attachments on demand instead of eager signing (`app/src/components/company/tasks/TaskReviewDrawer.tsx, app/src/lib/storage.ts, app/src/services/tasks.ts`)**:
  - Resolve task attachments on demand instead of eager signing.

## [3.93.5] - 2026-10-27

### Fixed
- **Resolve CSP worker block and avoid blocking PDF signing in tasks (`app/src/pages/company/Tasks.tsx, app/src/services/offerLetters.ts, app/vercel.json`)**:
  - Resolve CSP worker block and avoid blocking PDF signing in tasks.

## [3.93.4] - 2026-10-27

### Security
- **Merge pull request #154 from ilyaskhan12Q/fix/security-audit-run-1 (`app/src/services/tasks.ts`)**:
  - Fix(security): close audit findings and gate deploys on migrations.

## [3.93.3] - 2026-10-26

### Changed
- **Merge pull request #166 from ilyaskhan12Q/fix/task-assign-undefined-id**:
  - Fix(tasks): resolve undefined id error on task assignment and add toast feedback.

## [3.93.2] - 2026-10-25

### Fixed
- **Resolve undefined id error on task assignment and add toast feedback (`app/src/components/company/tasks/TaskCreateEditModal.tsx, app/src/services/tasks.ts`)**:
  - Resolve undefined id error on task assignment and add toast feedback.

## [3.93.1] - 2026-10-25

### Security
- **Merge branch 'main' into fix/security-audit-run-1 (`.github/workflows/deploy.yml, app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts, app/src/lib/storage.ts, app/src/pages/admin/Reports.tsx`)**:
  - Merge branch 'main' into fix/security-audit-run-1.

## [3.93.0] - 2026-10-25

### Fixed
- **Use --use-api for supabase functions deploy to bypass Docker ECR rate limits (`.github/workflows/deploy.yml`)**:
  - Use --use-api for supabase functions deploy to bypass Docker ECR rate limits.

## [3.92.5] - 2026-10-25

### Changed
- **Merge pull request #155 from ilyaskhan12Q/feat/tools-multi-command-and-preview**:
  - Feat/tools multi command and preview.

## [3.92.4] - 2026-10-25

### Changed
- **Merge remote-tracking branch 'origin/main' into feat/tools-multi-command-and-preview**:
  - Merge remote-tracking branch 'origin/main' into feat/tools-multi-command-and-preview.

## [3.92.3] - 2026-10-25

### Changed
- **Merge pull request #151 from ilyaskhan12Q/feat/global-ui-architecture**:
  - Feat(ui): standardize global public UI architecture and brand system.

## [3.92.2] - 2026-10-25

### Changed
- **Merge branch 'main' into feat/tools-multi-command-and-preview (`app/package.json, app/src/index.css, app/src/main.tsx, app/tailwind.config.js, app/tsconfig.app.json`)**:
  - Merge branch 'main' into feat/tools-multi-command-and-preview.

## [3.92.1] - 2026-10-25

### Changed
- **Merge branch 'main' into feat/global-ui-architecture (`app/package.json, app/src/index.css, app/src/main.tsx, app/tailwind.config.js, app/tsconfig.app.json`)**:
  - Merge branch 'main' into feat/global-ui-architecture.

## [3.92.0] - 2026-10-25

### Added
- **Desktop morphing navbar, partner onboarding page, and expanded products menu (`app/src/App.tsx, app/src/components/nav/SiteNav.tsx, app/src/config/navigation.ts, app/src/pages/public/Join.tsx`)**:
  - Desktop morphing navbar, partner onboarding page, and expanded products menu.

## [3.91.5] - 2026-10-25

### Changed
- **Merge pull request #153 from ilyaskhan12Q/feat/tools-multi-command-and-preview**:
  - Feat(tools): add multi-command installation, markdown rendering, and live preview switcher.

## [3.91.4] - 2026-10-25

### Added
- **Redesign tool hub hero, add suggested tools, and fix navbar top breathing room (`app/src/components/nav/SiteNav.tsx, app/src/components/research-landing/HeroSection.tsx, app/src/config/navigation.ts, app/src/pages/edu/SchoolOSLanding.tsx, app/src/pages/public/BillingHelp.tsx`)**:
  - Redesign tool hub hero, add suggested tools, and fix navbar top breathing room.

## [3.91.3] - 2026-10-25

### Fixed
- **Sign offer PDFs on the admin list too (`app/src/pages/admin/OfferLetters.tsx`)**:
  - The admin page queried offer_letters directly, so its download links bypassed the read-time signing and pointed at the now-private bucket.

## [3.91.2] - 2026-10-25

### Fixed
- **Match invited recipients case-insensitively (`supabase/functions/send-email/index.ts`)**:
  - Older invite rows may keep mixed-case addresses; the relay check lowercased the request but compared against the stored value in SQL. Compare in JS instead.

## [3.91.1] - 2026-10-25

### Fixed
- **Block client certificate minting and usage-ledger deletes (`supabase/migrations/074_lock_certificate_and_usage_writes.sql`)**:
  - A company owner/admin/hr could insert an Active certificate for any recipient and another company's internship, bypassing every check in issue-certificate. Certificates are only written by that function (service role), so clients no longer get INSERT.
  - Users could also delete their own agent_usage rows, which is the only per-user AI throttle; delete is now service-role only.

## [3.91.0] - 2026-10-25

### Fixed
- **Keep public offer verification working without anon reads (`app/src/pages/admin/Reports.tsx, app/src/services/offerLetters.ts, supabase/functions/send-email/index.ts, supabase/migrations/073_public_offer_verification.sql`)**:
  - 065 removes anonymous SELECT on offer_letters, but /verify still looked offers up in that table, so the public verification link would stop working. Add a code-keyed SECURITY DEFINER lookup that returns only the fields the offer document renders (no notes, student email or other rows) and call it from the service. Also tidy the CSV title field and the send-email header comment.

## [3.90.5] - 2026-10-25

### Fixed
- **Require authorization for notification emails (`supabase/functions/send-notification-email/index.ts, supabase/migrations/068_restrict_notifications_and_activity_logs.sql`)**:
  - Send-notification-email accepted any unauthenticated POST and emailed any userId with attacker-chosen title, body and link from the platform domain. Require the server-only internal token or a signed-in caller that can_notify() allows, matching the new notifications insert rule. can_notify is no longer executable by anon.

## [3.90.4] - 2026-10-25

### Fixed
- **Gate production deploy on migrations and make the RLS check real (`.github/workflows/ci.yml, .github/workflows/deploy.yml`)**:
  - The frontend deployed in parallel with the migration job, so code expecting a new schema could ship while the database still lacked it (the live project is missing 063-065). Deploy now waits for migrations, the migration job asserts that anonymous callers can no longer read profiles, and the CI RLS step compares the table and RLS lists instead of printing both and passing.

## [3.90.3] - 2026-10-25

### Security
- **Carry 060-065 onto the security branch (`supabase/migrations/060_add_tools_cover_color.sql, supabase/migrations/061_admin_security_and_governance.sql, supabase/migrations/062_add_install_commands_to_tools.sql, supabase/migrations/063_restrict_profiles_read.sql, supabase/migrations/064_private_student_files.sql`)**:
  - The audit fixes for anon profile reads (063), student buckets (064) and public offer-letter reads (065) already existed on the feature branch but not on main, and the CI sequence check requires an unbroken numbering. Carry 060-065 over so this branch is self-contained and the deploy gate can verify them.

## [3.90.2] - 2026-10-25

### Fixed
- **Stop ai-gateway verifying private addresses (`supabase/functions/ai-gateway/index.ts`)**:
  - The verify action fetched up to 25 caller-supplied URLs with only a scheme check and followed redirects automatically, giving any signed-in account a reachability oracle for loopback, private and link-local services (including cloud metadata). It also ran before the rate limiter.
  - Reject non-public hosts, re-validate every redirect hop, cap hops at four, and apply the per-user rate limit to every authenticated action.

## [3.90.1] - 2026-10-25

### Fixed
- **Privatize student document buckets and scope writes (`app/src/lib/storage.ts, app/src/services/offerLetters.ts, app/src/services/tasks.ts, supabase/migrations/072_private_document_buckets.sql`)**:
  - Offer-letters and task-documents were public buckets whose write policies only checked bucket_id + authenticated, so any account could overwrite or delete any tenant's file and anonymous visitors could fetch them.
  - Make both buckets private and serve them through one-hour signed URLs resolved at read time. Reads are limited to the student, the company in the workflow, or an admin; writes to the uploader's own folder (task-documents) or the company that owns the offer (offer-letters). company-assets stays public for logos, with writes scoped to the owning company or an admin.

## [3.90.0] - 2026-10-25

### Fixed
- **Require an email before a team invite can be accepted (`supabase/migrations/071_require_invite_email.sql`)**:
  - Accept_company_invite skipped the email comparison when the invite row had no email, so anyone holding the token could claim it. Reject null-email invites in the RPC and require an address when creating one.

## [3.89.5] - 2026-10-25

### Fixed
- **Stop the public invite lookup leaking the invited email (`app/src/pages/public/AcceptInvite.tsx, app/src/services/companyTeam.ts, supabase/migrations/070_hide_invite_email.sql`)**:
  - Lookup_invite_by_token is callable without a session and returned the invited address, so a leaked link disclosed who it was sent to. Return only the company name and invite status; the accept page no longer needs the address.

## [3.89.4] - 2026-10-25

### Fixed
- **Bind mark_messages_read to the caller (`supabase/migrations/069_harden_mark_messages_read.sql`)**:
  - The RPC trusted p_user_id and p_conversation_id, so any signed-in user could mark messages read in other people's conversations. Require p_user_id to match the JWT and the caller to be a participant.

## [3.89.3] - 2026-10-25

### Fixed
- **Restrict notification and audit-log inserts (`supabase/migrations/068_restrict_notifications_and_activity_logs.sql`)**:
  - Any signed-in user could insert a notification for any other user with an arbitrary title, body and action_url, which renders as a trusted in-app message (phishing), and could write activity_logs rows that the admin reports and log viewer display.
  - Client inserts now require an existing relationship between the two users (conversation, application to either side's company, or task assignment). activity_logs is service-role only.

## [3.89.2] - 2026-10-25

### Fixed
- **Stop students self-accepting applications (`supabase/migrations/067_restrict_application_status_changes.sql`)**:
  - The INSERT policy only checked student_id, so an applicant could create a row already marked Accepted, and the UPDATE policy had no WITH CHECK, so they could flip their own status afterwards. New rows must start at Applied and a student update may only keep Applied or set Withdrawn; company and admin paths keep their existing rules.

## [3.89.1] - 2026-10-25

### Fixed
- **Keep company verification admin-controlled (`supabase/migrations/066_protect_company_verification.sql`)**:
  - A self-registered company could insert or update its own status, verified_at and verification_notes, so the verified badge and every is_company_verified check could be self-granted without review. A trigger now pins new companies to pending and rejects verification-field changes from non-admins.

## [3.89.0] - 2026-10-25

### Fixed
- **Escape certificate text and sandbox the preview (`app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts`)**:
  - Recipient name, company and internship title were interpolated raw into the certificate HTML, which is rendered in an unsandboxed srcdoc iframe and in a document.write print window. A student could set their name to markup and run script in any staff session that viewed the certificate.
  - Escape every interpolated field, render the preview in an opaque origin, and drop the print window's opener reference.

## [3.88.5] - 2026-10-25

### Fixed
- **Escape admin report output before document.write (`app/src/pages/admin/Reports.tsx`)**:
  - Report headers and cells came from activity_logs and internship fields and were interpolated raw into a same-origin popup, so an anon-writable log entry could run script with the admin's session. Escape every interpolated value, drop the opener link, and neutralise spreadsheet formulas in the CSV export.

## [3.88.4] - 2026-10-25

### Fixed
- **Scope send-email internal sends to authorized recipients (`app/src/pages/company/OfferLetters.tsx, app/src/services/companyTeam.ts, supabase/functions/send-email/index.ts`)**:
  - Any self-registered company account (or any accepted team member) could relay arbitrary to/subject/html from the platform domain, and the sender check accepted any address containing 'zyroo.org'.
  - Non-admin sends now require a workflow relationship: kind='invite' must match a pending invite for a company the caller owns or administers, and kind='offer' must match the student on one of that company's offers. Admins and the server-only internal token keep full reach. Sender is pinned to an exact allowlist of ZYRO0 mailboxes.

## [3.88.3] - 2026-10-25

### Fixed
- **Remove unauthenticated Resend diagnostics from send-email (`supabase/functions/send-email/index.ts`)**:
  - The GET branch ran provider lookups with RESEND_API_KEY before any auth check, so anyone holding the public anon key could list domains and read individual message records (including bodies) via CORS-open responses.
  - No client caller used the diagnostics branches.

## [3.88.2] - 2026-10-25

### Fixed
- **Show the real certificate in the certificate tab (`app/src/pages/student/Workspace.tsx`)**:
  - Show the real certificate in the certificate tab.

## [3.88.1] - 2026-10-25

### Fixed
- **Wait for all assets before revealing or printing (`app/src/components/CertificateDocument.tsx`)**:
  - Wait for all assets before revealing or printing.

## [3.88.0] - 2026-10-25

### Fixed
- **Print full-bleed A4 landscape (`app/src/components/certificateTemplate.ts`)**:
  - Print full-bleed A4 landscape.

## [3.87.5] - 2026-10-23

### Added
- **Add dashboard charts and fix user stat query (`app/src/pages/admin/Dashboard.tsx`)**:
  - Add dashboard charts and fix user stat query.

## [3.87.4] - 2026-10-22

### Changed
- **Reuse a shared dialog for blocked print/PDF windows (`app/src/components/CertificateDocument.tsx, app/src/components/OfferLetterDocument.tsx, app/src/components/PrintErrorDialog.tsx, app/src/pages/admin/Reports.tsx, app/src/pages/company/OfferLetters.tsx`)**:
  - Reuse a shared dialog for blocked print/PDF windows.

## [3.87.3] - 2026-10-22

### Changed
- **Show a dialog when the certificate print window is blocked (`app/src/components/CertificateDocument.tsx`)**:
  - Show a dialog when the certificate print window is blocked.

## [3.87.2] - 2026-10-21

### Changed
- **Merge pull request #150 from ilyaskhan12Q/fix/research-agent-frontend**:
  - Fix(agent): research-agent frontend fixes (attachments, auto-scroll, brand, Lenis scrolling).

## [3.87.1] - 2026-10-21

### Removed
- **Remove offer-letter verification; certificate email links to dashboard (`app/src/App.tsx, app/src/components/OfferLetterDocument.tsx, app/src/lib/offerLetterPdf.ts, app/src/pages/company/OfferLetters.tsx, app/src/pages/public/FAQ.tsx`)**:
  - Remove offer-letter verification; certificate email links to dashboard.

## [3.87.0] - 2026-10-21

### Fixed
- **Make printing dashboard-only (`app/src/components/CertificateDocument.tsx, app/src/pages/admin/Certificates.tsx, app/src/pages/public/Verify.tsx, app/src/pages/student/Certificates.tsx`)**:
  - Hide the print action on the public verification sheet, fix the broken /public link on the student dashboard, point the admin view action at the real verify URL instead of the non-existent pdf_url, and report blocked print pop-ups instead of failing silently.

## [3.86.5] - 2026-10-21

### Changed
- **Seamless baked paper texture and print-safe layout (`app/public/certificate-paper.webp, app/src/components/OfferLetterDocument.tsx, app/src/components/certificateTemplate.ts, app/src/index.css, app/src/lib/offerLetterPdf.ts`)**:
  - Replace tiled feTurbulence layers (visible rectangular seams) with one pre-baked continuous paper texture, shared by the certificate and offer letter. Hide the purple glow when printing (it darkened the printed middle) and inset the sheet 2.5% so printer margins cannot clip the gold frame.

## [3.86.4] - 2026-10-19

### Changed
- **Record the About trim and sidebar hover peek, 2.80.4 (`CHANGELOG.md, app/package.json, app/src/agent/components/AgentSettingsModal.tsx`)**:
  - Add entries for 77f65b8 (2.80.3) and 3963387 (2.80.4), PR #150.
  - Bump app/package.json to 2.80.4 and refresh the About pane's What's new.

## [3.86.3] - 2026-10-19

### Fixed
- **Run page backgrounds under the fixed header again (`app/src/components/SiteMascot.tsx, app/src/components/ui/shader-hero.tsx, app/src/index.css, app/src/pages/public/About.tsx, app/src/pages/public/CookiePolicy.tsx`)**:
  - Reserving the header height on `main` (e00b6b5) also pushed each page's own background down, leaving a body-coloured strip behind the pill: the nav read as a separate block instead of sitting on the hero. Fix the surface, not the offset.
  - Index.css: .hero-under-header pulls the first section up under the header and pads its content back down; one utility, driven by the same measured var.
  - Shader-hero: same treatment for the "/" hero (bg to y=0, copy still clear).
  - About/FAQ/Help/Privacy/Terms/Cookies: first section uses it (py-16 -> pb-16).
  - SiteMascot: 120px is oversized on a phone; scale 0.65 below sm, full at sm+.
  - Verified with screenshots at 1440x900 and 390x844: dot grid and blue heroes reach y=0 behind the pill, headings still clear the header, mascot is 78px on mobile.

## [3.86.2] - 2026-10-19

### Fixed
- **Reserve the real header height once, for every public page (`app/src/components/nav/SiteNav.tsx, app/src/components/research-landing/HeroSection.tsx, app/src/index.css, app/src/layouts/PublicLayout.tsx, app/src/pages/edu/SchoolOSLanding.tsx`)**:
  - The banner + pill are a fixed overlay, so they took no space in the flow and each page guessed its own top gap (pt-20 / pt-24 / pt-28 / pt-32). Those guesses only matched a bare pill (80px); with an active banner the header is 118px on desktop and 147px on mobile, so every public page started under it.
  - PublicLayout now measures the header with a ResizeObserver and publishes it as both `padding-top` on main and `--zyro-header-h`. New pages are correctly offset with no padding of their own; full-bleed heroes pull back up with -mt-[var(--zyro-header-h)] (research) and viewport-tall states use .min-h-page.
  - PublicLayout: measure header, drop the per-page guess from main.
  - Index.css: add .min-h-page (100dvh minus header).
  - SiteNav: constant pill padding; a scrolled shrink would shift the page.
  - Research HeroSection: reserve the header inside its centered hero.
  - 22 pages: remove the hardcoded top paddings, min-h-screen -> min-h-page.
  - Verified in headless Chrome at 1440x900 and 390x844 over 15 routes with the live banner active: content clears the header on all of them, and the offset stays fixed while scrolling.

## [3.86.1] - 2026-10-18

### Fixed
- **Make student document buckets private (`app/src/lib/storage.ts, app/src/services/applications.ts, app/src/services/teamApplications.ts, app/src/services/users.ts, supabase/migrations/064_private_student_files.sql`)**:
  - Resumes and team-resumes were public = true, so every file was fetchable by URL with no login at all. Reads are now scoped to the owner, platform admins, and a company the student applied to; team-resumes is admin-only and its anonymous upload/update/delete policies are removed (anyone with the public key could delete team resumes).
  - App side: uploads store the object name instead of a permanent public link and links are minted on demand via lib/storage.ts. Rows written before this hold full public URLs, which the helper still resolves, so no data migration is needed.
  - Deploy notes: ship the frontend build BEFORE applying this migration, since it flips the buckets private and invalidates the old public links. offer-letters and task-documents stay public on purpose: offer_letters has its own 'public read' table policy that the public /verify page depends on, so that needs a code-keyed lookup first.

## [3.86.0] - 2026-10-18

### Fixed
- **Require a caller token for send-notification-email (`supabase/functions/send-notification-email/index.ts`)**:
  - The function trusted the userId in the request body and sent mail with the service role, so whoever reached it could email any user. It now verifies the caller's session through a user-scoped client and returns 401 without one. The only caller is the browser (services/notificationsSim.ts), which already sends the session token.
  - Shortcut: this proves a logged-in user is asking, not that they may notify that recipient. The real check lands when notifications move server-side and this function becomes service-role-only.

## [3.85.5] - 2026-10-18

### Fixed
- **Block anonymous reads of profiles (`supabase/migrations/063_restrict_profiles_read.sql`)**:
  - The SELECT policy was USING (true) for every role, so anyone holding the public anon key could read all 237 rows including email, phone and resume_url. No anonymous page queries profiles, and the only anon-executable function (expire_stale_offers) is SECURITY DEFINER and never touches the table.
  - Verified on a replayed schema: anon now gets 'permission denied for table profiles' while authenticated reads are unchanged.

## [3.85.4] - 2026-10-17

### Added
- **Add multi-command installation, markdown rendering, and live preview switcher (`app/scripts/generate-seo.js, app/src/components/tools/SubmitToolDialog.tsx, app/src/components/tools/ToolPreviewDialog.tsx, app/src/data/tools.ts, app/src/lib/database.types.ts`)**:
  - Add multi-command installation, markdown rendering, and live preview switcher.

## [3.85.3] - 2026-10-17

### Changed
- **Merge pull request #152 from ilyaskhan12Q/feat/tools-ux-redesign**:
  - Feat(tools): dedicated detail pages, recommendations, enhanced search & submission workflow.

## [3.85.2] - 2026-10-16

### Added
- **Eliminate AI-slop gradients & sparkles in favor of Linear/Vercel precision and Datadog command-center telemetry (`app/src/components/pricing/PlanStatusModal.tsx, app/src/components/pricing/SubscriptionPlanCard.tsx, app/src/components/pricing/UpgradePlanModal.tsx, app/src/hooks/useActivePlan.ts, app/src/layouts/DashboardLayout.tsx`)**:
  - Eliminate AI-slop gradients & sparkles in favor of Linear/Vercel precision and Datadog command-center telemetry.

## [3.85.1] - 2026-10-15

### Added
- **Add active plan indicators to sidebar, header dropdown, and settings (`app/src/components/pricing/PlanStatusModal.tsx, app/src/components/pricing/SubscriptionPlanCard.tsx, app/src/components/pricing/UpgradePlanModal.tsx, app/src/hooks/useActivePlan.ts, app/src/layouts/DashboardLayout.tsx`)**:
  - Add active plan indicators to sidebar, header dropdown, and settings.

## [3.85.0] - 2026-10-15

### Added
- **Phase 3 - audit log ledger with actor attribution, categorization, and metadata inspection (`app/src/pages/admin/Logs.tsx`)**:
  - Phase 3 - audit log ledger with actor attribution, categorization, and metadata inspection.

## [3.84.5] - 2026-10-15

### Added
- **Phase 2 - subscription breakdown, estimated MRR, and AI gateway compute telemetry (`app/src/pages/admin/Analytics.tsx, app/src/pages/admin/Dashboard.tsx`)**:
  - Phase 2 - subscription breakdown, estimated MRR, and AI gateway compute telemetry.

## [3.84.4] - 2026-10-15

### Added
- **Phase 1 - user management modal, role switching, plan tier overrides, and suspension workflow (`app/src/components/admin/ManageUserModal.tsx, app/src/pages/admin/Users.tsx`)**:
  - Phase 1 - user management modal, role switching, plan tier overrides, and suspension workflow.

## [3.84.3] - 2026-10-15

### Added
- **Phase 0 - admin governance, privilege protection, and suspension enforcement (`app/src/components/ProtectedRoute.tsx, app/src/lib/database.types.ts, app/src/services/users.ts, supabase/migrations/061_admin_security_and_governance.sql`)**:
  - Phase 0 - admin governance, privilege protection, and suspension enforcement.

## [3.84.2] - 2026-10-14

### Added
- **Add in-app plan upgrade modal for authenticated users (`app/src/components/pricing/UpgradePlanModal.tsx, app/src/pages/public/Pricing.tsx`)**:
  - Add in-app plan upgrade modal for authenticated users.

## [3.84.1] - 2026-10-14

### Changed
- **Migrate pricing cards, toggles, comparison table, and FAQ to semantic design tokens (`app/src/components/pricing/BillingToggle.tsx, app/src/components/pricing/PricingCard.tsx, app/src/pages/public/Pricing.tsx`)**:
  - Migrate pricing cards, toggles, comparison table, and FAQ to semantic design tokens.

## [2.84.0] - 2026-10-14

### Added
- **Centralize eye-comfortable color tokens and expose zyro palette (`app/src/index.css, app/tailwind.config.js`)**:
  - Centralize eye-comfortable color tokens and expose zyro palette.

## [2.83.5] - 2026-10-14

### Added
- **Add billing help page, audience toggle, and navigation routing (`app/src/App.tsx, app/src/components/pricing/AudienceToggle.tsx, app/src/components/pricing/BookDemoModal.tsx, app/src/config/navigation.ts, app/src/pages/public/BillingHelp.tsx`)**:
  - Add billing help page, audience toggle, and navigation routing.

## [2.83.4] - 2026-10-14

### Added
- **Add unified ZYR0 pricing page and update navbar (`app/src/App.tsx, app/src/components/nav/SiteNav.tsx, app/src/components/pricing/BillingToggle.tsx, app/src/components/pricing/BookDemoModal.tsx, app/src/components/pricing/PricingCard.tsx`)**:
  - Add unified ZYR0 pricing page and update navbar.

## [2.83.3] - 2026-10-13

### Added
- **Refine tool detail content layout, add recommendations, and enhance submission form (`app/src/components/tools/SubmitToolDialog.tsx, app/src/pages/public/ToolDetail.tsx`)**:
  - Refine tool detail content layout, add recommendations, and enhance submission form.

## [2.83.2] - 2026-10-13

### Added
- **Dedicated /tools/:slug detail pages + enhanced search + SSG + sitemap (`app/scripts/generate-seo.js, app/src/App.tsx, app/src/components/tools/ToolCard.tsx, app/src/components/tools/ToolPreviewDialog.tsx, app/src/pages/public/ToolDetail.tsx`)**:
  - Phase 1 - Directory UX:.
  - Expand search to match author name and capabilities (ToolHub.tsx).
  - ToolCard primary action navigates to /tools/:slug instead of modal.
  - Phase 2 - Dedicated Detail Route:.
  - Create ToolDetail.tsx: breadcrumb, hero band, metadata strip, about, terminal install block, capabilities bento grid, links sidebar, related tools, 404 fallback -- zero new dependencies.
  - Add getToolBySlug(slug) to services/tools.ts (approved-only, null-safe).
  - Register /tools/:slug route in App.tsx with lazy load.
  - Add Full Page link to ToolPreviewDialog.
  - Phase 3 - SEO + SSG Pipeline:.
  - Add ToolHub to llms.txt for AI crawler discovery.
  - Extend writeEnhancedSitemap() to include approved tool slugs with updated_at lastmod dates.
  - Add tools fetch + prerender loop in prerenderDynamicPages(): generates dist/tools/:slug/index.html with SoftwareApplication and BreadcrumbList JSON-LD schema.

## [2.83.1] - 2026-10-13

### Changed
- **Delete dead nav/ui components (`app/src/components/navigation/CommunitySocialNav.tsx, app/src/components/ui/aspect-ratio.tsx, app/src/components/ui/breadcrumb.tsx, app/src/components/ui/button-group.tsx, app/src/components/ui/context-menu.tsx`)**:
  - CommunitySocialNav (unreferenced after nav unification).
  - 16 unused shadcn ui primitives (menubar, breadcrumb, dropdown-menu, scroll-area, etc.) — regenerable from shadcn if needed.

## [2.83.0] - 2026-10-13

### Fixed
- **Dark-glass pill over hero, banner no longer pushes content (`app/src/components/SiteBannerBar.tsx, app/src/components/nav/SiteNav.tsx, app/src/config/navigation.ts, app/src/layouts/PublicLayout.tsx`)**:
  - SiteNav: revert to dark translucent glass pill (the "/" look) so the hero background bleeds through instead of a separate light box; white text/toggles/hamburger throughout; remove full-width backdrop band.
  - Navigation: icons on Company dropdown (Building2/Mail/Briefcase).
  - PublicLayout: drop banner-driven paddingTop on main — fixed banner+pill now purely overlay the hero; pages keep their own top padding.
  - SiteBannerBar: make onVisibilityChange optional.

## [2.82.5] - 2026-10-13

### Changed
- **Unify all navs/footers into one SiteNav + SiteFooter (`app/src/App.tsx, app/src/components/nav/CompanyDropdown.tsx, app/src/components/nav/Header.tsx, app/src/components/nav/PlatformFooter.tsx, app/src/components/nav/PlatformNav.tsx`)**:
  - New config/navigation.ts single source of truth (live routes only).
  - New SiteNav: theme-aware pill, desktop dropdowns, mobile sheet with accordions, role-aware account menu, full aria.
  - New SiteFooter: merged columns, newsletter (TODO: wire backend).
  - PublicLayout slims to banner + SiteNav + Outlet + SiteFooter.
  - Move /, /studio, /school, /edu, /research, 404 and subdomain gateways under PublicLayout chrome.
  - Delete Header, PlatformNav, PlatformFooter, ResearchNav, ResearchFooter, 3 dropdowns, dead data.ts (~2700 lines removed).

## [2.82.4] - 2026-10-12

### Fixed
- **Pillar badge chips invisible in light mode (`app/src/components/ui/timeline.tsx`)**:
  - Hardcoded border-white/10 bg-white/5 text-white/70 on a white --zyro-bg section; switch to zyro border/surface/text tokens.

## [2.82.3] - 2026-10-12

### Fixed
- **Hoist FieldError out of SubmitToolDialog render (`app/src/components/tools/SubmitToolDialog.tsx`)**:
  - React-hooks/static-components: declaring the component inside the function body recreated it every render; move to module scope.

## [2.82.2] - 2026-10-12

### Added
- **Skills section cards use the branded gradient hero (`app/src/components/platform-home/SkillsSection.tsx, app/src/components/ui/blog8.tsx`)**:
  - Blog8 media block (only consumer: Publish & install autonomous skills) matches ToolCard: coverGradient background, dot texture, initials watermark, label+title overlay; respects admin coverColor and image covers.

## [2.82.1] - 2026-10-12

### Added
- **Admin-customizable card hero color (cover_color) (`app/src/components/tools/SubmitToolDialog.tsx, app/src/lib/database.types.ts, app/src/services/tools.ts, supabase/migrations/060_add_tools_cover_color.sql`)**:
  - Add tools.cover_color column (060 migration).
  - SubmitToolDialog admin section: color picker + hex field + reset; live preview uses the picked gradient immediately.
  - Service layer: SubmitToolInput.cover_color, row mapping, insert payload (omitted when empty so pre-migration inserts still work).

## [2.82.0] - 2026-10-12

### Added
- **Branded gradient hero on cards + featured/directory parity (`app/src/components/tools/FeaturedToolCard.tsx, app/src/components/tools/ToolCard.tsx, app/src/components/tools/ToolPreviewDialog.tsx, app/src/data/tools.ts, app/src/pages/public/ToolHub.tsx`)**:
  - ToolCard media band matches ToolPreviewDialog: twilight->periwinkle-> sapphire gradient, dot texture, initials watermark, name+tagline overlay.
  - Featured Flagships render the same ToolCard in the same grid; drop FeaturedToolCard.
  - Shared coverGradient() helper in data/tools.ts (custom color-aware).

## [2.81.5] - 2026-10-12

### Fixed
- **Stop Lenis smooth-scroll leaking through dialog overlays (`app/src/components/ui/dialog.tsx, app/src/main.tsx`)**:
  - Darken overlay to bg-black/40 backdrop-blur-sm.
  - Track body[data-scroll-locked] and stop/start Lenis so modal scroll lock actually takes effect.

## [2.81.4] - 2026-10-11

### Added
- **Sonar-grid hero background, site mascot avatar, and security/CI config (`.github/dependabot.yml, .gitleaks.toml, app/package-lock.json, app/package.json, app/public/blusky-home-hero.svg`)**:
  - Add interactive SonarGrid wave background to ShaderHero.
  - Add SiteMascot avatar (bible-strong/avatar-react) mounted app-wide.
  - Add sonar-grid + molten-ring-carousel 21st.dev demos.
  - Add dependabot config and gitleaks config.

## [2.81.3] - 2026-10-08

### Changed
- **Harmonize SchoolOS landing with dynamic ZYR0 tokens and DM Serif Text (`app/src/components/products/edu/SchoolPerspectiveSwitcher.tsx, app/src/pages/edu/SchoolOSLanding.tsx`)**:
  - Harmonize SchoolOS landing with dynamic ZYR0 tokens and DM Serif Text.

## [2.81.2] - 2026-10-08

### Changed
- **Harmonize Studio landing with dynamic ZYR0 tokens and DM Serif Text (`app/src/components/products/studio/StudioPromptSimulator.tsx, app/src/pages/studio/StudioLanding.tsx`)**:
  - Harmonize Studio landing with dynamic ZYR0 tokens and DM Serif Text.

## [2.81.1] - 2026-10-08

### Changed
- **Harmonize Research landing with ZYR0 design system and DM Serif Text (`app/src/components/research-landing/AudienceSection.tsx, app/src/components/research-landing/EditorialStatement.tsx, app/src/components/research-landing/FinalCta.tsx, app/src/components/research-landing/LiveResearchSection.tsx, app/src/components/research-landing/ReportSection.tsx`)**:
  - Harmonize Research landing with ZYR0 design system and DM Serif Text.

## [2.81.0] - 2026-10-08

### Changed
- **Rename Landing to InternshipsLanding and harmonize design tokens (`app/src/App.tsx, app/src/pages/public/InternshipsLanding.tsx`)**:
  - Rename Landing to InternshipsLanding and harmonize design tokens.

## [2.80.5] - 2026-10-08

### Changed
- **Standardize PlatformHome design taste and clean up legacy sections (`app/src/components/platform-home/BentoProductGrid.tsx, app/src/components/platform-home/BlogPreviewSection.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/CountUp.tsx, app/src/components/platform-home/DeepDiveSection.tsx`)**:
  - Standardize PlatformHome design taste and clean up legacy sections.

## [2.80.4] - 2026-10-19

### Added
- **Peek the sidebar open when hovering the collapsed rail (`app/src/agent/components/AgentSidebar.tsx`)**:
  - Hovering the 48px rail slides the full panel out and leaving collapses it again after a 180ms grace period.
  - Peeking is separate from the pinned state: hovering never closes a pinned sidebar, and the page's content spacer still follows pinned state only.
  - The header close button dismisses a peek instead of pinning it open, and New Chat / history / Settings dismiss the peek after acting.
  - Desktop only (>=1024px); the mobile off-canvas behaviour is unchanged.

## [2.80.3] - 2026-10-18

### Added
- **Trim the About pane to WhatsApp support, log the release (`CHANGELOG.md, app/package.json, app/src/agent/components/AgentSettingsModal.tsx`)**:
  - Drop the Diagnostics section (debug-info copy) and the Source code link.
  - Report an issue now opens the ZYR0 WhatsApp community chat.
  - CHANGELOG: one entry per commit for PR #150 (30 entries), versions 2.75.3 -> 2.80.2 per the project's patch-then-minor scheme; header range updated to 0.38.3 -> 2.80.2 (186 commits).
  - Bump app/package.json 0.39.0 -> 2.80.2 (continues upstream 2.75.2) and refresh the About pane's What's new list.

## [2.80.2] - 2026-10-18

### Added
- **Make the panel shortcuts toggles (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/hooks/useAgentShortcuts.ts`)**:
  - Alt+S now closes the search box it opened (sidebar stays open) and Alt+L reopens the sidebar it closed, so the same keys open and close each panel. Alt+T was already a toggle; Alt+N stays a one-way action.
  - Hook actions become onToggleSearch/onToggleSidebar with closeSearch and openSidebar labels.
  - Search hint label is dynamic (Search / Close search); the collapsed rail chevron gains an 'Open sidebar Alt L' hint instead of a title.

## [2.80.1] - 2026-10-18

### Added
- **Keyboard shortcuts with hover hints, drop the quick-actions FAB (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentQuickActions.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/ShortcutHint.tsx, app/src/agent/components/TemporaryToggle.tsx`)**:
  - Replace the floating shortcut button with real shortcuts on the existing controls: Alt+N new chat, Alt+T temporary chat, Alt+S search, Alt+L close sidebar. Alt is used because browsers reserve Ctrl+N/T/L and never deliver those keydowns to the page.
  - New useAgentShortcuts hook (event.code matching, ref-held handlers, preventDefault, ignores auto-repeat).
  - New ShortcutHint tooltip showing the action plus kbd key caps on hover and keyboard focus; wired to New Chat (sidebar + rail), Temporary chat (header + hero), Search and Close sidebar; native titles removed there to avoid double tooltips.
  - Remove AgentQuickActions and its render; keep the lifted sidebar search state the Search shortcut needs.

## [2.80.0] - 2026-10-15

### Added
- **Floating quick-actions button with hover flyout (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentQuickActions.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/TemporaryToggle.tsx`)**:
  - Add a round bottom-right shortcut button that reveals the four most-used workspace actions on hover (click toggles it on touch):.
  - Close sidebar (hidden when already closed).
  - Search — unfolds a collapsed sidebar and focuses the search box.
  - Temporary chat — amber active state with checkmark.
  - New chat.
  - Sidebar search visibility is now controlled by the page so the button can reveal it; TemporaryGlyph is exported for reuse; Escape and click-away dismiss the menu, with an invisible bridge keeping hover alive across the button-to-menu gap.

## [2.79.5] - 2026-10-14

### Added
- **Render chat replies as markdown and answer conversationally (`app/src/agent/ResearchAgentPage.tsx`)**:
  - Assistant bubbles printed raw markdown verbatim (###, **, *) while streaming, so replies looked like messy pasted source text.
  - Render assistant messages with react-markdown + remark-gfm (both already app dependencies), styled like the report pane (prose + prose-invert in dark); user bubbles and errors stay plain text.
  - Typing cursor is now an inline block char appended to the streamed markdown so it sits at the end of the current line.
  - Chat SYSTEM_PROMPT: lead with the answer, light formatting, no encyclopedic sectioned dumps unless asked, natural ZYR0 voice.

## [2.79.4] - 2026-10-14

### Added
- **ChatGPT-style account section in settings (`app/src/agent/components/AgentSettingsModal.tsx`)**:
  - Identity hero with real profile photo (avatar_url) falling back to gradient initials, plus name and email.
  - Sign-in method row (Google / Email & password / ...) instead of the raw provider value.
  - Role row from the profile.
  - Edit-profile button navigating to the role's profile page.
  - Keep sign-out with its loading state; no unnecessary options added.

## [2.79.3] - 2026-10-14

### Added
- **Rich About section in settings with version, links and diagnostics (`app/src/agent/components/AgentSettingsModal.tsx, app/tsconfig.app.json`)**:
  - Brand hero card (gradient mark, ZYR0's Research Agent, tagline) with version chip read from package.json and environment chip.
  - 'What's new in vX' bullet list from an editable WHATS_NEW const.
  - Source-code / report-issue link rows (same repo URL) in new tabs.
  - Copy-debug-info button (version, env, model, user agent) with toast.
  - Enable resolveJsonModule for the package.json import.

## [2.79.2] - 2026-10-10

### Fixed
- **Voice input transcribes speech instead of fabricating it (`app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Both inputs had a hidden demo mode: when SpeechRecognition was missing or the mic check failed, they typed a canned 'quantum computing' sentence into the box as if the user had said it — so the agent answered questions the user never asked.
  - Remove the fake-text simulation; unsupported/denied mic now surfaces a toast.
  - Set recognition.lang from navigator.language (locale mismatch garbled words).
  - Restart recognition after silence pauses so sentences aren't cut off.
  - Ignore transient errors (no-speech/aborted); stop only on real failures.

## [2.79.1] - 2026-10-10

### Fixed
- **Always identify as ZYR0's Research Agent (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/classifyLocally.ts, app/src/agent/research/editorial.ts`)**:
  - Identity questions could slip into the research pipeline (whose planner/editorial prompts carry no ZYR0 identity) and the chat prompt was too thin to override the Gemini-first model chain's own pretrained identity, so 'who are you' sometimes answered 'Google agent'.
  - ClassifyLocally: isIdentityQuestion() routes identity questions to chat.
  - SYSTEM_PROMPT: explicit identity contract; handleSend pins an identity note on those questions like the attachment note.
  - Editorial prompt: reports are published for ZYR0's Research Agent.

## [2.79.0] - 2026-10-10

### Changed
- **Redo the delete-history confirmation popup (`app/src/agent/components/AgentSettingsModal.tsx`)**:
  - Red trash chip beside 'Delete all chat history.' and the undo warning tinted red so the destructive action reads as destructive.

## [2.78.5] - 2026-10-10

### Changed
- **Blue settings switches with a white thumb in both states (`app/src/agent/components/AgentSettingsModal.tsx, app/src/styles/agent.css`)**:
  - The bg-...! utilities were a no-op — Tailwind v3.4 doesn't turn the suffix into !important — so shadcn's bg-input/bg-primary rules won the specificity fight and the off state stayed gray.
  - Track colours move to agent.css where they outrank every shadcn variant: off is --ag-switch (pale brand blue in light, deep blue in dark), on is #1488fc, and the thumb is pinned white with a soft shadow so the knob reads against the blue in either theme.

## [2.78.4] - 2026-10-09

### Added
- **Confirmation popup for deleting chat history (`app/src/agent/components/AgentSettingsModal.tsx`)**:
  - The two-step confirm lived inline in the Data controls row. It is now a proper alertdialog layered over the settings sheet: warning copy, Cancel (default focus) and a red Delete everything button. Escape unwinds one layer at a time and is ignored mid-delete, and the backdrop can't dismiss a delete that's already running; failures keep the popup open with a retry message.

## [2.78.3] - 2026-10-09

### Added
- **Keep Settings in the collapsed sidebar rail (`app/src/agent/components/AgentSidebar.tsx`)**:
  - The gear only existed in the expanded panel, so collapsing the sidebar hid it entirely. It now sits at the bottom of the 48px rail with the same border-t separator as the expanded layout, mirroring New Chat / History at the top.

## [2.78.2] - 2026-10-09

### Added
- **Light theme by default, and settings that act on the spot (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSettingsModal.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/ModeToggle.tsx`)**:
  - Light mode is now the workspace default, and Settings → General carries a Light/Dark switch that persists.
  - The palette moves to --ag-* tokens in agent.css: a light block on .agent-root, the original Ray palette under data-ag-theme='dark'.
  - Tailwind's white/black resolve their channels through --color-white-rgb / --color-black-rgb (config + :root vars, identical values everywhere else), and the agent's light scope re-points white to ink — so text-white, bg-white/5, border-white/10, ring-white/[.08] flip with the theme instead of staying white-on-white; brand accents keep their literal colours, and the few palette text colours that would wash out on white are re-pointed in light scope.
  - Translucent surfaces get dedicated alpha tokens: Tailwind silently drops /60-style modifiers on var() colours, which would have left the sticky headers, mode track and mobile opener transparent.
  - Report prose drops prose-invert in light, and the shadcn switches are pinned so they can't inherit the platform's html.dark.
  - Settings options that previously only took effect on the next new chat or research run — and so read as dead switches — now act immediately on the open workspace (or toast when they defer), every action confirms through the route's sonner Toaster, Restore defaults resets theme, mode, temporary, depth, plan review and model in one go, and a failed sign-out reports instead of failing silently.

## [2.78.1] - 2026-10-09

### Added
- **Working ChatGPT-style settings sheet (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentSettingsModal.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/lib/preferences.ts`)**:
  - The sidebar's Settings button was a dead control. It now opens a modal with a section rail and every option wired to real workspace state.
  - General: default chat mode, temporary-by-default for new threads and a restore-defaults action — preferences persist in localStorage through the new @/agent/lib/preferences module.
  - Research: default depth (applies wherever depth is picked) and the plan-review switch driving the pipeline's skip-review preference.
  - Model: Auto + enabled-model radio list that writes the real gateway selection, with provider/context/price detail.
  - Data controls: export the thread + report as Markdown, clear the current conversation, and a two-step delete-all that removes the account's agent_researches rows (messages cascade) and free-floating messages, then refreshes the sidebar and opens a clean workspace; failures keep the confirm step with an error.
  - Account: identity from useAuth and a real Supabase sign-out; About with workspace/environment/storage notes.
  - The sheet closes on Esc, backdrop click or X, and collapses the rail to horizontal tabs on mobile.

## [2.78.0] - 2026-10-09

### Added
- **Icon-only temporary toggle in the top-right corner (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/TemporaryToggle.tsx`)**:
  - ChatGPT keeps temporary chat as an unlabelled control in the top-right; ours sat in the top-left and carried the word.
  - Render it as a round icon-only button (36px, matching the mode pills), moving it into the hero's top-right group beside History and to the far right of the thread header, past the status pill.
  - Drop the visible "Temporary" text; the name now lives on aria-label and the hover title, so it is still announced and still explained.
  - Replace the lucide ghost with a custom glyph: speech bubble crossed by a slash, stroked with a state-aware gradient (quiet gray when off, amber with a glow and amber ring when on).
  - Drop History' py-3 to py-2.5 so it lines up with the 36px neighbour.

## [2.77.5] - 2026-10-08

### Added
- **Temporary chat that never touches history (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/TemporaryToggle.tsx, app/src/agent/hooks/useAgentChat.ts, app/src/agent/hooks/useResearchPipeline.ts`)**:
  - Add a ChatGPT-style Temporary switch in the top-left of the chat bar (thread header and the empty-state hero). While it is on, the conversation exists only in memory:.
  - UseAgentChat takes persistHistory; when false it skips persistUser and persistAssistant, so no agent_researches row and no agent_messages rows are written for the chat path.
  - UseResearchPipeline takes the same flag and skips its persist()/history refresh, so a completed run is surfaced but not saved (and the "could not save this run" error is gated with it).
  - Flipping the switch in either direction starts a clean thread, so a temporary conversation never leaks into normal history and leaving the mode does not carry the unsaved thread along.

## [2.77.4] - 2026-10-08

### Added
- **Move sidebar search into a top-bar button (`app/src/agent/components/AgentSidebar.tsx`)**:
  - The search field occupied a permanent bordered bar under New Chat even though it is used occasionally. Move it out of the layout:.
  - Add a search icon button to the top row, beside the close button, with an active state and aria-expanded/aria-controls.
  - Delete the always-visible bar; the same input now appears at the top of the sidebar on demand, auto-focused, filtering as before.
  - Escape or re-clicking the button closes it and clears the query, so the list falls back to showing everything.

## [2.77.3] - 2026-10-08

### Added
- **Premium gradient icons for Recent list items (`app/src/agent/components/AgentSidebar.tsx`)**:
  - The history rows used flat lucide glyphs (blue FileText for research, gray MessageSquare for chat), which read as placeholders next to the gradient header icon.
  - ResearchItemIcon: document with folded corner and rule, stroked blue-to-violet with a soft glow.
  - ChatItemIcon: speech bubble, stroked emerald-to-blue with a mint glow.
  - Both 14px, round caps, aria-hidden, gradient ids namespaced so they cannot collide with the Recent header mark.
  - Drop the now-unused FileText / MessageSquare imports.

## [2.77.2] - 2026-10-07

### Added
- **Collapsible Recent section and the ZYR0 Research mark (`app/src/agent/components/AgentSidebar.tsx`)**:
  - Sidebar header polish, three parts:.
  - The "Recent" label becomes a dropdown button that shows and hides the history list (chevron rotates 90deg, aria-expanded/aria-controls wired up, loading and empty states collapsed with it), starting open.
  - The section gets a custom SVG icon: the history clock stroked with the blue-to-violet gradient plus a soft glow, so it reads as a premium affordance instead of a bare uppercase label.
  - The ZYRO Studio mark is replaced by the ZYR0 Research mark from /logos/research.png, scaled to 140% and nudged up 5.5% so the sphere fills the box while the baked-in wordmark stays clipped out; the collapsed rail's label follows suit ("ZYR0 Research").

## [2.77.1] - 2026-10-07

### Added
- **Enlarge and brighten the add-photo button (`app/src/agent/components/ThreadInput.tsx`)**:
  - The attachment button was a dim, 28px ghost icon that disappeared against the dark composer and sat flush against the mic/send circle.
  - Grow it to 36px with an 18px glyph.
  - Give it a solid white disc, shadow and a hover/press scale so it reads as the primary affordance in the row.
  - Add mr-2 so there is 16px of air between it and the voice/send button.
  - Label it for assistive tech ("Add photos"), which had no accessible name.

## [2.77.0] - 2026-10-07

### Fixed
- **Brand the sidebar as ZYR0 Research (`app/src/agent/components/AgentSidebar.tsx`)**:
  - The workspace is a separate product from the marketing site, so the rail should say what it is: "ZYR0 Research" next to the studio mark, matching the report PDF footer.

## [2.76.5] - 2026-10-07

### Fixed
- **Consolidate the sidebar toggles into the sidebar (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSidebar.tsx`)**:
  - Two controls were fighting over the same action: a chevron inside the sidebar and an ≡ button in the thread header (plus another on the hero), so closing the sidebar still left a second close button on screen.
  - Drop the ≡ toggle from the thread header and the hero, along with the AgentHero onToggleSidebar prop nobody else needs.
  - Give the sidebar a chevron in the collapsed rail (top of the 48px rail, above the ZYRO Studio mark) so the control still exists when closed.
  - Render a floating opener on mobile, where the closed rail is translated off-screen and would otherwise have no way back.
  - The thread header now only carries the Chat/Research selector and the status pill.

## [2.76.4] - 2026-10-07

### Fixed
- **Show the sidebar close button on desktop (`app/src/agent/components/AgentSidebar.tsx`)**:
  - The close control lived in the sidebar's top-right corner but carried lg:hidden, so it only ever rendered as the mobile drawer close and desktop users had no collapse button in the sidebar itself. Drop the breakpoint restriction (and add a title tooltip) so the chevron sits in the top-right of the sidebar at every size.

## [2.76.3] - 2026-10-07

### Added
- **Move the Chat/Research selector into the top bar (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/ModeToggle.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - The mode toggle belonged at the top of the chat bar, not floating over the composer. Extract it into a shared ModeToggle and render it in the header row of the thread (centred between the sidebar toggle and the status pill) and centred on the empty-state hero, so the mode is chosen before the first prompt is sent — which the composer-level control could never do.
  - Buttons are bigger (text-sm, px-4 py-2) and carry SVG icons: MessageSquare for Chat, Telescope for Research, with aria-pressed kept on both. The duplicate block is gone from ThreadInput, whose unused onModeChange prop goes with it.

## [2.76.2] - 2026-10-07

### Added
- **Move the Chat/Research mode pills above the composer (`app/src/agent/components/ThreadInput.tsx`)**:
  - The mode toggle sat below the input card, which reads as a footnote rather than a choice. Lift it above the composer (ChatGPT-style) so the mode is picked before the prompt is typed, give the pill group a faint backing so it reads as a control, and expose aria-pressed so assistive tech announces which mode is active.

## [2.76.1] - 2026-10-07

### Changed
- **Drop the duplicate New button from the thread header (`app/src/agent/ResearchAgentPage.tsx`)**:
  - The active-session header repeated a "+ New" action that already lives in the left sidebar above the Recent list. New Chat is now triggered from a single place, leaving the header to the sidebar toggle and status pill.

## [2.76.0] - 2026-10-07

### Fixed
- **Restore wheel/touchpad scrolling in the research workspace (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/main.tsx`)**:
  - Lenis smooth-scroll was swallowing every wheel event on /research-agent. The PUBLIC_PREFIXES check used startsWith('/research'), so the workspace route matched, and the instance was created once at app mount and never destroyed on navigation. Its wrapper is the window, which has nothing to scroll on the h-screen workspace, so its preventDefault() left the inner thread unable to scroll at all (finger touch still worked because syncTouch is off).
  - Match whole path segments so '/research' no longer matches '/research-agent'.
  - Create Lenis per public route and destroy it (and cancel its rAF) when the route changes, so it also stops leaking across SPA navigation.
  - Opt the thread, hero and sidebar history list out via data-lenis-prevent.
  - Pause the follow-the-reply pin synchronously on wheel/touch gestures, so a streaming render can no longer win the race and snap the view back.

## [2.75.5] - 2026-10-06

### Fixed
- **Use ZYR0 brand and add the ZYRO Studio logo to the sidebar (`app/src/agent/components/AgentSidebar.tsx, app/src/components/research-landing/EditorialStatement.tsx, app/src/components/research-landing/FinalCta.tsx, app/src/components/research-landing/ResearchFooter.tsx, app/src/components/research-landing/ResearchNav.tsx`)**:
  - The sidebar header read "ZYROO" while the rest of the product (README, headers, footers) ships as ZYR0; the same typo appeared in four research landing components.
  - Sidebar header shows the ZYRO Studio mark next to ZYR0, and the mark replaces the generic square icon in the collapsed rail.
  - StudioLogo crops /logos/studio.png to the circular mark so the baked-in wordmark (illegible and near-invisible on the dark rail) is clipped out.
  - ZYROO -> ZYR0 in ResearchNav, ResearchFooter, FinalCta, EditorialStatement.

## [2.75.4] - 2026-10-06

### Fixed
- **Follow the reply in the thread without blocking manual scrolling (`app/src/agent/ResearchAgentPage.tsx`)**:
  - The thread never scrolled to new content, so replies streamed off-screen while the user had to scroll manually.
  - Pin the thread to the bottom on every render (streaming tokens, evidence updates, reasoning-card growth, report chunks).
  - Pause following as soon as the user scrolls up with the wheel or a touch drag, so the reply can keep streaming while they read back.
  - Resume following when they return within 100px of the bottom.
  - Re-pin on send, research run/regenerate and history restore.
  - Overscroll-contain so touch scrolling does not chain to the page.

## [2.75.3] - 2026-10-06

### Fixed
- **Forward attachments with the message instead of dropping them (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx, app/src/agent/core/types.ts`)**:
  - ThreadInput accepted image attachments but only forwarded the text, so files were silently discarded and an attachments-only send fired an empty prompt that did nothing.
  - OnSend now forwards an AgentAttachment[] alongside the text.
  - Attachments compose into the outgoing message as "📎 Attached: <names>".
  - An attachments-only send falls back to a default prompt.
  - Attachments always take the chat path (the research pipeline cannot read files) and the model is told only file names are shared, so it must not invent contents it cannot see.

## [2.75.4] - 2026-10-05

### Added
- **ZYRO brand refresh — new seal, Agbalumo header, verification copy (`app/public/seal_ZYR0.png, app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts, app/src/lib/database.types.ts, app/src/pages/public/Verify.tsx`)**:
  - Replace seal.png with ZYRO Official Gold Seal Badge (transparent, sized to match QR).
  - Drop VERIFIED SECURE caption (now inside the seal).
  - Header: Awarded by ZYRO / ZYRO / tagline in Agbalumo #120159.
  - Dates print as Month Year; body copy: proactivity, company-first sentence, verified against the official ZYRO credential registry.
  - Signature block: ZYRO (Google-style wordmark).
  - Fix: verify page flagged revoked certificates as Verified Authentic.
  - Types: add certificates.start_date/end_date snapshot columns.

## [2.75.3] - 2026-10-05

### Added
- **Hide issue/expiry dates on letter, real expiry on /verify, auto-flip + owner-editable expiry (`app/src/components/OfferLetterDocument.tsx, app/src/lib/offerLetterConfig.ts, app/src/lib/offerLetterPdf.ts, app/src/pages/company/OfferLetters.tsx, app/src/pages/public/Verify.tsx`)**:
  - Remove Issued/Expires rows and date from term #3 in document + canvas PDF.
  - /verify: expired offers show amber inactive message; accepted-before-deadline stays verifiable.
  - Migration 059: expire_stale_offers() flips Pending/Sent past expires_at to Expired.
  - Accept flow refuses offers past the deadline.
  - Company owner can edit expiry date from offer modal.

## [2.75.2] - 2026-10-02

### Fixed
- **Refine layout, typography scale, vertical positioning, and body copy (`app/src/components/certificateTemplate.ts`)**:
  - Refine layout, typography scale, vertical positioning, and body copy.

## [0.71.4] - 2026-10-02

### Fixed
- **Replace scroll-shrinking island pill with persistent full-width navbar (`app/src/components/nav/Header.tsx`)**:
  - Replace scroll-shrinking island pill with persistent full-width navbar.

## [0.71.3] - 2026-10-02

### Fixed
- **Allow images.unsplash.com in CSP and optimize timeline image loading (`app/src/components/ui/timeline.tsx, app/vercel.json`)**:
  - Allow images.unsplash.com in CSP and optimize timeline image loading.

## [0.71.2] - 2026-10-02

### Added
- **Optimize mobile shape placement and seamless dissolve-converge transitions (`app/src/components/lineart/HeroLineArtCycle.tsx, app/src/components/ui/shader-hero.tsx`)**:
  - Optimize mobile shape placement and seamless dissolve-converge transitions.

## [0.71.1] - 2026-10-02

### Fixed
- **Avoid ref mutation during render in LineArtCanvas (`app/src/components/lineart/LineArtCanvas.tsx`)**:
  - Avoid ref mutation during render in LineArtCanvas.

## [0.71.0] - 2026-10-02

### Added
- **Integrate 3d line-art continuous cycle with light/dark mode support (`app/src/components/lineart/HeroLineArtCycle.tsx, app/src/components/lineart/LineArtCanvas.tsx, app/src/components/lineart/LineArtShowcase.tsx, app/src/components/lineart/index.ts, app/src/components/lineart/math.ts`)**:
  - Integrate 3d line-art continuous cycle with light/dark mode support.

## [0.70.5] - 2026-10-02

### Added
- **Replace timeline story with 4 Defensible Pillars and refine scroll alignment (`app/src/components/platform-home/FeatureHighlightStrip.tsx, app/src/components/ui/timeline.tsx, app/src/pages/public/PlatformHome.tsx`)**:
  - Replace timeline story with 4 Defensible Pillars and refine scroll alignment.

## [0.73.4] - 2026-10-01

### Added
- **Enable administrators to create, publish live, and feature tools and skills (`app/src/components/tools/SubmitToolDialog.tsx, app/src/pages/admin/Tools.tsx, app/src/services/tools.ts`)**:
  - Enable administrators to create, publish live, and feature tools and skills.

## [0.73.3] - 2026-10-01

### Changed
- **Remove all hardcoded tools and rely strictly on Supabase registry (`app/src/components/tools/ToolEmptyState.tsx, app/src/data/tools.ts, app/src/pages/public/ToolHub.tsx, app/src/services/tools.ts`)**:
  - Remove all hardcoded tools and rely strictly on Supabase registry.

## [0.73.2] - 2026-10-01

### Added
- **Wire /tools routing, platform navigation, and navbar dropdowns (`app/src/App.tsx, app/src/components/nav/Header.tsx, app/src/components/nav/ProductsDropdown.tsx, app/src/components/nav/ResourcesDropdown.tsx, app/src/components/platform-home/data.ts`)**:
  - Wire /tools routing, platform navigation, and navbar dropdowns.

## [0.73.1] - 2026-10-01

### Added
- **Add Student, Company, and Admin moderation dashboards for ToolHub (`app/src/layouts/DashboardLayout.tsx, app/src/pages/admin/AdminPortal.tsx, app/src/pages/admin/Tools.tsx, app/src/pages/company/CompanyPortal.tsx, app/src/pages/company/Tools.tsx`)**:
  - Add Student, Company, and Admin moderation dashboards for ToolHub.

## [0.73.0] - 2026-10-01

### Added
- **Add public /tools discovery catalog with search, filtering, and SEO prerendering (`app/scripts/generate-seo.js, app/src/pages/public/ToolHub.tsx`)**:
  - Add public /tools discovery catalog with search, filtering, and SEO prerendering.

## [0.72.5] - 2026-10-01

### Added
- **Add ToolCard, FeaturedToolCard, ToolPreviewDialog, SubmitToolDialog, and EmptyState components (`app/src/components/tools/FeaturedToolCard.tsx, app/src/components/tools/SubmitToolDialog.tsx, app/src/components/tools/ToolCard.tsx, app/src/components/tools/ToolEmptyState.tsx, app/src/components/tools/ToolPreviewDialog.tsx`)**:
  - Add ToolCard, FeaturedToolCard, ToolPreviewDialog, SubmitToolDialog, and EmptyState components.

## [0.72.4] - 2026-10-01

### Added
- **Add database schema, types, and service layer for ToolHub registry (`app/src/data/tools.ts, app/src/lib/database.types.ts, app/src/services/companyTeam.ts, app/src/services/tools.ts, supabase/migrations/058_create_tools.sql`)**:
  - Add database schema, types, and service layer for ToolHub registry.

## [0.72.3] - 2026-10-01

### Fixed
- **Eliminate duplicate category tags and titles on fallback cards (`app/src/components/blog/BlogCard.tsx`)**:
  - Eliminate duplicate category tags and titles on fallback cards.

## [0.72.2] - 2026-10-01

### Fixed
- **Resolve React Compiler useMemo memoization lint error in BlogPostDetail (`app/src/pages/public/BlogPostDetail.tsx`)**:
  - Resolve React Compiler useMemo memoization lint error in BlogPostDetail.

## [0.72.1] - 2026-10-01

### Added
- **Polish editorial UX, reading layout, TOC, and admin CMS publishing (`.gitignore, app/scripts/generate-seo.js, app/src/components/blog/BlogCard.tsx, app/src/components/blog/BlogCodeBlock.tsx, app/src/components/blog/BlogReadingProgress.tsx`)**:
  - Polish editorial UX, reading layout, TOC, and admin CMS publishing.

## [0.70.4] - 2026-09-30

### Added
- **Default the platform to light theme for the playground (`app/index.html, app/src/components/platform-home/PlaygroundShowcase.tsx, app/src/main.tsx`)**:
  - Set next-themes defaultTheme to light.
  - Drop the index.html script that cleared the stored theme each load.
  - Remove the hardcoded dark stage bg so #products inherits the theme.

## [0.70.3] - 2026-09-30

### Fixed
- **End the deck and release the page on phones (`app/src/components/ui/molten-ring-carousel.tsx`)**:
  - End the deck and release the page on phones.

## [0.70.2] - 2026-09-30

### Added
- **Restore molten ring carousel verbatim and unpin the playground (`app/src/components/platform-home/PlaygroundShowcase.tsx, app/src/components/ui/demo.tsx, app/src/components/ui/molten-ring-carousel.tsx`)**:
  - Restore molten ring carousel verbatim and unpin the playground.

## [0.70.1] - 2026-09-30

### Fixed
- **Read playground progress in the frame loop instead of on scroll (`app/src/components/platform-home/PlaygroundShowcase.tsx, app/src/components/ui/molten-ring-carousel.tsx`)**:
  - Read playground progress in the frame loop instead of on scroll.

## [0.70.0] - 2026-09-29

### Added
- **Pin playground carousel to scroll and adopt reference molten-ring component (`app/src/components/platform-home/PlaygroundShowcase.tsx, app/src/components/ui/molten-ring-carousel.tsx`)**:
  - Pin playground carousel to scroll and adopt reference molten-ring component.

## [0.69.5] - 2026-09-27

### Fixed
- **Resolve mobile touch scrolling and pointer capture blocking in liquid carousel (`app/src/components/platform-home/PlaygroundShowcase.tsx, app/src/components/ui/molten-ring-carousel.tsx`)**:
  - Resolve mobile touch scrolling and pointer capture blocking in liquid carousel.

## [0.69.4] - 2026-09-27

### Added
- **Add dynamic island navbar convergence on scroll and centered pill with full build validation (`app/public/images/products/developer.svg, app/public/images/products/research.svg, app/public/images/products/school.svg, app/public/images/products/skills.svg, app/public/images/products/studio.svg`)**:
  - Add dynamic island navbar convergence on scroll and centered pill with full build validation.

## [0.69.3] - 2026-09-27

### Added
- **Replace bento grid with WebGL2 molten ring playground carousel (`app/public/images/products/developer.svg, app/public/images/products/research.svg, app/public/images/products/school.svg, app/public/images/products/skills.svg, app/public/images/products/studio.svg`)**:
  - Add MoltenRingCarousel component with WebGL2 distance field liquid physics and hybrid navigation.
  - Add PlaygroundShowcase section with casual, approachable copy and sleek framed stage.
  - Add 6 high-res vector SVG product cover visuals with zero CORS latency.
  - Replace static BentoProductGrid on PlatformHome while maintaining backward compatibility.

## [0.75.1] - 2026-09-26

### Changed
- **Raise QR image above verification label (`app/src/components/certificateTemplate.ts`)**:
  - Raise QR image above verification label.

## [0.75.0] - 2026-09-26

### Added
- **Add director signature, transparent coordinator signature (`app/public/signatures/director.png, app/public/signatures/program-coordinator.png, app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts`)**:
  - Add director signature, transparent coordinator signature.

## [0.74.5] - 2026-09-25

### Added
- **Use seal.png image with SVG seal fallback (`app/public/seal.png, app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts`)**:
  - Use seal.png image with SVG seal fallback.

## [0.74.4] - 2026-09-25

### Added
- **Integrate program coordinator signature image (`app/src/components/CertificateDocument.tsx, app/src/components/certificateTemplate.ts`)**:
  - Integrate program coordinator signature image.

## [0.74.3] - 2026-09-25

### Changed
- **Engraved golden ZYRO seal and align verification labels (`app/src/components/certificateTemplate.ts`)**:
  - Engraved golden ZYRO seal and align verification labels.

## [0.74.2] - 2026-09-23

### Changed
- **Move cert meta to header, logo above heading, update tagline (`app/src/components/certificateTemplate.ts`)**:
  - Move cert meta to header, logo above heading, update tagline.

## [0.74.1] - 2026-09-23

### Changed
- **Align footer row and enlarge signature meta type (`app/src/components/certificateTemplate.ts`)**:
  - Align footer row and enlarge signature meta type.

## [0.74.0] - 2026-09-23

### Changed
- **Remove external logos, refine heading and signature lines (`app/src/components/certificateTemplate.ts`)**:
  - Remove external logos, refine heading and signature lines.

## [0.69.2] - 2026-09-23

### Changed
- **Tighten lead-in spacing and adjust mobile sticky layout (`app/src/components/platform-home/FeatureHighlightStrip.tsx, app/src/components/ui/timeline.tsx`)**:
  - Tighten lead-in spacing and adjust mobile sticky layout.

## [0.69.1] - 2026-09-23

### Added
- **Integrate timeline, blog, skills, and tabbed FAQ sections (`app/package-lock.json, app/package.json, app/src/components/platform-home/BlogPreviewSection.tsx, app/src/components/platform-home/FAQSection.tsx, app/src/components/platform-home/FeatureHighlightStrip.tsx`)**:
  - Why ZYR0: GSAP horizontal scroll timeline (lazy-loaded, sticky fix via overflow-x clip).
  - Blog preview: shadcn Blog7 with real posts.
  - Skills: Blog8 alternating rows with CTAs.
  - FAQ: tabbed knowledge-base explorer on existing accordion, ZYR0 content.

## [0.69.0] - 2026-09-23

### Changed
- **Redesign ecosystem section with asymmetric rail and clickable cards (`app/src/components/platform-home/SkillsSection.tsx`)**:
  - Redesign ecosystem section with asymmetric rail and clickable cards.

## [0.68.5] - 2026-09-22

### Changed
- **Implement full light and dark mode support across homepage sections (`app/src/components/platform-home/BlogPreviewSection.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/FAQSection.tsx, app/src/components/platform-home/FeatureHighlightStrip.tsx, app/src/components/platform-home/SkillsSection.tsx`)**:
  - Implement full light and dark mode support across homepage sections.

## [0.68.4] - 2026-09-22

### Changed
- **Fix footer and dark mode tokens from blue to neutral dark (`app/src/index.css`)**:
  - Fix footer and dark mode tokens from blue to neutral dark.

## [0.68.3] - 2026-09-22

### Added
- **Restore minimal and clear BentoProductGrid for screenshots and gifs (`app/src/components/platform-home/BentoProductGrid.tsx`)**:
  - Restore minimal and clear BentoProductGrid for screenshots and gifs.

## [0.68.2] - 2026-09-22

### Changed
- **Assemble restyled PlatformHome page flow and remove pricing and stats (`app/src/pages/public/PlatformHome.tsx`)**:
  - Assemble restyled PlatformHome page flow and remove pricing and stats.

## [0.68.1] - 2026-09-22

### Changed
- **Modernize FAQ accordion and create minimal statement CTA (`app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/FAQSection.tsx`)**:
  - Modernize FAQ accordion and create minimal statement CTA.

## [0.68.0] - 2026-09-22

### Added
- **Add latest blog preview section with editorial cards (`app/src/components/platform-home/BlogPreviewSection.tsx`)**:
  - Add latest blog preview section with editorial cards.

## [0.67.5] - 2026-09-22

### Added
- **Add Skills Marketplace section with featured community and official skills (`app/src/components/platform-home/SkillsSection.tsx`)**:
  - Add Skills Marketplace section with featured community and official skills.

## [0.67.4] - 2026-09-22

### Added
- **Add Linear-style horizontal feature highlight strip (01-04) (`app/src/components/platform-home/FeatureHighlightStrip.tsx, app/src/components/platform-home/WhyZyroSection.tsx`)**:
  - Add Linear-style horizontal feature highlight strip (01-04).

## [0.67.3] - 2026-09-22

### Added
- **Enrich bento grid with UI mockups, prompt bar, and feature badges (`app/src/components/platform-home/BentoProductGrid.tsx`)**:
  - Enrich bento grid with UI mockups, prompt bar, and feature badges.

## [0.67.2] - 2026-09-22

### Added
- **Upgrade partner marquee with authentic SVG logos (`app/src/components/platform-home/LogoWall.tsx`)**:
  - Upgrade partner marquee with authentic SVG logos.

## [0.67.1] - 2026-09-22

### Added
- **Restyle hero with clean dark background, Agbalumo wordmark, and animated tagline (`app/src/components/ui/shader-hero.tsx`)**:
  - Restyle hero with clean dark background, Agbalumo wordmark, and animated tagline.

## [0.67.0] - 2026-09-22

### Changed
- **Add Agbalumo/Sora font configuration and brand tokens (`app/index.html, app/src/index.css, app/tailwind.config.js`)**:
  - Add Agbalumo/Sora font configuration and brand tokens.

## [0.72.0] - 2026-09-19

### Added
- **Implement blog architecture, clean editorial layout, and admin CMS (`app/package-lock.json, app/package.json, app/scripts/generate-seo.js, app/src/App.tsx, app/src/components/nav/ResourcesDropdown.tsx`)**:
  - Implement blog architecture, clean editorial layout, and admin CMS.

## [0.66.5] - 2026-09-09

### Fixed
- **Make FALLBACK_ORDER lazy so env vars are read per-request (`supabase/functions/ai-gateway/index.ts`)**:
  - Make FALLBACK_ORDER lazy so env vars are read per-request.

## [0.66.4] - 2026-09-07

### Fixed
- **Fix stats count-up animation (`app/src/components/platform-home/StatsSection.tsx`)**:
  - Remove Reveal wrapper that was blocking CountUp's useInView trigger.
  - Section now renders immediately, CountUp animates on scroll into view.
  - Increased count duration to 2.5s for smoother animation.
  - Ref: PR#142.

## [0.66.3] - 2026-09-07

### Added
- **Add standalone stats section with upgraded visuals (`app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/StatsSection.tsx, app/src/components/platform-home/data.ts, app/src/pages/public/PlatformHome.tsx`)**:
  - New StatsSection component with glassmorphic card, accent-colored icons, and animated count-up numbers.
  - Updated stat labels to trust-focused copy: Integrated Products, Engineers Trust Us, Institutions Partnered, Dependable Uptime.
  - Corrected stat numbers: 1.0K+ users, 50+ partners.
  - Removed stats grid from CTASection (now focused CTA only).
  - Placed between WhyZyroSection and PricingSection.
  - Ref: PR#142.

## [0.66.2] - 2026-09-07

### Added
- **Add Why ZYR0 value proposition section (`app/src/components/platform-home/WhyZyroSection.tsx, app/src/pages/public/PlatformHome.tsx`)**:
  - New section between product grid and pricing: 'One platform. Every advantage.'.
  - 4 benefit cards with professional copy:.
  - Unified Ecosystem (interconnected products).
  - Verifiable Credentials (cryptographic proof-of-work).
  - Enterprise-Grade Scale (individual to institutional).
  - Accessible From Day One (free for students, guided onboarding).
  - Reuses existing Reveal.tsx animation and ZYR0 CSS variable system.
  - Responsive 4-col → 2-col → 1-col grid.
  - Ref: PR#142.

## [0.66.1] - 2026-09-07

### Added
- **Consolidate feature sections, upgrade bento grid (`app/src/components/platform-home/BentoProductGrid.tsx, app/src/pages/public/PlatformHome.tsx`)**:
  - Remove redundant DeepDiveSection and SolutionsSection from homepage (3 sections showing same 4 products → 1 focused section).
  - Upgrade BentoProductGrid placeholders: gradient backgrounds using product brand colors, proper Lucide icons instead of letter icons.
  - Cleaner visual hierarchy with product-colored icon containers.
  - Ponytail: DeepDiveSection.tsx and SolutionsSection.tsx left as dead code — no other imports. Delete when comfortable.
  - Ref: PR#142.

## [0.66.0] - 2026-09-07

### Added
- **Replace fake LogoWall with real AI & infra partners (`app/src/components/platform-home/LogoWall.tsx, app/src/index.css`)**:
  - Replace 10 fabricated company names with 7 real technology partners.
  - OpenAI, Anthropic, DeepSeek, Cloudflare, Google, Vercel, Supabase.
  - Brand-colored text logos with hover glow + scale effect.
  - Updated section label to 'Powered by industry-leading technology'.
  - Removed placeholder Unicode symbols, clean text-only logos.
  - Added partner-item CSS hover with brand color, scale, drop-shadow.
  - Ref: PR#142.

## [0.65.5] - 2026-09-05

### Fixed
- **Dynamic-import MeshGradient into lazy chunk to prevent desktop freeze (`app/src/components/ui/shader-hero.tsx`)**:
  - Dynamic-import MeshGradient into lazy chunk to prevent desktop freeze.

## [0.65.4] - 2026-09-05

### Fixed
- **Isolate recharts into lazy chunk, keep vendor-common for shared deps (`app/vite.config.ts`)**:
  - Isolate recharts into lazy chunk, keep vendor-common for shared deps.

## [0.65.3] - 2026-09-05

### Fixed
- **Remove try/catch around JSX, use static MeshGradient import (`app/src/components/ui/shader-hero.tsx`)**:
  - Remove try/catch around JSX, use static MeshGradient import.

## [0.65.2] - 2026-09-05

### Fixed
- **Defer Lenis init to useEffect, add vendor chunks (`app/src/components/ui/shader-hero.tsx, app/src/pages/public/About.tsx, app/vite.config.ts`)**:
  - Defer Lenis init to useEffect, add vendor chunks.

## [0.65.1] - 2026-09-05

### Fixed
- **Remove dead react-icons dependency (`app/package-lock.json, app/package.json`)**:
  - Remove dead react-icons dependency.

## [0.65.0] - 2026-09-05

### Fixed
- **Defer Lenis init to useEffect, add vendor chunks (`app/src/main.tsx, app/vite.config.ts`)**:
  - Defer Lenis init to useEffect, add vendor chunks.

## [0.64.5] - 2026-09-05

### Fixed
- **Replace motion with m in 97 files for LazyMotion (`app/src/agent/ResearchAgentPage.tsx, app/src/components/SiteBannerBar.tsx, app/src/components/company/tasks/MasterDeliverablesList.tsx, app/src/components/company/tasks/TaskBulkActionBar.tsx, app/src/components/company/tasks/TaskCardGrid.tsx`)**:
  - Replace motion with m in 97 files for LazyMotion.

## [0.64.4] - 2026-09-05

### Fixed
- **Wrap ShaderHero in ErrorBoundary with CSS fallback (`app/src/components/ui/shader-hero.tsx`)**:
  - Wrap ShaderHero in ErrorBoundary with CSS fallback.

## [0.64.3] - 2026-09-05

### Fixed
- **Revert to catch-all rewrite for SPA routing (`app/vercel.json`)**:
  - Revert to catch-all rewrite for SPA routing.

## [0.64.2] - 2026-09-05

### Fixed
- **Add IndexNow reference for faster Bing indexing (`app/scripts/generate-seo.js`)**:
  - Add IndexNow reference for faster Bing indexing.

## [0.64.1] - 2026-09-05

### Fixed
- **Remove unsafe-eval from CSP header (`app/vercel.json`)**:
  - Remove unsafe-eval from CSP header.

## [0.64.0] - 2026-09-05

### Fixed
- **Add SoftwareApplication schema for platform entity (`app/scripts/generate-seo.js`)**:
  - Add SoftwareApplication schema for platform entity.

## [0.63.5] - 2026-09-05

### Fixed
- **Expand product page descriptions for crawlers (`app/scripts/generate-seo.js`)**:
  - Add 300+ words of pre-rendered SSR content for /studio, /school, and /research routes. Previously these pages returned empty text to crawlers, causing thin content issues.
  - Also added staticPagesMeta entries with optimized titles, descriptions, and BreadcrumbList schema for each product page.
  - Closes SEO audit finding #6.

## [0.63.4] - 2026-09-05

### Fixed
- **Improve Organization schema with ImageObject logo (`app/scripts/generate-seo.js`)**:
  - Change Organization logo from bare URL string to ImageObject format.
  - Add inLanguage: 'en' to WebSite schema.
  - Add Twitter/X to sameAs array.
  - Update descriptions to match new ecosystem positioning.
  - Closes SEO audit finding #5.

## [0.63.3] - 2026-09-05

### Fixed
- **Upgrade HSTS header with includeSubDomains and preload (`app/vercel.json`)**:
  - Add Strict-Transport-Security header with max-age=63072000, includeSubDomains, and preload directives. Prevents subdomain hijacking and enables HSTS preload list submission.
  - Closes SEO audit finding #3.

## [0.63.2] - 2026-09-05

### Fixed
- **Update branding, add llms.txt reference, trim meta description (`app/index.html, app/scripts/generate-seo.js`)**:
  - Update homepage title to 'ZYR0 — Think. Build. Scale to ∞.'.
  - Update homepage description to match new ecosystem positioning.
  - Update homepage pre-rendered content with new product messaging.
  - Add <link rel='alternate'> for llms.txt AI discovery.
  - Update llms.txt content with new product descriptions.
  - Trim meta description from 204 to 148 characters.
  - Closes SEO audit findings #3, #7, #9.

## [0.63.1] - 2026-09-05

### Fixed
- **Configure proper 404 handling in Vercel (`app/vercel.json`)**:
  - Replace catch-all rewrite with explicit route rewrites for known SPA paths and add a catch-all route returning 404 for unknown paths. Previously all unknown URLs returned HTTP 200 with index.html, wasting crawl budget and creating index bloat.
  - Also removed deprecated interest-cohort from permissions-policy.
  - Closes critical SEO audit finding #2.

## [0.63.0] - 2026-09-05

### Fixed
- **Add pre-rendered homepage content for crawlers (`app/scripts/generate-seo.js`)**:
  - Replace empty DOM placeholder with meaningful SSR content including H1 tag, value proposition, product summaries, CTAs, and trust signals. Googlebot now sees full homepage content on first crawl instead of a blank div element.
  - Closes critical SEO audit finding #1.

## [0.62.6] - 2026-09-02

### Changed
- **Update .gitignore with phases.md and SAAS_REBRAND_PLAN.md**:
  - Chore: update .gitignore with phases.md and SAAS_REBRAND_PLAN.md.

## [0.62.5] - 2026-09-02

### Fixed
- **Always show team role (Owner/Admin/HR Manager/Mentor/Reviewer) in profile dropdown**:
  - Fix(dashboard): always show team role (Owner/Admin/HR Manager/Mentor/Reviewer) in profile dropdown.

## [0.62.4] - 2026-09-02

### Fixed
- **Generate fresh token on each resend (invalidate old tokens)**:
  - Fix(invite): generate fresh token on each resend (invalidate old tokens).

## [0.62.3] - 2026-09-02

### Fixed
- **Block company owner from inviting themselves via client-side check**:
  - Fix(invite): block company owner from inviting themselves via client-side check.

## [0.62.2] - 2026-09-02

### Fixed
- **Accept_company_invite verifies invited email matches logged-in user + blocks owner**:
  - Fix(rpc): accept_company_invite verifies invited email matches logged-in user + blocks owner.

## [0.62.1] - 2026-09-02

### Fixed
- **CanAccessTab returns false when memberRole is null for non-owners**:
  - Fix(company-access): canAccessTab returns false when memberRole is null for non-owners.

## [0.62.0] - 2026-09-02

### Changed
- **Merge pull request #138 from ilyaskhan12Q/fix-company-invite-workflow**:
  - Merge pull request #138 from ilyaskhan12Q/fix-company-invite-workflow.

## [0.61.15] - 2026-09-02

### Fixed
- **Add missing cache policy aliases for count keys (use 60s TTL instead of 5s)**:
  - Fix(sidebar): add missing cache policy aliases for count keys (use 60s TTL instead of 5s).

## [0.61.14] - 2026-09-02

### Fixed
- **Refresh cache-first on mount + visibilitychange listener for tab-return**:
  - Fix(sidebar): refresh cache-first on mount + visibilitychange listener for tab-return.

## [0.61.13] - 2026-09-02

### Added
- **Add useRefreshOnFocus for tab-return refresh on student and company pages**:
  - Feat(hooks): add useRefreshOnFocus for tab-return refresh on student and company pages.

## [0.61.12] - 2026-09-02

### Fixed
- **Remove 'student' fallback from all nav components — use profile.role or null + loading guard**:
  - Fix(public-nav): remove 'student' fallback from all nav components — use profile.role or null + loading guard.

## [0.61.11] - 2026-09-02

### Fixed
- **Add missing profileLoaded guard in AuthContext before navigating**:
  - Fix(profile): add missing profileLoaded guard in AuthContext before navigating.

## [0.61.10] - 2026-09-02

### Fixed
- **Remove 'student' fallback in PublicOnlyRoute — show loader until profile loads**:
  - Fix(profile): remove 'student' fallback in PublicOnlyRoute — show loader until profile loads.

## [0.61.9] - 2026-09-02

### Fixed
- **Login.tsx waits for profileLoaded before navigating to prevent stale role redirect**:
  - Fix(auth): Login.tsx waits for profileLoaded before navigating to prevent stale role redirect.

## [0.61.8] - 2026-09-02

### Fixed
- **One-time data fix to promote team members' profiles to 'company' role + add RPC**:
  - Fix(invite): one-time data fix to promote team members' profiles to 'company' role + add RPC.

## [0.61.7] - 2026-09-02

### Fixed
- **Accept_company_invite RPC now updates profiles.role to 'company' on accept**:
  - Fix(invite): accept_company_invite RPC now updates profiles.role to 'company' on accept.

## [0.61.6] - 2026-09-02

### Changed
- **Re-enable ESLint in CI workflow**:
  - Chore(ci): re-enable ESLint in CI workflow.

## [0.61.5] - 2026-09-02

### Changed
- **Add indexes for profiles, applications, tasks, events, and certificates queries**:
  - Perf(db): add indexes for profiles, applications, tasks, events, and certificates queries.

## [0.61.4] - 2026-09-02

### Changed
- **Parallelize tasks, certificates, and events fetches with Promise.allSettled**:
  - Perf(workspace): parallelize tasks, certificates, and events fetches with Promise.allSettled.

## [0.61.3] - 2026-09-02

### Changed
- **Throttle mousemove via ref + rAF, single MeshGradient, Lenis on public routes only**:
  - Perf(shader): throttle mousemove via ref + rAF, single MeshGradient, Lenis on public routes only.

## [0.61.2] - 2026-09-02

### Changed
- **Self-host Inter, Agbalumo, DM Serif Text as woff2 with font-display:swap**:
  - Perf(fonts): self-host Inter, Agbalumo, DM Serif Text as woff2 with font-display:swap.

## [0.61.1] - 2026-09-02

### Added
- **Add configurable timeouts to all data-fetch pages, AuthContext, ErrorBoundary**:
  - Feat(timeout): add configurable timeouts to all data-fetch pages, AuthContext, ErrorBoundary.

## [0.61.0] - 2026-08-29

### Added
- **SaaS ecosystem rebrand — homepage redesign, animations, nav update**:
  - Feat: SaaS ecosystem rebrand — homepage redesign, animations, nav update.

## [0.60.5] - 2026-08-28

### Fixed
- **Resolve TypeScript build errors in shader hero (`app/src/components/platform-home/Reveal.tsx, app/src/components/ui/shader-hero.tsx`)**:
  - Reveal.tsx: use type-only import for ReactNode (verbatimModuleSyntax).
  - Shader-hero.tsx: remove invalid backgroundColor and wireframe props from MeshGradient.
  - Shader-hero.tsx: fix framer-motion ease type (use cubic bezier array instead of string).

## [0.60.4] - 2026-08-28

### Added
- **Integrate shader hero with MeshGradient background (`app/package-lock.json, app/package.json, app/src/App.tsx, app/src/components/ui/shader-hero.tsx, app/src/pages/demo/ShaderHeroDemo.tsx`)**:
  - Installed @paper-design/shaders-react for MeshGradient.
  - Created shader-hero.tsx with animated gradient background, letter-by-letter title, mouse-tracking spotlight, and 3 CTAs (Register, Products, Contact).
  - Title: ZYR0 (massive) + Think. Build. Scale to ∞. (animated tagline).
  - Subtitle: Action-focused product pillars.
  - Replaced HeroSection with ShaderHero on homepage.
  - Added /demo/shader-hero route for standalone demo.

## [0.60.3] - 2026-08-28

### Added
- **Add scroll animations and smooth scroll (`app/src/components/platform-home/BentoProductGrid.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/CountUp.tsx, app/src/components/platform-home/DeepDiveSection.tsx, app/src/components/platform-home/FAQSection.tsx`)**:
  - Installed Lenis for buttery smooth scroll (initialized in main.tsx).
  - Created Reveal.tsx — scroll-triggered fade/slide/scale wrapper using framer-motion useInView.
  - Created CountUp.tsx — animated number counter for stats.
  - HeroSection: staggered entry animation for badge, headline, subtitle, CTAs, screenshot.
  - BentoProductGrid: staggered card reveal with 80ms delay between cards.
  - DeepDiveSection: alternating left/right slide reveal for text/image blocks.
  - SolutionsSection: staggered card reveal with 80ms delay.
  - PricingSection: staggered card reveal with 100ms delay.
  - FAQSection: staggered item reveal with 50ms delay.
  - CTASection: scale+fade reveal with count-up stats animation.

## [0.60.2] - 2026-08-28

### Added
- **Add Company dropdown and update Products/Resources dropdowns (`app/src/components/nav/CompanyDropdown.tsx, app/src/components/nav/ProductsDropdown.tsx, app/src/components/nav/ResourcesDropdown.tsx, app/src/layouts/PublicLayout.tsx`)**:
  - Created CompanyDropdown with About, Contact, Careers, Verify Certificate.
  - Added ZYR0 Edu to ProductsDropdown.
  - Added Verify Certificate and Cookie Policy to ResourcesDropdown.
  - Updated PublicLayout desktop nav: Products | Research | Company | Resources.
  - Updated PublicLayout mobile nav with all routes.

## [0.60.1] - 2026-08-28

### Changed
- **Remove /0-ai route and ZeroAI module completely (`app/src/App.tsx, app/src/agent/ResearchAgentPage.tsx, app/src/agent/classifyLocally.ts, app/src/components/platform-home/DeepDiveSection.tsx, app/src/components/platform-home/data.ts`)**:
  - Moved classifyLocally to agent module (used by ResearchAgentPage).
  - Removed /0-ai route from App.tsx (both public and product route blocks).
  - Deleted components/zeroai/ (13 files).
  - Deleted pages/zeroai/ZeroAIWorkspace.tsx.
  - Deleted lib/zeroai/ (chat, intent, llm, planner).
  - Deleted hooks/useZeroAiKeys.ts, useZeroAiHistory.ts.
  - Deleted data/zeroAiFixtures.ts, zeroAiTypes.ts.
  - Deleted styles/zeroai.css.
  - Updated display text: removed '0-AI' from product names, descriptions, pricing.
  - Kept /research and /research-agent routes intact.

## [0.60.0] - 2026-08-28

### Added
- **Redesign homepage with Dovetail-inspired design system (`app/src/components/nav/Header.tsx, app/src/components/nav/PlatformFooter.tsx, app/src/components/platform-home/BentoProductGrid.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/DeepDiveSection.tsx`)**:
  - Typography: DM Serif Display + JetBrains Mono + Inter.
  - Color system: Indigo accent, CSS variables for light/dark adaptive.
  - Hero: Left-aligned display serif headline with product screenshot slot.
  - LogoWall: Continuous rolling marquee with logo icons.
  - BentoProductGrid: Size-as-hierarchy bento grid with image slots.
  - DeepDiveSection: Per-product narrative sections with alternating layouts.
  - SolutionsSection: Simplified 4-column row.
  - PricingSection: Theme-aware, no gradients.
  - FAQSection: Theme-aware accordion.
  - CTASection: Clean minimal CTA with stats.
  - Header: Redesigned with Products/Pricing/Resources/Company nav.
  - Footer: Premium 3-tier with newsletter strip, 4-column grid, social icons.

## [0.59.5] - 2026-08-27

### Added
- **Add Header component for product landing pages, restore original PublicLayout (`app/src/components/nav/Header.tsx, app/src/components/nav/ProductsDropdown.tsx, app/src/components/nav/ResourcesDropdown.tsx, app/src/components/ui/menu-toggle-icon.tsx, app/src/layouts/PublicLayout.tsx`)**:
  - Create Header.tsx with dark floating-pill nav and animated products mega-dropdown.
  - Create menu-toggle-icon.tsx (animated hamburger/X toggle).
  - PlatformHome, StudioLanding, SchoolOSLanding now use Header.
  - Restore full original PublicLayout (575-line inline nav/footer) for /internships routes.
  - Restore ProductsDropdown and ResourcesDropdown components.
  - ResearchLanding retains ResearchNav + ResearchFooter.

## [0.59.4] - 2026-08-27

### Fixed
- **Align BentoProductGrid product badge with data.ts (`app/src/components/platform-home/BentoProductGrid.tsx`)**:
  - Change Research card badge from 'AI Agent' to 'Deep AI Agent'.

## [0.59.3] - 2026-08-27

### Changed
- **Remove dead Framer components, legacy CSS, unused data (`SAAS_REBRAND_PLAN.md, app/src/components/nav/ProductsDropdown.tsx, app/src/components/nav/ResourcesDropdown.tsx, app/src/components/platform-home/BenefitsSection.tsx, app/src/components/platform-home/BlogSection.tsx`)**:
  - Delete 8 orphaned Framer-exported components (never imported).
  - Delete old PlatformNavbar/PlatformFooter from platform-home/.
  - Delete old ProductsDropdown/ResourcesDropdown from nav/.
  - Delete legacy platform-home.css (Framer token system).
  - Delete empty researchLandingDemo.ts.
  - Remove unused exports from data.ts (navLinks, hero, clientLogos, accentGradient).

## [0.59.2] - 2026-08-27

### Fixed
- **Add work.zyroo.org gateway, fix Landing SEO path (`app/src/App.tsx, app/src/pages/public/Landing.tsx`)**:
  - Add work.zyroo.org subdomain gateway with full internship routes.
  - Fix Landing.tsx SEO path from / to /internships.
  - Update breadcrumb structured data to reflect new page hierarchy.

## [0.59.1] - 2026-08-27

### Added
- **Unify navigation and footer across all pages (`app/src/components/nav/PlatformFooter.tsx, app/src/components/nav/PlatformNav.tsx, app/src/layouts/PublicLayout.tsx, app/src/pages/edu/SchoolOSLanding.tsx, app/src/pages/public/PlatformHome.tsx`)**:
  - Create shared PlatformNav with mega-dropdown, 4 products, auth controls.
  - Create shared PlatformFooter with 6-column layout, system status.
  - Replace PlatformNavbar + PublicLayout inline nav with PlatformNav.
  - Replace PlatformFooter (platform-home) + PublicLayout inline footer.
  - All pages now share consistent dark-themed navigation shell.

## [0.59.0] - 2026-08-27

### Fixed
- **Route / to PlatformHome, /internships to Landing, and /internships/browse to BrowseInternships (`app/src/App.tsx`)**:
  - Route / to PlatformHome, /internships to Landing, and /internships/browse to BrowseInternships.

## [0.58.5] - 2026-08-27

### Fixed
- **Correctly route /internships to Landing and /internships/browse to BrowseInternships with full link integration (`app/src/App.tsx, app/src/components/landing/AnimatedSearchMockup.tsx, app/src/components/landing/AudienceSplit.tsx, app/src/components/landing/JourneySection/journey-data.ts, app/src/components/landing/RoleChips.tsx`)**:
  - Correctly route /internships to Landing and /internships/browse to BrowseInternships with full link integration.

## [0.58.4] - 2026-08-27

### Fixed
- **Restore BrowseInternships at /internships and /internships/browse with URL query sync (`app/src/App.tsx, app/src/pages/public/BrowseInternships.tsx`)**:
  - Restore BrowseInternships at /internships and /internships/browse with URL query sync.

## [0.58.3] - 2026-08-27

### Fixed
- **Nest /internships route in PublicLayout to retain dedicated navbar (`app/src/App.tsx`)**:
  - Nest /internships route in PublicLayout to retain dedicated navbar.

## [0.58.2] - 2026-08-27

### Added
- **Integrate subdomain resolution and multi-product routes in App.tsx and SEO generator (`app/scripts/generate-seo.js, app/src/App.tsx`)**:
  - Integrate subdomain resolution and multi-product routes in App.tsx and SEO generator.

## [0.58.1] - 2026-08-27

### Added
- **Add school os product surface, perspective switcher, and roi calculator (`app/src/components/products/edu/SchoolPerspectiveSwitcher.tsx, app/src/pages/edu/SchoolOSLanding.tsx`)**:
  - Add school os product surface, perspective switcher, and roi calculator.

## [0.58.0] - 2026-08-27

### Added
- **Add zyr0 studio product surface, interactive ai prompt simulator, and lead service (`app/src/components/products/studio/StudioPromptSimulator.tsx, app/src/pages/studio/StudioLanding.tsx, app/src/services/leadService.ts`)**:
  - Add zyr0 studio product surface, interactive ai prompt simulator, and lead service.

## [0.57.5] - 2026-08-27

### Added
- **Add bento-grid product showcase, solutions, and streamlined sections (`app/src/components/platform-home/BentoProductGrid.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/FAQSection.tsx, app/src/components/platform-home/HeroSection.tsx, app/src/components/platform-home/PricingSection.tsx`)**:
  - Add bento-grid product showcase, solutions, and streamlined sections.

## [0.57.4] - 2026-08-27

### Added
- **Modernize platform navbar and footer with multi-product SaaS dropdown (`app/src/components/platform-home/PlatformFooter.tsx, app/src/components/platform-home/PlatformNavbar.tsx, app/src/components/platform-home/data.ts`)**:
  - Modernize platform navbar and footer with multi-product SaaS dropdown.

## [0.57.3] - 2026-08-27

### Changed
- **Add SaaS transition phases tracker (`phases.md`)**:
  - Add SaaS transition phases tracker.

## [0.55.5] - 2026-08-26

### Changed
- **Merge pull request #120 from ilyaskhan12Q/fix/agent-pipeline-optimizations**:
  - Feat(agent): optimize research pipeline with Gemini models.

## [0.57.2] - 2026-08-26

### Fixed
- **Strip all Framer Motion animation states that hide content (`app/src/components/platform-home/BenefitsSection.tsx, app/src/components/platform-home/BlogSection.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/FAQSection.tsx, app/src/components/platform-home/GlobalSection.tsx`)**:
  - The Suprema template bakes Framer Motion initial states into inline styles:.
  - Opacity: 0 / 0.001 on every section wrapper and hero heading letters.
  - Filter: blur(10px) on individual heading characters.
  - TranslateY(50px) on section containers Without Framer Motion running, all content stayed invisible (black screen).
  - Fix: set all opacity to 1, remove blur filters, remove translate animation offsets, remove willChange hints. Also fixed BenefitsSection unquoted opacity:0. Stripped ~185 animation states across 13 component files.

## [0.57.1] - 2026-08-26

### Fixed
- **Responsive variants, Suprema branding, footer links (`app/src/components/platform-home/BenefitsSection.tsx, app/src/components/platform-home/BlogSection.tsx, app/src/components/platform-home/FAQSection.tsx, app/src/components/platform-home/HeroSection.tsx, app/src/components/platform-home/PlatformFooter.tsx`)**:
  - Add missing CSS rules for .hidden-19w5p2z, .hidden-72rtr7, .hidden-jueq9p responsive variants (was causing 2-3x content duplication).
  - Replace all 'Suprema' references with 'ZYR0' across 6 component files.
  - Fix footer: copyright year 2024→2026, remove 'Powered by Framer', update email to support@zyroo.org.
  - Fix .html page links to React routes (/contact, /internships, etc.).
  - Fix truncated '24/7 Suppor' → '24/7 Support' in PricingSection.

## [0.57.0] - 2026-08-26

### Fixed
- **Fix React console warnings - srcSet, alt, webkit styles (`app/src/components/platform-home/BlogSection.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/GlobalSection.tsx, app/src/components/platform-home/HeroSection.tsx, app/src/components/platform-home/PlatformFooter.tsx`)**:
  - Fix srcset → srcSet (React JSX camelCase) across all 11 components.
  - Fix bare alt → alt="" (React treats bare alt as alt={true}) across 108 instances.
  - Fix -webkit-filter → WebkitFilter, -webkit-mask-image → WebkitMaskImage, -moz-mask-image → MozMaskImage, -webkit-line-clamp → WebkitLineClamp, -webkit-box-orient → WebkitBoxOrient in style props.

## [0.56.5] - 2026-08-26

### Fixed
- **Fix blank page - CSS background, pre-render, srcset paths (`app/public/images/0SUrTOV64gSW6ef6pQGsodg8h8.2fa88.png, app/public/images/0SUrTOV64gSW6ef6pQGsodg8h8.5f0a3.png, app/public/images/0SUrTOV64gSW6ef6pQGsodg8h8.991fa.png, app/public/images/0iYvC8WBrzeWXjCFjnd7QGcayw.2fa88.png, app/public/images/0iYvC8WBrzeWXjCFjnd7QGcayw.5f0a3.png`)**:
  - Add black body background to platform-home.css (white text was invisible on white bg).
  - Remove global body font-size:12px override from platform-home.css.
  - Fix generate-seo.js to return minimal black placeholder for homepage (was injecting old header/footer).
  - Fix srcset relative paths (images/ -> /images/) across all components.
  - Add inline background/color to PlatformHome wrapper div as fallback.

## [0.56.4] - 2026-08-26

### Fixed
- **Reduce PlatformHome chunk size below 600KB CI limit (`app/src/components/platform-home/BenefitsSection.tsx, app/src/pages/public/PlatformHome.tsx`)**:
  - Rewrite BenefitsSection: strip 2736 decorative Light ON/OFF grid elements, keep video + heading + stats (1.2MB -> 2.8KB).
  - Lazy-load PricingSection, BlogSection, TeamSection, GlobalSection, TestimonialsSection, FAQSection via React.lazy() + Suspense.
  - PlatformHome main chunk: 776KB -> 233KB, all chunks under 600KB.

## [0.56.3] - 2026-08-26

### Added
- **Literal Suprema template conversion to React (`app/public/suprema-fonts/1K3W8DizY3v4emK8Mb08YHxTbs.abed4.woff2, app/public/suprema-fonts/1ZFS7N918ojhhd0nQWdj3jz4w.abed4.woff2, app/public/suprema-fonts/2A4Xx7CngadFGlVV4xrO06OBHY.abed4.woff2, app/public/suprema-fonts/43sJ6MfOPh1LCJt46OvyDuSbA6o.abed4.woff2, app/public/suprema-fonts/4RAEQdEOrcnDkhHiiCbJOw92Lk.abed4.woff2`)**:
  - Replace custom platform-home CSS with Suprema's full 260K CSS.
  - Convert all 15 sections (navbar, hero, products, benefits, pricing, progress, tools, blog, team, global, testimonials, FAQ, CTA, footer) from Suprema's HTML to React JSX with exact same class names/styles.
  - Copy 69 Suprema font files (Inter Tight, Instrument Sans, etc.).
  - Root wrapper uses Framer's framer-cLVzK class hierarchy.
  - Style attributes converted to React objects with camelCase properties.
  - TypeScript: @ts-nocheck on literal HTML conversions (CSS custom properties and Framer-specific attributes incompatible with TS types).

## [0.56.2] - 2026-08-26

### Added
- **Rebuild PlatformHome as Suprema-inspired React homepage (`app/src/App.tsx, app/src/components/platform-home/BenefitsSection.tsx, app/src/components/platform-home/BlogSection.tsx, app/src/components/platform-home/CTASection.tsx, app/src/components/platform-home/FAQSection.tsx`)**:
  - 15 section components: Navbar, Hero, ProductOverview, Benefits, Progress, Tools, Pricing, Blog, Team, Global, Testimonials, FAQ, CTA, Footer.
  - Dark-mode design with floating pill navbar, glass effect, animated hero.
  - All content in data.ts for easy updates.
  - Scoped CSS with decorative animations, dot patterns, gradient backgrounds.
  - Homepage moved outside PublicLayout (own navbar/footer).
  - Replaces old PlatformHome and platform-home.css.

## [0.56.1] - 2026-08-26

### Added
- **Add platform homepage with product grid (`app/src/App.tsx, app/src/components/nav/ProductsDropdown.tsx, app/src/layouts/PublicLayout.tsx, app/src/pages/public/PlatformHome.tsx, app/src/styles/platform-home.css`)**:
  - Add PlatformHome page with dark hero + light product Bento grid.
  - Add ProductMockup components (internships, research, studio).
  - Add dark trust section with verified/secure/student-first badges.
  - Add light CTA section with register + browse actions.
  - Route / now shows PlatformHome, /internships shows current Landing.
  - Update ProductsDropdown to link to /internships/browse.
  - Add platform-home.css with Stripe/hybrid design system.

## [0.56.0] - 2026-08-26

### Added
- **Add multi-product dropdown navigation (`app/src/components/nav/ProductsDropdown.tsx, app/src/components/nav/ResourcesDropdown.tsx, app/src/layouts/PublicLayout.tsx`)**:
  - Add ProductsDropdown with Internships, Research Agent, ZYRO Studio cards.
  - Add ResourcesDropdown with Help, FAQ, Blog, Legal links.
  - Restructure desktop nav: Products, Research, About, Resources.
  - Update mobile nav links for multi-product layout.
  - Products dropdown opens upward with animated card list.

## [0.55.4] - 2026-08-24

### Fixed
- **Fix model switching, button positions, placeholder alignment, mobile layout (`app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Remove document-level mousedown outside-click handler that killed model dropdown selection (portal content was outside internalContainerRef).
  - Reposition action button to absolute right-2 bottom-2 in AgentHero (was flex child sitting 48px from edge).
  - Fix placeholder padding py-[19px] → py-4 to match textarea alignment.
  - Hide effort text label on small screens (<640px) to prevent '+' button from being pushed off-screen on iPhone 14 and similar devices.

## [0.55.3] - 2026-08-24

### Added
- **Replace input with polished PromptInput pattern (`app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx, app/src/agent/components/shared/DepthDropdown.tsx, app/src/agent/components/shared/ModelSelector.tsx`)**:
  - Rewrite ThreadInput with spring-animated expand/collapse.
  - Model selector opens upward (absolute bottom-full, no portal).
  - Effort/depth cycling with animated bars icon.
  - Voice recording with Web Audio visualizer.
  - File attachment support with gallery modal.
  - Morphing text animations for model/effort labels.
  - Chat/Research mode toggle below input.
  - Update AgentHero ChatInput to match same pattern.
  - Delete DepthDropdown.tsx and ModelSelector.tsx (built-in now).
  - All dropdowns open upward — no more off-screen issues on mobile.

## [0.55.2] - 2026-08-24

### Fixed
- **Mobile responsiveness — touch targets, layout, dropdown positioning (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/ResearchReasoning.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - ThreadInput: add flex-wrap on controls row for narrow screens.
  - All buttons: enforce 44px+ touch targets (py-2.5/py-3).
  - DepthDropdown: fix z-index to z-[60]/z-[61] above sidebar.
  - ModelSelector: clamp dropdown position to viewport bounds, truncate model name.
  - ModelSelector: add resize listener to reposition on orientation change.
  - AgentSidebar: default closed on mobile (viewport < 1024px), add max-w-[85vw].
  - ResearchAgentPage: add padding to report action buttons, flex-wrap on sources.
  - ResearchReasoning: increase accordion trigger padding to py-3.
  - AgentHero: increase sidebar toggle and history button to size-10/py-3.
  - Agent.css: remove unused .agent-history-overlay and .agent-history-panel.

## [0.54.1] - 2026-08-23

### Changed
- **Merge pull request #118 from ilyaskhan12Q/feature/dayos-style-landing**:
  - Feat(landing): Dayos-inspired editorial redesign.

## [0.55.1] - 2026-08-23

### Added
- **Sidebar history, PDF export, shared components, bug fixes (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/api/gateway.ts, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/Composer.tsx`)**:
  - Replace hardcoded demo history with real Supabase data in AgentSidebar.
  - Pass onSelectHistory callback to sidebar so clicking items loads sessions.
  - Remove duplicate history overlay panel from ResearchAgentPage.
  - Add Download PDF button to report section using existing reportPdf.ts.
  - Extract shared DepthDropdown and ModelSelector components.
  - Fix accordion text bug showing 'complete' during failed pipeline stages.
  - Add loading spinner when restoring history sessions.
  - Fix token refresh edge case for sessions without expires_at.
  - Delete unused Composer.tsx and SourceModal.tsx files.

## [0.55.0] - 2026-08-23

### Fixed
- **Model dropdown via Portal, clickable citations in reports (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Model dropdown uses React Portal to document.body — opens next to button, never clipped.
  - Hero model dropdown opens below button, thread model opens above button.
  - Replace dangerouslySetInnerHTML with renderReportMarkdown for XSS-safe rendering.
  - Citations [n] are now clickable buttons that scroll to Sources section.
  - Added Sources section with clickable links to each source URL.
  - Verify badge (green/amber) for each citation based on verification status.

## [0.54.5] - 2026-08-23

### Fixed
- **Model dropdown uses fixed positioning, chat history loading (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Model dropdown uses fixed positioning to avoid clipping inside rounded containers.
  - Model dropdown opens as a card at bottom-right of viewport (always visible).
  - Fix chat history loading: destructure loadSession from useAgentChat.
  - Deploy edge function with Gemini models.

## [0.54.4] - 2026-08-23

### Fixed
- **Depth dropdown opens upward to stay visible (`app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Depth dropdown opens upward to stay visible.

## [0.54.3] - 2026-08-23

### Added
- **Depth dropdown, scrollable model selector, floating input (`app/src/agent/components/AgentHero.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Replace depth pills with dropdown menu (Chat/Research toggle + depth dropdown).
  - Make model dropdown scrollable (max-h-320px, overflow-y-auto, sticky header).
  - Floating rounded input in thread view (remove border-t, add shadow-lg, rounded-2xl).
  - Same depth dropdown in hero input for consistency.

## [0.54.2] - 2026-08-23

### Added
- **Add Gemini models, optimize planner pipeline (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/api/gateway.ts, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/planner.ts, app/src/agent/research/workers.ts`)**:
  - Add 4 Gemini models (3.5-flash-lite, 2.5-flash, 3.5-flash, 3.1-flash-lite) to gateway REGISTRY with reasoning_effort:none for Gemini 2.5+.
  - Add chatOnce() non-streaming function to gateway client for faster structured output.
  - Optimize planner: simplified prompt (~600 chars vs ~1500), 8s timeout, Gemini default.
  - Rewrite contractQueries for search-optimized queries (topic+focus, keywords joined).
  - Improve fallback contract keywords (remove generic 'definition', 'principles').
  - Auto-approve research plan by default (skipReview=true).
  - Stream editorial output to UI for live report preview.
  - Add intent detection: greetings route to chat in research mode.
  - Set GEMINI_API_KEY in Supabase secrets.

## [0.54.0] - 2026-08-23

### Fixed
- **Increase scrolled nav height 48px → 54px (`app/src/styles/research-landing.css`)**:
  - Increase scrolled nav height 48px → 54px.

## [0.53.5] - 2026-08-23

### Fixed
- **Morphing navbar — remove Reveal wrapper, fix sticky (`app/src/components/research-landing/ResearchNav.tsx, app/src/styles/research-landing.css`)**:
  - Remove Reveal wrapper from ResearchNav (breaks position:sticky).
  - Fix top: 0 (was 0.75rem).
  - Explicit transition properties instead of 'transition: all'.
  - Use margin-left/right: auto for centering (not margin shorthand).
  - Shrinks from 64px → 48px, pill shape, centered floating pill on scroll.

## [0.53.4] - 2026-08-23

### Added
- **Morphing navbar — shrinks to pill on scroll (`app/src/styles/research-landing.css`)**:
  - Initial: full-width, 64px height, transparent bg, no rounded corners.
  - Scrolled: 48px height, pill shape (border-radius: 9999px), centered (max-width: 720px).
  - Floating shadow + backdrop blur on scroll.
  - Smooth cubic-bezier transition (0.4s).

## [0.53.3] - 2026-08-23

### Fixed
- **ReportSection heading overflow — use 2-col grid + smaller clamp (`app/src/components/research-landing/ReportSection.tsx`)**:
  - Change grid from 5-col to 2-col for equal halves.
  - Reduce heading size from rl-heading-text (4rem) to clamp(2rem, 3.5vw, 3rem).
  - Add max-w-sm to description for proper wrapping.

## [0.53.2] - 2026-08-23

### Added
- **Complete visual overhaul — tighter density, Dayos-level design (`app/src/components/research-landing/AudienceSection.tsx, app/src/components/research-landing/EditorialStatement.tsx, app/src/components/research-landing/EvidenceSection.tsx, app/src/components/research-landing/FeaturesSection.tsx, app/src/components/research-landing/FinalCta.tsx`)**:
  - CSS: reduce section padding (3rem/5rem → 5rem max), add .rl-chip-dark, .rl-image-placeholder.
  - Hero: tighter spacing, min-h-85vh, smaller gradient fade.
  - EditorialStatement: tighter text, less padding.
  - ResearchEngine: border-top grid with dividers instead of cards, less padding.
  - LiveResearchSection: 2-column layout (copy + dark mockup with pipeline dots + source cards).
  - SourceUniverse: tighter stats, smaller text.
  - EvidenceSection: compact claim cards with inline source chips.
  - ReportSection: dark bg, 2/5 column split (copy + report mockup), tighter findings.
  - FeaturesSection: tighter cards, smaller text.
  - AudienceSection: gradient header cards with pill tags, dense layout.
  - ModelsSection: tighter cards, smaller text.
  - PricingSection: tighter cards, bolder pricing, border-2 on highlighted.
  - FinalCta: tighter 2-column, smaller text.
  - ResearchFooter: tighter grid, smaller text and icons.

## [0.53.1] - 2026-08-23

### Added
- **Self-contained Report, Audience, Pricing sections (`app/src/components/research-landing/AudienceSection.tsx, app/src/components/research-landing/PricingSection.tsx, app/src/components/research-landing/ReportSection.tsx, app/src/data/researchLandingDemo.ts`)**:
  - ReportSection: inline findings + sources, remove demo data import.
  - AudienceSection: inline audiences data, remove demo data import.
  - PricingSection: inline pricing plans, remove demo data import.
  - Clean up researchLandingDemo.ts (remove all unused exports).
  - All sections now self-contained, no shared demo data dependencies.

## [0.53.0] - 2026-08-23

### Added
- **Update composition, nav, delete unused sections (`app/src/components/research-landing/LibrarySection.tsx, app/src/components/research-landing/QuestionExploration.tsx, app/src/components/research-landing/ResearchNav.tsx, app/src/pages/research/ResearchLanding.tsx`)**:
  - Remove LibrarySection and QuestionExploration (redundant).
  - Update ResearchNav: add Sources link, keep 4 nav links.
  - Update ResearchLanding.tsx: remove deleted section imports.
  - Section order: Hero → ProblemArc → Revolution → Product → Logos → Evidence → Report → Pillars → Audience → Depth → Pricing → CTA → Footer.

## [0.52.5] - 2026-08-23

### Added
- **Dayos-style multi-column footer (`app/src/components/research-landing/ResearchFooter.tsx`)**:
  - ResearchFooter: dark bg, 4-column layout (brand, product, company, legal).
  - Social icons (Twitter/X, LinkedIn, GitHub).
  - Bottom bar with copyright + social links.
  - Remove old light-bg footer with 2-column layout.

## [0.52.4] - 2026-08-23

### Added
- **Two-column CTA section on dark bg (`app/src/components/research-landing/FinalCta.tsx`)**:
  - FinalCta: dark bg, two-column layout (CTA + About card).
  - Left: 'WHAT WILL YOU RESEARCH NEXT?' + CTA button.
  - Right: About ZYROO card with description + link.
  - Remove old concentric rings animation.

## [0.52.3] - 2026-08-23

### Added
- **Horizontal scroll depth cards (`app/src/components/research-landing/ModelsSection.tsx`)**:
  - ModelsSection: 'CHOOSE HOW DEEP TO GO.' headline.
  - 3 depth cards (Quick/Standard/Deep) with source count + time.
  - Horizontal scroll on mobile, grid on desktop.
  - Remove old tier hover with scale + shadow.

## [0.52.2] - 2026-08-23

### Added
- **3-pillar feature section (`app/src/components/research-landing/FeaturesSection.tsx`)**:
  - FeaturesSection: Research / Verify / Report pillars.
  - Reduce from 6 feature cards to 3 key pillars.
  - Border-top cards with accent icons and 'Learn more' links.
  - Staggered scroll reveal.

## [0.52.1] - 2026-08-23

### Added
- **Claim trail feature detail section (`app/src/components/research-landing/EvidenceSection.tsx`)**:
  - EvidenceSection: 'EVERY CLAIM HAS A TRAIL.' headline.
  - Numbered citation cards with claim text + source chips.
  - Staggered scroll reveal, card hover effects.
  - Remove old interactive citation hover highlights.

## [0.52.0] - 2026-08-23

### Added
- **Source logos bar + stats section on dark bg (`app/src/components/research-landing/SourceUniverse.tsx`)**:
  - SourceUniverse: dark bg, 'ACADEMIC + WEB SOURCES.' headline.
  - Horizontal marquee of source names (OpenAlex, arXiv, etc.).
  - 3-column stats (247 sources, 18 verified, 4 dimensions).
  - Remove old asymmetric reveal and animated counter.

## [0.51.5] - 2026-08-23

### Added
- **Revolution statement + product showcase sections (`app/src/components/research-landing/LiveResearchSection.tsx, app/src/components/research-landing/ResearchEngine.tsx`)**:
  - ResearchEngine: 'FROM QUESTION TO UNDERSTANDING.' headline + 3 feature cards.
  - ResearchEngine: light bg, staggered reveal, accent icons, border-top cards.
  - LiveResearchSection: 'THE RESEARCH AGENT.' product showcase.
  - LiveResearchSection: headline + description + dark workspace mockup placeholder.
  - LiveResearchSection: remove old animated pipeline dots and source cards.

## [0.51.4] - 2026-08-23

### Added
- **Dark hero + problem arc sections (`app/src/components/research-landing/EditorialStatement.tsx, app/src/components/research-landing/HeroSection.tsx`)**:
  - Hero: full-viewport dark bg, bold uppercase headline, subtext, CTA button.
  - Hero: remove glassmorphism card, typing effect, parallax floating elements.
  - Hero: bottom gradient fade for smooth transition to light section.
  - EditorialStatement: 3-step problem arc (Question/Surface/Depth).
  - EditorialStatement: dark bg, staggered scroll reveal, accent-colored labels.

## [0.51.3] - 2026-08-23

### Changed
- **Update CSS for Dayos-inspired design system (`app/src/styles/research-landing.css`)**:
  - Add dark section styles (--rl-dark, --rl-dark-muted).
  - Add .rl-dark-section, .rl-btn-primary-dark classes.
  - Add .rl-section-full for full-width dark sections.
  - Add .rl-logo-marquee horizontal scroll animation.
  - Add .rl-scroll-carousel snap-scroll for mobile.
  - Add .rl-eyebrow-light for dark section eyebrows.
  - Keep all existing utilities (glass, cards, underlines, reduced motion).

## [0.51.2] - 2026-08-22

### Changed
- **Merge remote-tracking branch 'origin/main' into develop (`CHANGELOG.md`)**:
  - # Conflicts: #	CHANGELOG.md #	app/package.json.

## [0.51.1] - 2026-08-22

### Added
- **Redesign with rich animations, glassmorphism, and scroll effects (`app/src/components/research-landing/AudienceSection.tsx, app/src/components/research-landing/EditorialStatement.tsx, app/src/components/research-landing/EvidenceSection.tsx, app/src/components/research-landing/FeaturesSection.tsx, app/src/components/research-landing/FinalCta.tsx`)**:
  - Reveal.tsx: add parallax, scale, fade-left/right variants + StaggerContainer/StaggerItem.
  - HeroSection: full viewport, typing effect with cycling phrases, glassmorphism card, parallax floating elements, gradient text, scroll indicator.
  - EditorialStatement: staggered dramatic text reveal.
  - QuestionExploration: staggered typographic cascade.
  - ResearchEngine: animated pipeline with pulsing dots + staggered research area cards.
  - LiveResearchSection: animated progress stepper, staggered source card entrance.
  - SourceUniverse: asymmetric reveal with animated counter on stats.
  - EvidenceSection: interactive citation hover highlights, staggered claim trail.
  - ReportSection: scale reveal with hover effects on findings.
  - FeaturesSection: staggered card grid with color-shifting icon hover.
  - AudienceSection: card hover with border reveal + color transition.
  - LibrarySection: search bar focus animation with ring effect.
  - ModelsSection: tier hover with scale + shadow effects.
  - PricingSection: highlighted plan scale animation.
  - FinalCta: dramatic scale reveal with animated concentric rings backdrop.
  - CSS: glassmorphism utilities, card hover effects, underline animation, typing cursor, pulse ring, gradient text, bold typography.

## [0.49.5] - 2026-08-21

### Changed
- **Merge feature/agent-bolt-redesign: Bolt-style workspace + premium editorial landing + subdomain routing**:
  - Merge feature/agent-bolt-redesign: Bolt-style workspace + premium editorial landing + subdomain routing.

## [0.51.0] - 2026-08-21

### Added
- **Add slide-in animation for history panel (`app/src/agent/ResearchAgentPage.tsx`)**:
  - Overlay fades in/out (200ms).
  - Panel slides from left with spring animation (damping 25, stiffness 300).
  - Smooth AnimatePresence exit on close.

## [0.50.5] - 2026-08-21

### Added
- **Add AnimatePresence transition for hero→thread switch (`app/src/agent/ResearchAgentPage.tsx`)**:
  - Hero fades out (opacity 0, scale 0.98) in 200ms.
  - Thread fades in (opacity 0→1) in 300ms with 100ms delay.
  - Smooth transition when user sends first message.

## [0.50.4] - 2026-08-21

### Added
- **Add persistent sidebar with demo history, new chat, settings (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentHero.tsx, app/src/agent/components/AgentSidebar.tsx`)**:
  - Collapsible sidebar: 280px expanded, 48px icon-only on desktop.
  - Mobile: drawer with overlay backdrop.
  - Demo history items (placeholder entries for future backend).
  - Search bar for filtering history.
  - New Chat button with plus icon.
  - Settings placeholder at bottom.
  - Hamburger toggle in hero and active session header.
  - Sidebar state managed in ResearchAgentPage.

## [0.50.3] - 2026-08-21

### Added
- **Replace header text links with proper pill buttons (`app/src/agent/ResearchAgentPage.tsx`)**:
  - New button: plus icon + label, pill shape with border.
  - History button: clock icon + label, pill shape with border.
  - Status indicator: animated green dot when active, gray when idle.

## [0.50.2] - 2026-08-21

### Added
- **Add ThreadInput with mode toggle, depth pills, model selector (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/ThreadInput.tsx`)**:
  - Replaces the broken uncontrolled textarea in the active session with a proper ThreadInput component featuring:.
  - Controlled state with auto-resize.
  - Chat | Research segmented toggle.
  - Quick / Standard / Deep depth pills (research mode only).
  - Model selector pill.
  - Send/Stop button.
  - Enter to send, Shift+Enter for newline.

## [0.50.1] - 2026-08-21

### Fixed
- **Add min-h-0 to thread area for proper overflow scrolling (`app/src/agent/ResearchAgentPage.tsx`)**:
  - Add min-h-0 to thread area for proper overflow scrolling.

## [0.50.0] - 2026-08-21

### Fixed
- **Remove ignoreCommand to enable Vercel auto-deploy from develop (`app/vercel.json`)**:
  - Remove ignoreCommand to enable Vercel auto-deploy from develop.

## [0.49.4] - 2026-08-21

### Added
- **Bolt-style workspace + premium editorial landing (`CHANGELOG.md, app/package-lock.json, app/src/App.tsx, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentChat.tsx`)**:
  - Agent workspace redesign:.
  - Dark #0f0f0f background with blue ray gradient (replaces light academic theme).
  - Centered hero input ('What will you research?') with model selector + depth pills.
  - ResearchReasoning accordion replaces PipelineView for pipeline progress.
  - History panel for session management (top-right button).
  - Removed AgentSidebar, ComposerDock, LandingView, PipelineView, PlanReview, ReportView, AgentChat, ModelPill, AgentSettingsModal, useAgentLibrary.
  - Research Agent landing page (/research):.
  - Premium editorial: Instrument Serif + Inter, #F5F5F2 bg, #657C68 accent.
  - 16 sections: hero, editorial statement, questions, pipeline, live research, sources, evidence, report, features, audience, library, models, pricing ( placeholders), CTA, footer.
  - All CSS/SVG visuals, no stock images, no fabricated claims.
  - Sticky nav with scroll-blur, Reveal motion (reduced-motion-aware).
  - Hostname-aware routing:.
  - Research.zyroo.org serves landing at / + workspace at /research-agent.
  - Main site: /research serves the same page for reviewability.
  - Subdomain non-agent paths redirect to zyroo.org.

## [0.49.3] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: hero-only input + mode-aware landing**:
  - Merge feature/agent-single-page: hero-only input + mode-aware landing.

## [0.49.1] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: polish, changelog, empty-thread fix**:
  - Merge feature/agent-single-page: polish, changelog, empty-thread fix.

## [0.48.5] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: unified single-page thread**:
  - Merge feature/agent-single-page: unified single-page thread.

## [0.48.3] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: composer dock**:
  - Merge feature/agent-single-page: composer dock.

## [0.48.1] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: left AgentSidebar with library**:
  - Merge feature/agent-single-page: left AgentSidebar with library.

## [0.47.5] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: chat session persistence**:
  - Merge feature/agent-single-page: chat session persistence.

## [0.47.2] - 2026-08-19

### Changed
- **Merge feature/agent-single-page: conversation thread backdrop**:
  - Merge feature/agent-single-page: conversation thread backdrop.

## [0.47.0] - 2026-08-19

### Changed
- **Merge fix/research-pipeline: 24-candidate gather, verified-only citations, two-tier sources**:
  - Merge fix/research-pipeline: 24-candidate gather, verified-only citations, two-tier sources.

## [0.49.2] - 2026-08-19

### Added
- **Single input on new sessions — hero-only, mode-aware (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/ComposerDock.tsx, app/src/agent/components/LandingView.tsx`)**:
  - ComposerDock hideInput: collapses to the top strip (toggle + model + mobile trigger) on an empty thread — no second input, no caption.
  - Dock input appears in real time once a query is sent.
  - LandingView mode-aware: chat mode drops depth pills and sends a chat message; research mode unchanged (depth pills + pipeline run).
  - Hero polish: eyebrow capsule, larger tight wordmark, two-line editorial tagline, text-xl underline input, fade-up entrance.

## [0.49.0] - 2026-08-19

### Changed
- **Single-page Research Agent workspace; fix empty-thread hero when prefilled (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx`)**:
  - CHANGELOG [Unreleased] Changed: unified thread, sidebar library, composer dock, chat persistence, conversation backdrop.
  - Empty-thread detection excludes prefill-only runs so the landing hero does not double-render under AgentChat's empty state.

## [0.48.4] - 2026-08-19

### Added
- **Unified single-page thread with inline research runs (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/ComposerDock.tsx`)**:
  - Header removed; one thread for chat + research.
  - Empty thread = LandingView hero; otherwise bubbles + inline run card.
  - Run shows topic bubble, PipelineView live progress (stepper + evidence), inline PlanReview, then full ReportView; follow-up chat continues below.
  - Mode now only shapes the composer dock.
  - Mobile sidebar trigger moved into the dock row.

## [0.48.2] - 2026-08-19

### Added
- **Composer dock with mode toggle, model picker, depth pills (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/ComposerDock.tsx`)**:
  - ComposerDock replaces Composer + header nav; always visible bottom dock.
  - [Chat|Research] segmented toggle + ModelPill (always visible).
  - Depth pills Quick/Standard/Deep in research mode, wired to pipeline.run.
  - Research send runs the pipeline directly (clears prior report state).
  - Header slimmed: hamburger (mobile), wordmark, settings, profile.

## [0.48.0] - 2026-08-19

### Added
- **Left AgentSidebar with chat + research library (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/AgentSidebar.tsx, app/src/agent/components/HistoryPanel.tsx, app/src/agent/hooks/useAgentLibrary.ts`)**:
  - Replaces right-side HistoryPanel; ZYROO wordmark, New session, pinned Settings + profile chip at the bottom.
  - Chats (mode='chat') and Research (mode='research') sections from agent_researches via useAgentLibrary, refetched on session/report change.
  - New session = fresh chat (resetSession + pipeline clear).
  - Mobile slide-over drawer + header hamburger (lg:hidden).
  - Delete HistoryPanel.

## [0.47.4] - 2026-08-19

### Added
- **Persist chat sessions and messages (mode='chat') (`app/src/agent/hooks/useAgentChat.ts`)**:
  - Lazy session create on first send (agent_researches, prompt = first message).
  - User + assistant messages persisted to agent_messages with model + token usage.
  - Latest completed chat session auto-restored on mount.
  - LoadSession(id) + resetSession() for the upcoming sidebar library.

## [0.47.3] - 2026-08-19

### Added
- **Persist chat sessions and messages (mode='chat') (`app/src/agent/hooks/useAgentChat.ts`)**:
  - Lazy session create on first send (agent_researches, prompt = first message).
  - User + assistant messages persisted to agent_messages with model + token usage.
  - Latest completed chat session auto-restored on mount.
  - LoadSession(id) + resetSession() for the upcoming sidebar library.

## [0.47.1] - 2026-08-19

### Added
- **Conversation thread backdrop with landing pentagon motif (`app/src/agent/ResearchAgentPage.tsx, app/src/styles/agent.css`)**:
  - .agent-thread layer: parabolic-pentagon.svg at 15% opacity, mix-blend-multiply over the light surface, soft top/bottom gradient.
  - Applied to the chat thread and research content areas (sidebar stays solid).
  - Typography unchanged — contrast verified at 15% blend.

## [0.46.5] - 2026-08-19

### Added
- **24-candidate gather, verified-only citations, two-tier source sections (`CHANGELOG.md, app/src/agent/components/PipelineView.tsx, app/src/agent/components/ReportView.tsx, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/lib/reportPdf.ts`)**:
  - Gather cap 16 -> 24 (fits gateway VERIFY_MAX_URLS=25; every candidate checked).
  - Verifier assigns [1]..[N] keys to verified entries only (key 0 otherwise); editorial receives verified-only ledger so every [n] cites a live source.
  - Sources tab: 'Verified sources' + 'Additional sources' sections; header and PDF metadata count verified vs additional separately (ledger.length miscounted).
  - Pipeline/Evidence cards show 'pending verification' chips for unconfirmed items.

## [0.46.4] - 2026-08-18

### Changed
- **Merge fix/research-pipeline: round-robin evidence selection**:
  - Merge fix/research-pipeline: round-robin evidence selection.

## [0.46.2] - 2026-08-18

### Changed
- **Merge fix/research-pipeline: server-side arXiv/OpenAlex search, parallel gateway platforms, planner retry**:
  - Merge fix/research-pipeline: server-side arXiv/OpenAlex search, parallel gateway platforms, planner retry.

## [0.46.0] - 2026-08-18

### Changed
- **Merge fix/research-pipeline: scroll fixes for generated text and history**:
  - Merge fix/research-pipeline: scroll fixes for generated text and history.

## [0.45.4] - 2026-08-18

### Changed
- **Merge fix/research-pipeline: restore research pipeline (search, persistence, editorial)**:
  - Merge fix/research-pipeline: restore research pipeline (search, persistence, editorial).

## [0.45.1] - 2026-08-18

### Changed
- **Merge feature/agent-ux-redesign: Academic Precision UI/UX redesign**:
  - Merge feature/agent-ux-redesign: Academic Precision UI/UX redesign.

## [0.44.4] - 2026-08-18

### Changed
- **Merge feature/jina-gateway: Jina web via gateway + empty-platform visibility**:
  - Merge feature/jina-gateway: Jina web via gateway + empty-platform visibility.

## [0.44.2] - 2026-08-18

### Changed
- **Merge fix/session-refresh: stale JWT refresh — gateway Unauthorized fix**:
  - Merge fix/session-refresh: stale JWT refresh — gateway Unauthorized fix.

## [0.44.0] - 2026-08-18

### Changed
- **Merge feature/gateway-search: Phase 3.5 — keyless-first gateway search (S2 + PubMed + CORE)**:
  - Merge feature/gateway-search: Phase 3.5 — keyless-first gateway search (S2 + PubMed + CORE).

## [0.46.3] - 2026-08-18

### Fixed
- **Round-robin evidence selection so one platform can't fill the cap (`CHANGELOG.md, app/src/agent/research/workers.ts`)**:
  - OpenAlex (60 results) filled all 16 gathered slots before arXiv/PubMed/Web were considered, so real runs showed 'OpenAlex 16, everything else 0'. Selection now interleaves round-robin across platforms (verified live: 60/60/5/0/4 -> OpenAlex 4, arXiv 4, Semantic Scholar 4, Jina Web 4).

## [0.46.1] - 2026-08-18

### Fixed
- **Server-side arXiv/OpenAlex search, parallel gateway platforms, planner retry (`CHANGELOG.md, app/src/agent/api/gateway.ts, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/planner.ts, app/src/agent/research/workers.ts`)**:
  - ArXiv export.arxiv.org sends no Access-Control-Allow-Origin, so the browser-direct arXiv worker failed in every real run; openalex + arxiv are now gateway search platforms (server-side, no CORS).
  - SearchPlatforms runs platforms in parallel (Promise.allSettled): ~37s sequential -> ~24s, under the browser's old 15s timeout that silently zeroed gateway/web contributions.
  - Workers.ts: single gateway search covering all 6 platforms with a 90s timeout that emits a pipeline note on timeout instead of returning [].
  - StreamChat returns ok:false when an SSE error event arrives.
  - Planner.decompose retries once on invalid output before the rule fallback (free-tier providers occasionally emit 93-token garbage).

## [0.45.5] - 2026-08-18

### Fixed
- **Restore scrolling for generated text and history (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/HistoryPanel.tsx, app/src/agent/components/ReportView.tsx`)**:
  - Both ScrollArea flex items (flex-1) lacked min-h-0, so min-height:auto grew them to full content height and the viewport never overflowed. In chat mode the grown area was clipped by .agent-root's overflow-hidden, leaving long generated answers unscrollable. Verified in headless Chrome: viewport scrollHeight 9616 vs clientHeight 429 after fix. HistoryPanel gets an overflow-y-auto scroll container for long lists.

## [0.45.3] - 2026-08-18

### Fixed
- **Persist runs under user_id (RLS), surface pipeline errors (`app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/ReportView.tsx, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/editorial.ts, app/src/agent/research/workers.ts`)**:
  - Agent_researches/agent_messages inserts never set user_id, so every run hit 'new row violates row-level security policy' and history was silently empty. Client now writes user_id on both inserts and surfaces persistence failures. OpenAlex/arXiv worker failures emit pipeline notes instead of silent zeros; ReportView shows a collapsible notes/errors banner. Editorial prompt tightened so the report fits the 8192 free-model output cap without truncation.

## [0.45.2] - 2026-08-18

### Fixed
- **Restore search on edge — UA header, 30s web timeout, S2 retry, status logging (`CHANGELOG.md, supabase/functions/ai-gateway/index.ts`)**:
  - Semantic Scholar keyless tier 429s datacenter IPs (retry once after 1s backoff), PubMed rejected edge requests without a descriptive User-Agent, and Jina web search (~12s) blew the 10s search timeout, leaving all search platforms empty. extractLinks also now filters junk markdown-image titles and keeps s.jina.ai/... URLs out of results.
  - Fixes the '0 verified sources / 0 evidence items' report.

## [0.45.0] - 2026-08-18

### Changed
- **Report workspace tabs + source verification panel + editorial structure (`CHANGELOG.md, app/src/agent/components/ReportView.tsx, app/src/agent/components/SourceModal.tsx, app/src/agent/render/renderReportMarkdown.tsx, app/src/agent/research/editorial.ts`)**:
  - ReportView: Overview | Findings | Evidence | Sources workspace (desktop top bar, mobile bottom nav); exec summary rule, numbered key findings/dimensions, evidence excerpt grid, ledger source cards.
  - SourceModal: slide-up sheet (mobile) / right panel (desktop) — Verified / DOI verified / Evidence verified checklist, evidence blockquote, bordered Open original source action; citations [n] open the panel instead of scrolling.
  - Editorial: report prompt now emits ## Executive Summary / ## Key Findings / ## Conclusion around the four dimension sections (## Sources unchanged); PDF export unaffected (generic heading renderer).
  - RenderReportMarkdown: citation anchors restyled to primary/amber on light.

## [0.44.5] - 2026-08-18

### Changed
- **Academic Precision design system — light theme, landing, research progress timeline (`app/index.html, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/HistoryPanel.tsx, app/src/agent/components/LandingView.tsx, app/src/agent/components/PipelineView.tsx`)**:
  - Agent.css: scoped light 'Academic Precision' palette (surface #f9f9f9, on-surface #1a1c1c, primary #3525cd, 4px radii, flat) + Source Serif 4 / Geist fonts.
  - LandingView: centered ZYROO home — underline input, Quick/Standard/Deep mode selectors (persisted to depth column), Suggested Research cards.
  - PipelineView: five-step tracker (Understanding → Building → Searching → Verifying → Writing) with live evidence cards + per-platform counts.
  - ResearchAgentPage: top nav bar (wordmark, Chat/Research nav, New Research, settings, avatar); PlanReview + HistoryPanel restyled to match.

## [0.44.3] - 2026-08-18

### Changed
- **Jina web via gateway (JINA_API_KEY secret) + empty-platform visibility (`CHANGELOG.md, app/src/agent/api/gateway.ts, app/src/agent/components/PipelineView.tsx, app/src/agent/research/workers.ts, supabase/functions/ai-gateway/index.ts`)**:
  - Jina web via gateway (JINA_API_KEY secret) + empty-platform visibility.

## [0.44.1] - 2026-08-18

### Fixed
- **Refresh stale session before gateway calls — no more silent Unauthorized after idle (`CHANGELOG.md, app/src/agent/api/gateway.ts`)**:
  - Refresh stale session before gateway calls — no more silent Unauthorized after idle.

## [0.43.5] - 2026-08-18

### Changed
- **Gateway search worker — S2 server-side + PubMed + CORE (keyless-first), 6-platform UI (`CHANGELOG.md, app/src/agent/api/gateway.ts, app/src/agent/components/PipelineView.tsx, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/workers.ts`)**:
  - Gateway search worker — S2 server-side + PubMed + CORE (keyless-first), 6-platform UI.

## [0.43.4] - 2026-08-18

### Changed
- **/v1/search action — keyless-first S2 + PubMed, CORE env-gated (`CHANGELOG.md, supabase/functions/ai-gateway/index.ts`)**:
  - /v1/search action — keyless-first S2 + PubMed, CORE env-gated.

## [0.43.3] - 2026-08-17

### Changed
- **Merge feature/research-phase3: Phase 3 — 4 parallel realtime workers (8-12s gathering), volume 8-16, PDF export**:
  - Merge feature/research-phase3: Phase 3 — 4 parallel realtime workers (8-12s gathering), volume 8-16, PDF export.

## [0.42.5] - 2026-08-17

### Changed
- **Merge feature/research-ux: Phase 3 pre-work — research UX bundle (report rendering, source modal, plan review gate, pipeline polish, continue-from-report, research-mode cleanup)**:
  - Merge feature/research-ux: Phase 3 pre-work — research UX bundle (report rendering, source modal, plan review gate, pipeline polish, continue-from-report, research-mode cleanup).

## [0.41.4] - 2026-08-17

### Changed
- **Merge feature/research-agent-pipeline: Phase 2 — deep research pipeline (planner, workers, verifier, editorial, workspace UI, migration 044)**:
  - Merge feature/research-agent-pipeline: Phase 2 — deep research pipeline (planner, workers, verifier, editorial, workspace UI, migration 044).

## [0.43.2] - 2026-08-17

### Added
- **PDF export — multi-page A4 report + citation ledger appendix via jsPDF (direct download) (`CHANGELOG.md, app/src/agent/components/ReportView.tsx, app/src/agent/lib/reportPdf.ts`)**:
  - PDF export — multi-page A4 report + citation ledger appendix via jsPDF (direct download).

## [0.43.1] - 2026-08-17

### Added
- **Gathering volume 8-16 — per-platform caps, hard aggregate cap, staggered S2 waves, web cap 4 (`CHANGELOG.md, app/src/agent/research/workers.ts`)**:
  - Gathering volume 8-16 — per-platform caps, hard aggregate cap, staggered S2 waves, web cap 4.

## [0.43.0] - 2026-08-17

### Added
- **Four parallel realtime workers — per-platform units with intra-platform query parallelism (gathering ~8-12s) (`CHANGELOG.md, app/src/agent/components/PipelineView.tsx, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/workers.ts`)**:
  - Four parallel realtime workers — per-platform units with intra-platform query parallelism (gathering ~8-12s).

## [0.42.4] - 2026-08-17

### Added
- **Hide model picker in research mode — models belong in Settings, not the research surface (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx`)**:
  - Hide model picker in research mode — models belong in Settings, not the research surface.

## [0.42.3] - 2026-08-17

### Added
- **Continue from report — follow-up chat with report context, prefill new research, regenerate (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/PipelineView.tsx, app/src/agent/components/ReportView.tsx`)**:
  - Continue from report — follow-up chat with report context, prefill new research, regenerate.

## [0.42.2] - 2026-08-17

### Added
- **Pipeline view polish — planning skeleton, per-source status rows, verified chips, condensed notes (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/PipelineView.tsx, app/src/agent/hooks/useResearchPipeline.ts`)**:
  - Pipeline view polish — planning skeleton, per-source status rows, verified chips, condensed notes.

## [0.42.1] - 2026-08-17

### Added
- **Plan review gate — approve/edit/regenerate the research agenda before workers start (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/PlanReview.tsx, app/src/agent/hooks/useResearchPipeline.ts, app/src/agent/research/types.ts`)**:
  - Plan review gate — approve/edit/regenerate the research agenda before workers start.

## [0.42.0] - 2026-08-17

### Added
- **Source modal — full evidence record behind every ledger card (`CHANGELOG.md, app/src/agent/components/ReportView.tsx, app/src/agent/components/SourceModal.tsx`)**:
  - Source modal — full evidence record behind every ledger card.

## [0.41.5] - 2026-08-17

### Added
- **Report rendering — safe markdown renderer with clickable citation anchors and verified-first ledger (`CHANGELOG.md, app/src/agent/components/ReportView.tsx, app/src/agent/render/renderReportMarkdown.tsx`)**:
  - Report rendering — safe markdown renderer with clickable citation anchors and verified-first ledger.

## [0.41.3] - 2026-08-17

### Fixed
- **Exhaust lint warning for loadHistory effect in research page (`app/src/agent/ResearchAgentPage.tsx`)**:
  - Exhaust lint warning for loadHistory effect in research page.

## [0.41.2] - 2026-08-17

### Added
- **Research workspace UI — pipeline progress, report + citation ledger, history panel (`CHANGELOG.md, app/src/agent/ResearchAgentPage.tsx, app/src/agent/components/HistoryPanel.tsx, app/src/agent/components/PipelineView.tsx, app/src/agent/components/ReportView.tsx`)**:
  - Research workspace UI — pipeline progress, report + citation ledger, history panel.

## [0.41.1] - 2026-08-17

### Added
- **Research pipeline hook — stage state machine with run persistence (agent_researches report_data) (`CHANGELOG.md, app/src/agent/hooks/useResearchPipeline.ts, supabase/migrations/044_research_report_data.sql`)**:
  - Research pipeline hook — stage state machine with run persistence (agent_researches report_data).

## [0.41.0] - 2026-08-17

### Added
- **Research editorial — ledger-grounded report synthesis with citation keys (`CHANGELOG.md, app/src/agent/research/editorial.ts`)**:
  - Research editorial — ledger-grounded report synthesis with citation keys.

## [0.40.5] - 2026-08-17

### Added
- **Research verifier — dedupe, server-side link liveness, deterministic citation ledger (`CHANGELOG.md, app/src/agent/api/gateway.ts, app/src/agent/research/verifier.ts`)**:
  - Research verifier — dedupe, server-side link liveness, deterministic citation ledger.

## [0.40.4] - 2026-08-17

### Added
- **Research workers — academic (OpenAlex/arXiv/Semantic Scholar) + web (Jina) with bounded concurrency (`CHANGELOG.md, app/src/agent/research/workers.ts`)**:
  - Research workers — academic (OpenAlex/arXiv/Semantic Scholar) + web (Jina) with bounded concurrency.

## [0.40.3] - 2026-08-17

### Added
- **Research engine contracts + planner (gateway decomposition with schema validation and fallback) (`CHANGELOG.md, app/src/agent/research/planner.ts, app/src/agent/research/types.ts`)**:
  - Research engine contracts + planner (gateway decomposition with schema validation and fallback).

## [0.40.2] - 2026-08-17

### Added
- **Gateway /v1/verify action — server-side URL/DOI liveness for research verifier (`CHANGELOG.md, supabase/functions/ai-gateway/index.ts`)**:
  - Gateway /v1/verify action — server-side URL/DOI liveness for research verifier.

## [0.40.1] - 2026-08-17

### Changed
- **Bump to 0.38.3 — research agent phase 1 + repo hygiene changelog (`CHANGELOG.md, app/package.json`)**:
  - Bump to 0.38.3 — research agent phase 1 + repo hygiene changelog.

## [0.40.0] - 2026-08-17

### Changed
- **Untrack private docs, agent memory, and generated SEO outputs; ignore local agent tooling (`.github/SECRETS_SETUP.md, .gitignore, CLAUDE.md, app/public/llms.txt, app/public/robots.txt`)**:
  - Untrack private docs, agent memory, and generated SEO outputs; ignore local agent tooling.

## [0.39.5] - 2026-08-17

### Fixed
- **Resolve Deno lint errors in ai-gateway (parens around ?? chain, drop unused catch binding) (`supabase/functions/ai-gateway/index.ts`)**:
  - Resolve Deno lint errors in ai-gateway (parens around ?? chain, drop unused catch binding).

## [0.39.4] - 2026-08-17

### Added
- **Phase 1 research agent — ai-gateway edge function with free-tier Zen fallback chain, per-user metering, and isolated /research-agent workspace (`app/src/App.tsx, app/src/agent/ResearchAgentPage.tsx, app/src/agent/api/gateway.ts, app/src/agent/components/AgentChat.tsx, app/src/agent/components/AgentSettingsModal.tsx`)**:
  - Supabase/functions/ai-gateway: JWT-gated POST /v1/chat (stream + non-stream) and GET /v1/models catalog; registry with zen/deepseek-v4-flash-free, zen/mimo-v2.5-free, zen/hy3-free (Bearer public) plus dormant BYOK entries; in-memory cooldowns on 429/FreeUsageLimit/5xx; upstream SSE passthrough with usage+done tail events; DB-backed 20 req/min per-user rate limit; usage ledger writes to agent_usage.
  - Supabase/migrations/043_agent_tables.sql: agent_researches, agent_messages, agent_usage with owner-only RLS (auth.uid()) and hot-path indexes.
  - App/src/agent/*: isolated module (types, gateway SSE client, useAgentModels, useAgentChat, AgentChat/Composer/ModelPill/AgentSettingsModal, ResearchAgentPage) with scoped dark theme under .agent-root; zero edits to legacy zeroai module.
  - Route /research-agent behind ProtectedRoute (login required for per-user metering); legacy /0-ai left reachable at its URL (it has no nav entry).

## [0.39.3] - 2026-08-16

### Added
- **Route submissions through chat-first mode with research handoff (`app/src/pages/zeroai/ZeroAIWorkspace.tsx`)**:
  - Route submissions through chat-first mode with research handoff.

## [0.39.2] - 2026-08-16

### Added
- **Chat stage, AUTO/CHAT/RESEARCH mode selector and ambiguity popup (`app/src/components/zeroai/ChatStage.tsx, app/src/components/zeroai/HeroInput.tsx, app/src/components/zeroai/ModeSegment.tsx, app/src/components/zeroai/ResearchPromptDialog.tsx, app/src/styles/zeroai.css`)**:
  - Chat stage, AUTO/CHAT/RESEARCH mode selector and ambiguity popup.

## [0.39.1] - 2026-08-16

### Added
- **Intent router (probe + local rules) and quick-chat engine (`app/src/lib/zeroai/chat.ts, app/src/lib/zeroai/intent.ts`)**:
  - Intent router (probe + local rules) and quick-chat engine.

## [0.39.0] - 2026-08-16

### Fixed
- **Lower submit gate to 2 chars and hint why when too short (`app/src/components/zeroai/HeroInput.tsx`)**:
  - Lower submit gate to 2 chars and hint why when too short.

## [0.38.5] - 2026-08-16

### Changed
- **Ignore private 0-AI architecture doc (`.gitignore`)**:
  - Ignore private 0-AI architecture doc.

## [0.38.4] - 2026-08-16

### Added
- **Real planner agent with BYOK decomposition engine (`app/src/App.tsx, app/src/components/zeroai/DecompositionView.tsx, app/src/data/zeroAiTypes.ts, app/src/lib/zeroai/llm.ts, app/src/lib/zeroai/planner.ts`)**:
  - Workspace shell (/0-ai) orchestrates idle -> planning -> processing -> completed. Planner decomposes the topic into the four research dimensions (contracts, keywords, search boundaries) via the configured BYOK LLM (gemini/openai/anthropic) with schema validation and a deterministic fallback template. Pure-browser runtime, 15s call timeout.

## [0.38.3] - 2026-08-16

### Added
- **Add mock deep-research workspace components (`app/src/components/zeroai/ByokSettingsModal.tsx, app/src/components/zeroai/CitationPill.tsx, app/src/components/zeroai/ExportToolbar.tsx, app/src/components/zeroai/HeroInput.tsx, app/src/components/zeroai/JsonInspectDialog.tsx`)**:
  - Phase 1 client-side mock UI: scoped dark theme, chat-style composer, telemetry simulation, citation-graded report canvas, exports, BYOK keys and history persisted in localStorage only. No backend, no new packages.

## [0.38.2] - 2026-08-13

### Fixed
- **Mentors Could Not See Their Interns (`supabase/migrations/042_mentor_read_company_applications.sql`)**:
  - `/company/interns` lists interns from the company's accepted applications, but the applications SELECT policy only granted company read access to owner/admin/hr/reviewer roles — `mentor` was missing, so a mentor's query returned zero rows and the page always showed "No active interns found".
  - Migration 042 extends the read policy to include the `mentor` role (the interns tab is granted to mentors in the tab matrix). Mentors gain read-only access; they still cannot modify application status.
  - Also corrects the release numbering: the previous two releases were renumbered per GIT_WORKFLOW (patch series caps at 5, then the minor bumps — 0.37.6 → 0.38.0, 0.37.7 → 0.38.1).

## [0.38.1] - 2026-08-13

### Security
- **Guaranteed RLS on `applications` Table (`supabase/migrations/041_enforce_applications_rls.sql`)**:
  - The `applications` table can predate migration 004 (which enables row-level security); if the table was created outside the migration history, RLS may stay disabled while later migrations silently succeed — letting any authenticated student read every application.
  - Migration 041 unconditionally `ENABLE ROW LEVEL SECURITY` on `public.applications` and re-creates the canonical read policy (applicant sees own, verified-company owner / team admin·hr·reviewer, or platform admin) so the table is locked down regardless of history.

## [0.38.0] - 2026-08-13

### Fixed
- **Student Applications Queries No Longer Rely on RLS Alone (`app/src/services/applications.ts`)**:
  - `getMyApplications` and `getMyActiveApplicationsCount` fetched `applications` without a `student_id` filter, relying entirely on database RLS to hide other students' rows — if RLS is ever disabled or missing, `/student/applications` shows every applicant's data to any student.
  - Both queries now filter `.eq('student_id', user.id)` so a student can never fetch another student's applications, even if the database layer is misconfigured.

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
