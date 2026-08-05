# ZYR0 Domain Migration Tracker — zyroo.dpdns.org → zyroo.org

Migrate email + site references from the free dynamic-DNS domain `zyroo.dpdns.org`
(and stale `zyr0.com` placeholders) to the purchased Cloudflare domain `zyroo.org`.
Email route: Resend (verified domain) + Cloudflare Email Routing for mailboxes.

Started: 2026-08-05 · Branch: `fix/internship-card-light-theme`
Source:  https://github.com/ilyaskhan12Q/ZYR0

## Legend
- [ ] pending  ·  [x] done  ·  (→) in progress

---

## Phase 1 — Cloudflare: email routing + site DNS (user, ~10 min)
- [x] Buy domain @ Cloudflare Registrar — registered, NS live (deb/keaton.ns.cloudflare.com)
- [x] Enable Email Routing → forwarding rules to personal inbox:
      info@, support@, careers@, partnerships@, privacy@, legal@, security@ (7 rules added)
- [ ] Add site DNS (CNAME zyroo.org → Vercel; www CNAME → zyroo.org)
- [x] VERIFY (I run): dig MX/TXT zyroo.org shows Cloudflare Email Routing records
      MX: route1/2/3.mx.cloudflare.net · SPF: include:_spf.mx.cloudflare.net ✓

## Phase 2 — Verify domain in Resend
- [x] Add zyroo.org in Resend (dashboard or API via send-email edge function)
      NOTE: account switched mid-migration — DKIM key replaced with new account's (C5etom7...)
- [x] Paste DKIM + SPF records into Cloudflare DNS
- [x] Confirm Resend domain status: verified (dashboard); all 3 records byte-exact match live DNS
      Domain id: e7fcb63b-5cb1-4431-97bd-31c46a7a5067 (first add, old key) → removed
      Final domain id (new account, key re_K5LL...): 6409c771-2535-4c8e-be1c-ae135997f41d — VERIFIED
- [x] RESEND_API_KEY secret updated in Supabase (new account key)

## Phase 3 — Code migration
- [x] Edge functions:
      - send-email/index.ts (default from/replyTo → team@zyroo.org, sanitization allows only zyroo.org)
      - issue-certificate/index.ts (10 refs: SITE_URL, footer, from/replyTo)
      - .env.example × 2 (APP_URL / VITE_SITE_URL → https://zyroo.org)
- [x] App code:
      - TeamApplications.tsx:90 · OfferLetters.tsx:129-130 · Settings.tsx (noreply@zyroo.org)
      - site.ts (supportEmail + fallback URL)
      - Public pages: Contact, FAQ, PrivacyPolicy, TermsOfService, CookiePolicy,
        HelpCenter, Landing (support@zyroo.org), team-data
      - mockData.ts, notificationsSim.ts
      (localStorage keys zyr0_company_settings / zyr0_admin_settings left unchanged)
- [x] Static/SEO: security.txt (+.well-known), humans.txt, llms.txt, opensearch.xml,
      robots.txt, sitemap.xml (regens at build), generate-seo.js, vite.config.ts, SEO.tsx comment
- [x] Docs: SECURITY.md (security@zyroo.org), DNS_EMAIL_RECORDS.md (marked superseded), CHANGELOG entry

## Phase 4 — Deploy & verify
- [x] npm run build (typecheck + sitemap regen)
- [x] Commit + push → PR #65 merged to main → GitHub Actions deploy (Vercel frontend + supabase functions)
- [x] supabase functions list — send-email v29, issue-certificate v41 deployed (2026-08-05 16:29)
- [x] Test send to ik7408008@gmail.com from team@zyroo.org → **last_event: delivered** ✓ (id 492a5197-6f84-4218-b4eb-281fa99be511)

## Contact form (post-migration) — 2026-08-05
- [x] Migration 034 `contact_messages` table (INSERT anon/auth; SELECT/UPDATE admin-only via `public.is_admin()`)
- [x] `send-email` edge function: `kind: 'contact'` mode (allowlist support/info/partnerships/careers@zyroo.org, honeypot `website`, rate limits 3/email + 5/IP per 10min, length caps, sanitized HTML, service-role insert, reply-to = submitter)
- [x] Internal sends now require `x-internal-token` == `EMAIL_INTERNAL_TOKEN` (set on Supabase via deploy workflow; client sends `VITE_EMAIL_INTERNAL_TOKEN` from Vercel env; `issue-certificate` passes it too)
- [x] Contact.tsx real submission (status machine, honeypot field, error banner, success text)
- [x] Admin Inbox `/admin/inbox`: search, tabs, detail dialog, mailto reply, mark read/replied; nav entry
- [x] PR #68 merged → deployed (Vercel env + Supabase secret + migration 034 + edge functions)
- [x] Rate limiting made DB-backed (in-memory buckets reset per isolate; counts recent `contact_messages` rows by email + stable SHA-256 `ip_hash`)
- [x] Live test matrix ✓:
  - Contact submit → `support@zyroo.org` → **delivered** to team Gmail (multiple Resend ids confirmed)
  - Honeypot filled → `{"success":true,"id":null,"honeypot":true}` silently dropped
  - Foreign `to: attacker@evil.com` → 403 "Invalid recipient"
  - Internal send without token → 403 "Forbidden"; with token → delivered
  - 4th rapid submit same email → **429** (email limit 3/10min) ✓
  - 6th submit same IP fresh emails → **429** (IP limit 5/10min) ✓
  - anon RLS read of contact_messages → `[]` (admin-only) ✓
- [ ] Manual: admin inbox UI renders rows + mark read/replied (needs admin login in browser)

---

## DONE — 2026-08-05
- Domain `zyroo.org` live: Email Routing MX (route1/2/3.mx.cloudflare.net), SPF (cloudflare + amazonses), DKIM (resend._domainkey, new account key C5etom7…)
- Resend domain verified (id 6409c771-2535-4c8e-be1c-ae135997f41d, key re_K5LL…) — sending enabled
- Test email **delivered** from team@zyroo.org (first ever successful delivery vs. Gmail-reputation bounces on zyroo.dpdns.org)
- **Confirmed received in ik7408008@gmail.com inbox** ✓
- zyroo.org → 200 (app) · zyroo.dpdns.org → 307 → zyroo.org · og:url/sitemap on zyroo.org
- VITE_SITE_URL=https://zyroo.org added to Vercel prod env; fresh deploy via PR #66 picked it up

---

## Open decisions
1. Email Routing destination inbox: ___
2. Site DNS now or email-only today: ___
3. Transactional sender: team@zyroo.org (recommended) vs noreply@zyroo.org: ___

## Reference
- Supabase project: iczhrvgzbnuvlgjfzeol · Resend domain id (old): 19e3888e-…
- Live DNS matrix (2026-08-05) in docs/DNS_EMAIL_RECORDS.md
