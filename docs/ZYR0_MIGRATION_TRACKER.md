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
- [ ] npm run build (typecheck + sitemap regen)
- [ ] Commit + push → GitHub Actions (Vercel frontend + supabase functions deploy)
- [ ] supabase functions list — confirm deployed
- [ ] Test send to ik7408008@gmail.com from team@zyroo.org → last_event + inbox (not spam)

---

## Open decisions
1. Email Routing destination inbox: ___
2. Site DNS now or email-only today: ___
3. Transactional sender: team@zyroo.org (recommended) vs noreply@zyroo.org: ___

## Reference
- Supabase project: iczhrvgzbnuvlgjfzeol · Resend domain id (old): 19e3888e-…
- Live DNS matrix (2026-08-05) in docs/DNS_EMAIL_RECORDS.md
