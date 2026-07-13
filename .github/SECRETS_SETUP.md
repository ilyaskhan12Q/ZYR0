# GitHub Secrets Setup Guide

Before any workflow can run deployments, add these secrets to your GitHub repo:
**Settings → Secrets and variables → Actions → New repository secret**

---

## Required Secrets

### Vercel (Frontend Deployment)

| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` in `app/` — shown in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above — `.vercel/project.json` → `projectId` |

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. `cd app && vercel link` (login and link to your project)
3. Copy values from `app/.vercel/project.json`

---

### Supabase (Migrations + Edge Functions)

| Secret | Where to get it |
|--------|----------------|
| `SUPABASE_ACCESS_TOKEN` | supabase.com → Account → Access Tokens → Generate |
| `SUPABASE_PROJECT_REF` | Your project URL: `https://YOUR_REF.supabase.co` |
| `SUPABASE_DB_URL` | Supabase Dashboard → Settings → Database → Connection string (URI mode) |

---

### Vercel Environment Variables (set via Vercel Dashboard)

These are NOT GitHub secrets — set them in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://YOUR_REF.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your project's anon key | Production, Preview |

---

## Branch Protection Rules (set in GitHub)

For complete details on our branching strategy and branch governance, refer to the [Git Workflow & Branching Strategy](file:///home/ilyaskhan/Projects/zyro-kim/docs/GIT_WORKFLOW.md).

Go to: **Settings → Branches → Add rule** for both `main` and `develop`:

### Rule for `main` (Production Branch)
- [x] Require a pull request before merging (target: `develop` -> `main` releases)
- [x] Require status checks to pass before merging
  - Required checks: `ESLint`, `TypeScript`, `Vite Build`, `SQL Migrations`
- [x] Require branches to be up to date before merging
- [x] Require linear history
- [x] Do not allow bypassing the above settings

### Rule for `develop` (Integration Branch)
- [x] Require a pull request before merging (target: `feature/*` or `bugfix/*` -> `develop`)
- [x] Require status checks to pass before merging
  - Required checks: `ESLint`, `TypeScript`, `Vite Build`, `SQL Migrations`
- [x] Require linear history
- [x] Do not allow bypassing the above settings


---

## Vercel Project Configuration

In `vercel.json` (already created at `app/vercel.json`):
- Root directory: `app`
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

---

## Supabase Edge Function Secrets

Set these in **Supabase Dashboard → Edge Functions → Secrets**:

```
RESEND_API_KEY=re_your_resend_key
```

The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected
by Supabase into every Edge Function — no manual setup needed.
