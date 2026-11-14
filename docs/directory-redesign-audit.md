# ZYR0 Directory Redesign — Audit & Field Mapping

Date: 2026-11-14
Scope: Tools & Skills submission form, listing data, live preview, SEO metadata, public detail pages.

## 1. Existing architecture

| Layer | File | Role |
|---|---|---|
| Submission UI | `app/src/components/tools/SubmitToolDialog.tsx` | 3-stage dialog (basics → content → review) opened from `/tools`, student, company, and admin pages |
| Form helpers | `app/src/components/tools/submitToolForm.ts` | URL normalization, tags/lines parsing, Markdown insertion, browser-local draft storage, SEO defaults |
| Data service | `app/src/services/tools.ts` | `SubmitToolInput`, `submitTool()`, approved-listing reads, admin moderation |
| View model | `app/src/data/tools.ts` | `ToolItem`, `ToolItemType`, cover gradient |
| DB types | `app/src/lib/database.types.ts` | `DbTool`, `ToolInstallCommand` |
| Public list | `app/src/pages/public/ToolHub.tsx` | Category/type/search filters and cards |
| Public detail | `app/src/pages/public/ToolDetail.tsx` | Server-approved listing page at `/tools/:slug` |
| Listing preview | `app/src/components/tools/ToolPreviewDialog.tsx` | Public-style preview modal from cards |
| Shared Markdown | `app/src/components/markdown/MarkdownContent.tsx` | GFM rendering, highlighting, code copy, safe link/image handling |
| Head/SEO | `app/src/components/SEO.tsx` | Title, description, canonical, OG/Twitter, robots, JSON-LD |
| Static SEO | `app/scripts/generate-seo.js` | Sitemap, robots, pre-rendered HTML for crawlers |
| Schema | `supabase/migrations/058_create_tools.sql`, `062_*`, `078_*` | Tools table, RLS, install methods, SEO columns |

Callers of the submission dialog: `pages/public/ToolHub.tsx`, `pages/student/Tools.tsx`, `pages/company/Tools.tsx`, `pages/admin/Tools.tsx`.

## 2. The 16 publishing fields

| # | Form label | Form state | DB column | Required | Public presentation |
|---|---|---|---|---|---|
| 1 | Source URL / Repository or primary URL | `sourceUrl` | `source_url` | Yes | Hero primary action + sidebar source link |
| 2 | Item classification | `itemType` | `item_type` | Yes (default Tool) | Type badge in hero and sidebar |
| 3 | Tool / Skill name | `name` | `name` | Yes | Page `<h1>` |
| 4 | Category | `category` | `category` | Yes (default AI & Agents) | Category label linking to the filtered directory |
| 5 | One-sentence tagline | `tagline` | `tagline` | Yes | Hero tagline + meta description fallback |
| 6 | Detailed description | `description` | `description` | Yes | Rendered Markdown “Overview” |
| 7 | Source platform | `source` | `source` | Yes (default GitHub) | Hero/sidebar source metadata |
| 8 | Documentation URL | `docUrl` | `documentation_url` | No | Documentation action |
| 9 | Version / release | `version` | `version` | No | Sidebar version |
| 10 | Cover image URL | `imageUrl` | `image_url` | No | Hero image (gradient fallback) |
| 11 | Installation commands | `commands` | `install_commands` (JSONB) + `install_command` (first command) | No | Installation / setup section, one block per labelled method |
| 12 | Install notes | `installInstructions` | `install_instructions` | No | Notes under installation, or “Requirements & setup notes” when no command exists |
| 13 | Tags | `tagsInput` | `tags` | No | Hero chips + sidebar tag links |
| 14 | Key capabilities | `capabilitiesInput` | `capabilities` | No | “Key features” (tools) / “Capabilities” (skills) |
| 15 | Author / organization | `authorName` | `author_name` | DB default only (`Community Builder`) | Sidebar author |
| 16 | Author profile URL | `authorUrl` | `author_url` | No | Author link |
| Admin | Publication status | `adminStatus` | `status` | Admin only | Controls approval |
| Admin | Featured | `adminFeatured` | `featured` | Admin only | Featured badge / ordering |
| Admin | Custom badge | `adminBadge` | `badge` | Admin only | Badge chip |
| Admin | Card hero color | `adminCoverColor` | `cover_color` | Admin only | Gradient when no image |

