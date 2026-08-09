# ZYR0 — AI Engineer Onboarding

> Welcome to the team, **<Name>** 👋
> This document is your introduction to ZYR0, your role, and how you will contribute.
> Read it fully. Ask anything. There are no wrong questions here.

---

## 1 · What ZYR0 Is (5 lines)

- ZYR0 is an **internship and workforce-readiness platform**.
- Companies host **structured internships** on real, public GitHub projects.
- Students apply, receive tasks, submit work, and get **rubric-based feedback** from mentors.
- Graduates earn **cryptographically verified digital certificates**.
- Tech: React 19 + TypeScript + Vite, backed by Supabase (PostgreSQL + RLS + Edge Functions).

**Your job:** make this platform *smarter* — with AI.

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

> 🔮 **The empty box on the diagram:** AI. That's where you come in.

---

## 3 · Your Role in One Sentence

> **"Find the places where ZYR0 should be smarter — and ship it safely."**

You are the **first AI engineer** on the team. There is **zero AI code in ZYR0 today**.
You are not maintaining an AI system — you are **building it from nothing**. That is rare and exciting.

---

## 4 · Your Responsibilities

- **Research** where AI adds real value (not hype) for students, companies, and mentors.
- **Prototype** ideas in a sandbox first — never directly in production code.
- **Propose** designs in writing before building (short doc + discussion).
- **Build** AI features as Supabase Edge Functions + clean service-layer code.
- **Measure** every feature: cost per call, response time, and accuracy.
- **Respect privacy** — student applications and submissions are personal data.

---

## 5 · In Scope / Out of Scope

| ✅ In your scope | ❌ Out of scope (for now) |
|---|---|
| AI feature research & prototyping | Production infrastructure changes |
| Edge Function integrations (LLM APIs) | Database schema changes without review |
| Prompts, evaluation, accuracy testing | Access to production secret keys |
| Cost & latency optimization | Deploying alone without review |
| Writing tests for AI features | Unpaid external AI services / new deps |

> **Transparency:** we will add scope as you earn trust. Nobody starts with everything.

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
│   ├── migrations/             ← database + RLS policies (SQL)
│   └── functions/              ← Edge Functions (server-side logic)
├── docs/                       ← architecture, principles, guides
└── CHANGELOG.md                ← every meaningful change is logged
```

---

## 7 · How Work Flows

```
Understand → Investigate → Plan → Implement → Verify → Commit → Open PR
```

1. **Understand** — what problem are we solving, and for whom?
2. **Investigate** — trace how the existing code handles this today.
3. **Plan** — short written plan + edge cases before writing code.
4. **Implement** — clean, typed, self-documenting code.
5. **Verify** — run `tsc`, build, test edge cases.
6. **Commit** — small atomic commits, imperative mood
   (`feat(ai): add skill-matching prototype`).
7. **Open PR** — explain what changed, why, and how you tested it.

> **Never commit directly to `main`.** Always a branch → PR → review.

---

## 8 · Your First 2 Weeks (Checklist)

- [ ] Read `README.md` + `docs/PRODUCT_VISION.md` (the "why").
- [ ] Read `docs/ARCHITECTURE.md` + `docs/ENGINEERING_PRINCIPLES.md` (the "how").
- [ ] Set up the dev environment (`app/` → `npm install` → `npm run dev`).
- [ ] Open the app as a student and a company. Click everything. Get lost on purpose.
- [ ] Read one Supabase Edge Function (`send-email`) end-to-end.
- [ ] Write a 1-page "Where AI could help ZYR0" research memo → discuss with team.
- [ ] Ship your **first small real task** (starter AI-adjacent or simple bug fix).
- [ ] Ask questions freely. We expect them.

---

## 9 · 30 / 60 / 90 Days

| Milestone | What "better" looks like |
|---|---|
| **Day 30** | Understands the codebase, shipped 1–2 small PRs, has a validated AI idea |
| **Day 60** | First AI prototype live in dev/staging, measured for cost + latency |
| **Day 90** | One AI feature shipped to production with tests and docs |

---

## 10 · How We Communicate

- **GitHub** = all work. Issues, branches, PRs, reviews.
- **WhatsApp** = quick questions, announcements, coordination.
- **Blocked > 1 hour?** Ask. We respond fast. **No dumb questions — ever.**
- Weekly sync: what you did, what's next, what's blocking you.

---

## 11 · Honest Expectations

- We know you're a **student**. Experience is not a requirement — **curiosity and care are**.
- You will be **reviewed kindly**. Review is about making code better, not judging you.
- You will make mistakes. We all do. **Tell us early** — hiding problems is the only real mistake.
- You are not expected to know LLM APIs, Supabase, or React yet. You **will** learn them here.
- **Transparency is a core value of ZYR0.** If something is unclear, we'd rather explain it twice than leave you guessing.

---

## 12 · What a Good Contribution Looks Like

A PR that:
- solves a **real problem** (not a clever one nobody needs)
- is **typed and clean** (no `any`, no dead code)
- **measures** its impact (cost, latency, accuracy)
- is **tested and documented**
- teaches you something new

> If you can explain *why* you built it, in plain language, you're already doing it right.

---

*Welcome aboard. Let's make ZYR0 smarter — safely, transparently, together.* 🚀
