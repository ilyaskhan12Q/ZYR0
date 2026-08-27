# SaaS Ecosystem Rebrand — Cleanup & Fixes Plan

## Context

The `feat/saas-ecosystem-rebrand` branch introduced a multi-product SaaS homepage and product surfaces. All 8 implementation phases are complete but the codebase has **12 issues** that need fixing before merge: broken navigation, dead code, SEO bugs, and inconsistencies.

---

## Phase 9: Navigation Unification

**Problem:** Two completely separate navbars and footers exist — `PlatformNavbar` (SaaS pages) and `PublicLayout` nav (internship pages). Users feel like they switched websites when navigating between `/` and `/internships`.

### 9A. Unify the navbar into a single shared component
- **File:** `app/src/components/nav/PlatformNav.tsx` (new, replaces both)
- **Approach:** Merge `PlatformNavbar`'s mega-dropdown design with `PublicLayout`'s nav structure
  - Use the dark, floating-pill aesthetic from `PlatformNavbar` (better UX)
  - Include all 4 products (Studio, School OS, Research, Work) — not just 3
  - Add Solutions/Pricing/About/Contact links
  - Auth controls: Sign In (`/login`) + Get Started (`/register`)
  - Responsive: hamburger on mobile, mega-dropdown on desktop
- **Delete:** `app/src/components/nav/ProductsDropdown.tsx`, `app/src/components/nav/ResourcesDropdown.tsx` (merged into new nav)
- **Delete:** `app/src/components/platform-home/PlatformNavbar.tsx` (replaced by unified nav)
- **Update:** `app/src/layouts/PublicLayout.tsx` — replace inline nav + dropdown imports with `<PlatformNav />`
- **Update:** `app/src/pages/public/PlatformHome.tsx` — use `<PlatformNav />` instead of `<PlatformNavbar />`
- **Update:** All standalone pages (`/studio`, `/school`, `/research`) — use `<PlatformNav />`

### 9B. Unify the footer into a single shared component
- **File:** `app/src/components/nav/PlatformFooter.tsx` (rename from `platform-home/PlatformFooter.tsx`)
- **Approach:** Merge both footers
  - 6-column layout (Products, Solutions, Company, Legal + Brand column)
  - Product links: Studio, School OS, Research, Work, Browse Internships
  - Solutions: For Developers, For Schools, For Students, For Companies
  - Company: About, Careers, FAQ, Contact, Verify Certificate
  - Legal: Privacy, Terms, Cookies, Security → `/contact`
  - Social: LinkedIn, WhatsApp, GitHub (remove broken X/Twitter link)
  - Copyright: `© {year} ZYR0` (unified name, dynamic year)
  - Live status indicator from current `PlatformFooter`
- **Delete:** Inline footer in `PublicLayout.tsx` (lines ~441-572)
- **Update:** `app/src/layouts/PublicLayout.tsx` — render `<PlatformFooter />` after `<Outlet />`
- **Update:** All standalone pages — use the same `<PlatformFooter />`

---

## Phase 10: Routing Fixes

### 10A. Fix `Landing.tsx` SEO path
- **File:** `app/src/pages/public/Landing.tsx`
- **Change:** `path="/"` → `path="/internships"`

### 10B. Add redirect from `/internships` → `/internships/browse` for old external links
- **File:** `app/src/App.tsx`
- **Add:** `<Route path="/internships" element={<Navigate to="/internships/browse" replace />} />`
- **Wait — this conflicts** with the current `/internships` → `Landing` route. The user wants `/internships` to be the internship landing page. So **no redirect needed** — the old catalog links should be updated externally. Keep current routing.

### 10C. Implement `work.zyroo.org` subdomain gateway
- **File:** `app/src/App.tsx`
- **Add:** `if (productSubdomain === 'work')` branch with:
  - `/` → `Landing` (internship landing)
  - `/browse` → `BrowseInternships`
  - Auth routes
  - `*` → `SubdomainRedirect`

### 10D. Fix `/blog` dead link
- **File:** `app/src/components/nav/PlatformFooter.tsx` (the unified footer)
- **Change:** Remove or disable the `/blog` link until a blog page exists. Or redirect to `/#faq` as a temporary measure.

### 10E. Fix anchor links for non-homepage navigation
- **File:** `app/src/components/nav/PlatformNav.tsx` (the unified nav)
- **Fix:** When clicking `#solutions`, `#pricing`, etc. from a non-homepage route, navigate to `/#solutions` first, then scroll.

---

## Phase 11: Dead Code Cleanup

### 11A. Delete orphaned Framer components (8 files)
These are never imported by any route:
- `app/src/components/platform-home/ProductOverview.tsx`
- `app/src/components/platform-home/ProgressSection.tsx`
- `app/src/components/platform-home/BlogSection.tsx`
- `app/src/components/platform-home/TeamSection.tsx`
- `app/src/components/platform-home/ToolsSection.tsx`
- `app/src/components/platform-home/BenefitsSection.tsx`
- `app/src/components/platform-home/GlobalSection.tsx`
- `app/src/components/platform-home/TestimonialsSection.tsx`

### 11B. Remove legacy CSS
- **File:** `app/src/styles/platform-home.css` — delete (Framer token system, Instrument Sans from dead paths, not consumed by new Tailwind components)
- **File:** `app/src/pages/public/PlatformHome.tsx` — remove `import '@/styles/platform-home.css'`

### 11C. Clean up unused data exports
- **File:** `app/src/components/platform-home/data.ts`
  - Remove `navLinks`, `navCta`, `navSignIn` (nav is now hardcoded in unified `PlatformNav`)
  - Remove `hero` (hero text is hardcoded in `HeroSection`)
  - Remove `clientLogos` (never rendered)
  - Remove `accentGradient` from `productsList` items (never used)
  - Keep: `productsList`, `ecosystemSolutions`, `pricing`, `faqItems`, `footerNav`, `stats`

### 11D. Remove empty demo file
- **File:** `app/src/data/researchLandingDemo.ts` — delete (only contains a comment)

---

## Phase 12: Consistency Fixes

### 12A. Fix product naming in BentoProductGrid
- **File:** `app/src/components/platform-home/BentoProductGrid.tsx`
- **Change:** Card 3 badge "AI Agent" → "Deep AI Agent" (matches `data.ts`)

### 12B. Fix "Security" footer link
- In unified footer, keep "Security" → `/contact` but add a note that this is intentional (no dedicated security page yet)

### 12C. Fix X/Twitter social link
- **File:** unified footer
- **Change:** Remove or update `https://x.com` to a real ZYR0 profile URL (or remove the link entirely)

---

## Execution Order

| Step | Phase | Description | Estimated Changes |
|---|---|---|---|
| 1 | 9A | Create unified `PlatformNav` component | 1 new file, 4 edits |
| 2 | 9B | Unify footer | 1 rename, 3 edits |
| 3 | 10A-E | All routing fixes | 3 edits |
| 4 | 11A-D | Dead code cleanup | 10 deletes, 2 edits |
| 5 | 12A-C | Consistency fixes | 3 edits |

## Verification

After each phase:
1. `npx tsc --noEmit` — TypeScript check
2. `npm run build` — Production build check
3. Manual route testing: `/`, `/internships`, `/internships/browse`, `/studio`, `/school`, `/research`, `/0-ai`