Source URL is displayed in Stage 1 and as “Repository or primary URL” in the technical section, but both inputs use the same `sourceUrl` state, so there is no duplicate source of truth. New URL/SEO fields (not part of the original 16): `slug` (existing column, now editable) plus `seo_title` and `seo_description` (migration 078).

Submission workflow: authenticated insert → `status = 'pending'` for normal users → admin approves/rejects in `/admin/tools`. Admins may publish directly from the dialog. RLS still requires non-admin inserts to be `pending` and owned by the caller. The form never auto-publishes for non-admins.

## 3. Submission-to-public mapping (before this change)

| Submitted value | Actual public behaviour | Verdict |
|---|---|---|
| Type | Badge shown; label “Tool/Skill” | OK |
| Name | `<h1>` and card title | OK |
| Category | Hero pill and sidebar | OK |
| Tagline | Hero paragraph; meta description | OK |
| Description | **Custom regex renderer**, not Markdown. `##`, `-`, tables, code fences displayed literally; `->` sequences converted into a “workflow pipeline”; indented blocks converted to quotes | **Broken** |
| Source | Badge/pill | OK |
| Source URL | Primary CTA | OK |
| Documentation URL | Sidebar link only | OK but not in header |
| Cover image | Hero `<img>` | **Blocked for arbitrary hosts by CSP `img-src`** |
| Version | Meta row/sidebar | OK |
| Installation commands | Only `installCommand` (first method) rendered; `installCommands` ignored | **Data loss** |
| Install notes | Rendered under the single command | OK |
| Tags | Hero chips and sidebar links | OK |
| Author name | Hero meta + sidebar | OK |
| Author URL | Links | OK |
| Capabilities | Regex split on any `-` or `:`; “OpenAI-compatible server” was split into label/value | **Mangled** |
| Admin status/featured/badge/color | Applied | OK |

Additional findings:

- The public read policies on `tools` and `blogs` currently fail for anonymous visitors in the linked database: `GET /rest/v1/tools?select=slug` returns `42501 permission denied for table profiles`. A `FOR ALL` admin policy evaluates a `profiles` subquery for `anon`, and migration 063 revoked `profiles` SELECT from `anon`. Migration `077_fix_tools_and_blogs_anon_access.sql` (authored on another branch) fixes this with `public.is_admin()` and an explicit `GRANT SELECT`. It is restored in this branch because the public directory cannot be verified or used without it.
- `ToolPreviewDialog` used a different Markdown style than the detail page, so “preview” and the live page disagreed.
- When tags or capabilities were empty, the submit handler invented `['Developer']` and `['Fast workflow execution']`. That violated “do not invent information” and is removed.
- `GitLab` was offered in the submission form but missing from the `ToolSource` union.
- No field exists for license, supported agents, or supported platforms. The public page must not invent them; they can only be communicated through the description, tags, and capabilities.

## 4. SEO audit

### Before

- Client-rendered detail page set title `Name — ZYR0 ToolHub`, description = tagline, canonical `/tools/:slug`. No keywords, image, or JSON-LD.
- No editable/unique SEO title or meta description were stored. Every listing inherited a generic title pattern.
- Slug was generated from the name plus a random 4-character suffix and could not be edited.
- Pre-rendering created a static HTML file per approved tool **with meta tags but no body content**: `generateBodyHtml()` had no `tool_detail` branch, so crawlers without JS saw an empty root.
- Tool structured data claimed `offers.price = 0`, `operatingSystem = Cross-platform`, and `author.@type = Person` without any verified data.
- The 404 view for a missing tool had no `noIndex`.
- Sitemap generation includes approved tools at build time only; a newly approved listing is not in `sitemap.xml` until the next production build.
- `public/sitemap.xml` is rewritten during build; only approved rows are added.

