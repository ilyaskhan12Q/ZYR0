# ZYR0 — Security Engineer Onboarding

> Welcome to the team, **<Name>** 👋
> This document is your introduction to ZYR0, your role, and how you will contribute.
> Read it fully. Ask anything. There are no wrong questions here.

---

## 1 · What ZYR0 Is (5 lines)

- ZYR0 is an **internship and workforce-readiness platform**.
- Companies host **structured internships** on real, public GitHub projects.
- Students apply, receive tasks, submit work, and get **rubric-based feedback** from mentors.
- Graduates earn **cryptographically verified digital certificates** (QR codes).
- Tech: React 19 + TypeScript + Vite, backed by Supabase (PostgreSQL + RLS + Edge Functions).

**Your job:** make this platform **hard to break** — and easy to trust.

---

## 2 · The Product in One Picture

```
                    USERS
      (students · companies · mentors · admins)
                     │
                     ▼
        ┌───────────────────────────┐
        │  Web App (React + Vite)   │
        │  app/src/pages + services │
        └────────────┬──────────────┘
                     │
        ┌────────────▼──────────────┐
        │       Supabase            │
        │  ┌────────────────────┐   │
        │  │ Auth (JWT + RBAC)  │   │
        │  │ Postgres + RLS     │   │
        │  └────────────────────┘   │
        │  Edge Functions           │
        │  · send-email             │
        │  · issue-certificate      │
        │  · verify-certificate     │
        └───────────────────────────┘
```

> 🛡️ **Every arrow in this diagram is an attack surface.** Your job is to defend each one.

---

## 3 · Your Role in One Sentence

> **"Find every way someone could break ZYR0 — and close it."**

You are part of the **first security team**. The platform already enforces Row-Level Security (RLS),
JWT auth, and environment-isolated secrets. Your job is to **audit, test, harden, and prove** that
those defenses hold — and to find what we missed.

---

## 4 · Your Responsibilities

- **Audit** all Supabase RLS policies in `supabase/migrations/` — line by line.
- **Test** that users can only touch their own data (students ≠ companies ≠ admins).
- **Review** every Edge Function (`send-email`, `issue-certificate`, `verify-certificate`)
  for input validation, rate limits, and abuse.
- **Check** forms and API surfaces against OWASP basics (injection, XSS, broken access control).
- **Document** findings clearly: what's wrong, how to reproduce it, severity, fix suggestion.
- **Guard secrets hygiene** — keys never in code, never in client bundles, never in commits.
- **Handle reports** per `SECURITY.md` — private disclosure, not public issues.

---

## 5 · In Scope / Out of Scope

| ✅ In your scope | ❌ Out of scope (for now) |
|---|---|
| RLS policy audit & tests | Direct production environment access |
| Edge Function security review | Changing live credentials/keys |
| OWASP-style code & form checks | Fixing security issues alone without review |
| Writing security test scripts | Publicly disclosing findings |
| Security documentation & checklists | New infrastructure / hosting changes |

> **Transparency:** you will have full *read* access and **supervised** write access.
> No one touches production alone — that rule protects you and the platform.

---

## 6 · Where Things Live (Folder Map)

```
zyro-kim/
├── app/                        ← the web app (React + TypeScript)
│   └── src/
│       ├── pages/              ← views (student, company, mentor, admin, public)
│       ├── services/           ← Supabase data layer (SWR caching)
│       └── lib/                ← utilities
├── supabase/
│   ├── migrations/             ← database + RLS policies (SQL)  ← KEY AREA
│   └── functions/              ← Edge Functions (server-side)   ← KEY AREA
├── docs/                       ← architecture, principles, guides
├── SECURITY.md                 ← vulnerability reporting policy  ← READ FIRST
└── CHANGELOG.md                ← every meaningful change is logged
```

---

## 7 · How Work Flows

```
Understand → Investigate → Plan → Implement → Verify → Commit → Open PR
```

1. **Understand** — what data is this protecting, and who should see it?
2. **Investigate** — read the policy/function carefully. Trace the data flow.
3. **Plan** — describe the vulnerability and your fix before touching code.
4. **Implement** — small, minimal, reviewable changes.
5. **Verify** — prove the attack no longer works (test script, manual repro).
6. **Commit** — small atomic commits, imperative mood
   (`fix(rls): restrict task reads to internship members`).
7. **Open PR** — explain the vulnerability, impact, and proof of fix.

> **Never commit directly to `main`.** Always a branch → PR → review.

---

## 8 · Your First 2 Weeks (Checklist)

- [ ] Read `SECURITY.md` first — the reporting process is your home turf.
- [ ] Read `README.md` + `docs/ARCHITECTURE.md` (platform overview).
- [ ] Read `docs/ENGINEERING_PRINCIPLES.md` (the security model section).
- [ ] Set up the dev environment (`app/` → `npm install` → `npm run dev`).
- [ ] Open the app as a student, company, and admin. Test what you can touch vs. what you can't.
- [ ] Read all RLS policies in `supabase/migrations/` — make a table of "who can read/write what".
- [ ] Audit the `send-email` Edge Function end-to-end (rate limits, sanitization, tokens).
- [ ] Write your first **security report**: one finding, one suggested fix.
- [ ] Ask questions freely. We expect them.

---

## 9 · 30 / 60 / 90 Days

| Milestone | What "better" looks like |
|---|---|
| **Day 30** | Can explain every RLS policy; delivered 1–2 security reports with fixes |
| **Day 60** | Security test scripts written; Edge Function hardening review complete |
| **Day 90** | Full audit checklist documented; helped ship a verified hardening PR |

---

## 10 · How We Communicate

- **GitHub** = all work. Issues, branches, PRs, reviews.
- **WhatsApp** = quick questions, announcements, coordination.
- **Vulnerabilities are reported PRIVATELY** per `SECURITY.md` — never in public issues.
- **Blocked > 1 hour?** Ask. We respond fast. **No dumb questions — ever.**
- Weekly sync: what you found, what you fixed, what's blocking you.

---

## 11 · Honest Expectations

- We know you're a **student**. Experience is not a requirement — **curiosity and care are**.
- You will be **reviewed kindly**. Review is about making code better, not judging you.
- You will make mistakes. We all do. **Tell us early** — hiding problems is the only real mistake.
- You are not expected to know Supabase RLS, JWT, or OWASP yet. You **will** learn them here.
- **Transparency is a core value of ZYR0.** If something is unclear, we'd rather explain it twice than leave you guessing.

---

## 12 · What a Good Contribution Looks Like

A security report or PR that:
- explains the **impact** in plain language ("a student could read another student's submission")
- includes **repro steps** so anyone can verify it
- proposes a **minimal, safe fix** (not a rewrite)
- proves the fix works (test script, manual repro)
- is written with **respect** — finding bugs is a service, not an accusation

> Security isn't about being suspicious of your teammates.
> It's about being **thorough** so everyone's data stays safe.

---

*Welcome aboard. Let's make ZYR0 trustworthy — transparently, rigorously, together.* 🛡️