### After

- SEO section in Stage 2: page title, meta description, URL slug, and a live Google-style preview. Defaults are derived from the submitted name, type, category, and tagline; nothing is invented. Users can generate the defaults, edit them, or clear an override to fall back to the generated default.
- `seo_title` / `seo_description` persisted (migration 078). `slug` is editable and normalized to lowercase/hyphens; uniqueness is enforced by the existing unique index and surfaced as a readable error.
- Detail page emits canonical, description, keywords, OG image (when the cover is an absolute URL), and JSON-LD (`SoftwareApplication` + `BreadcrumbList`). The page keeps a single `<h1>`; Markdown headings are shifted to stay below it.
- Pre-rendered tool pages now contain semantic fallback HTML (H1, tagline, description, capabilities, installation, author, version, links). All database values are HTML-escaped; the minimal Markdown converter never injects raw HTML.
- Structured data uses the listing URL as `url`, the source URL as `sameAs`, the real category/type, and only verified version/image values. Fabricated price/OS/author-type claims removed.
- Missing listings are `noindex, nofollow`. Only approved listings are fetched for public routes, previews, pre-rendering, and sitemap entries.
- Internal links point to the category filter, tag search, ToolHub, and related listings.

## 5. Implementation summary

- `SubmitToolDialog.tsx`: SEO section, slug state, validation, draft integration, no fabricated tag/capability defaults, shared Markdown renderer.
- `submitToolForm.ts`: SEO title/description builders, SEO limits, draft schema additions.
- `MarkdownContent.tsx` + `index.css`: shared safe Markdown renderer with GFM tables, code highlighting, per-block copy, responsive tables, external-link `rel`, lazy images.
- `ToolDetail.tsx`: rewritten header, overview, features, installation methods, notes, sidebar, related listings; type-aware labels for tools vs skills.
- `ToolPreviewDialog.tsx`: shared Markdown renderer and clipboard helper.
- `services/tools.ts`, `data/tools.ts`, `database.types.ts`: slug/SEO fields, mapping, unique-slug error, `GitLab` source.
- `lib/slug.ts`, `lib/clipboard.ts`: shared pure helpers.
- `scripts/generate-seo.js`: tool body pre-render, escaped Markdown fallback, SEO fields in meta, honest structured data.
- `supabase/migrations/077_*`: restored anonymous read fix (not new logic).
- `supabase/migrations/078_add_tools_seo_fields.sql`: SEO columns.
- `vercel.json`: `img-src` allows `https:` cover images.

## 6. Compatibility risks

1. **Apply migrations before deploying app code.** Migration 078 must run before the new insert payload (`seo_title`, `seo_description`) is used, or submissions fail with “column does not exist”. Migration 077 is required for anonymous directory reads.
2. Slug uniqueness is checked by the database, not a pre-flight request. A collision shows “That URL slug is already in use”; the user must edit the slug. RLS hides other users' pending rows, so a client-side availability check would be unreliable.
3. New listings submit a clean slug when the SEO field has a value. Older clients/callers without a slug keep the collision-resistant random suffix. Existing public URLs are unchanged.
4. Drafts saved before this change restore with empty SEO/slug fields; defaults and generation handle them.
5. Heading levels inside Markdown are shifted down one (H1→H2, H2→H3) to preserve a single page H1. Authors who used H1 in descriptions will see H2 on the public page.
6. The pre-rendered fallback supports headings, lists, quotes, paragraphs, inline bold/code/links. Tables render as text until the SPA hydrates. Google renders JS; other crawlers still get readable content.
7. `img-src https:` intentionally allows any HTTPS cover image. It does not allow scripts; images remain a low-risk resource.
8. Syntax highlighting adds `rehype-highlight` and `highlight.js`. No other runtime dependency was added.
9. Admin-only controls remain gated by `profile?.role === 'admin'`; non-admin payloads omit status/featured/badge/cover color.
10. Sitemap freshness remains build-time. Rebuild after approving listings, or add an on-demand sitemap job later.

## 7. Verification

| Check | Result |
|---|---|
| `npx tsc -b` | Passed |
| ESLint on every changed TS/TSX file | Passed |
| `npm run build` (Vite + SEO generation) | Passed; 20 static URLs plus dynamic company/internship pages were generated |
| Pure helper assertions (`slugify`, SEO builders, tag/line parsing, draft emptiness) | Passed |
| Pre-render escape/Markdown assertions | Passed (heading, list, inline code, link escaping, code-fence escaping, quote; meta text escaped; JSON-LD `<` escaped) |
| Playwright: Tool submission | Passed. Filled all 3 stages, generated SEO, saved + restored a draft, submitted, captured payload |
| Playwright: Skill submission | Passed. Same dialog after “Submit another”; `item_type = skill`, skill-specific SEO title |
| Payload assertions | Tool: 2 install methods, 3 tags, 3 capabilities, clean slug, SEO fields, `status = pending`. Skill: 1 install method, 2 tags, 2 capabilities, clean slug, `status = pending` |
| Playwright: public Tool page | Passed. Single H1, rendered Markdown heading/table/code/quote/link, both installation methods, capability split, copy code + copy command, `index, follow`, canonical, JSON-LD without fabricated price/OS, `sameAs` source |
| Playwright: public Skill page | Passed. “Capabilities” and “Setup & usage”; no “Installation” heading |
| Playwright: missing listing | Passed. “Tool Not Found” with `noindex, nofollow` |
| Playwright: mobile | Passed at 390×844. Editor Write/Preview tabs render Markdown; SEO fields fit with 0px horizontal overflow inside the dialog; detail page is single-column |
| Markdown safety | Passed. Raw `<script>`, `onerror` image, and `javascript:` links did not execute or reach the DOM |

The browser run used intercepted Supabase REST responses and a synthetic authenticated session, because:
- the linked database has no applied 077/078 migrations;
- anonymous reads are still blocked by the policy described in §3;
- no database password/service role was available to apply migrations or approve a real listing.

Consequently, the **real** create → pending → admin approve → public page round trip was not executed against the live database. The submission payload, RLS-compatible `status`, public mapping, and rendering path were verified with the same payloads.

## 8. Remaining issues / next steps

1. Apply `077_fix_tools_and_blogs_anon_access.sql` and `078_add_tools_seo_fields.sql` before deploying this code. Until 078 is applied, submissions fail because `seo_title` / `seo_description` do not exist. Until 077 is applied, anonymous visitors still get 401s.
2. Run one real authenticated submission, approve it in `/admin/tools`, and open `/tools/<slug>` after deploy to confirm the live RLS path and sitemap page.
3. Sitemap entries are generated at build time. Add an on-demand rebuild/ISR-style sitemap refresh if listings are approved frequently.
4. There are still no dedicated license, supported-platform, or supported-agent fields. The page deliberately does not show them; add columns and sections only if the product needs verified values.
5. The no-JS pre-render fallback does not yet convert GFM tables to `<table>`; they remain readable text until hydration. Search engines that execute JavaScript see the full table.
6. Source URL analysis (metadata fetch, repository stats) remains unimplemented because no backend analysis service exists; the form only normalizes/validates URLs.
7. Pre-existing RLS gap: non-admin insert/update policies require `status = 'pending'` and `owner_id = auth.uid()`, but they do not block a direct REST client from setting `featured`, `badge`, or `moderator_note`. The submission UI hides and omits those fields for non-admins, but a restrictive policy or trigger should enforce it before relying on featured/badge moderation. Not changed here because it needs a separate DB policy decision.
