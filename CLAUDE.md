## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.gemini/skills/gstack/bin || test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user to install gstack:
```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.gemini/skills/gstack
cd ~/.gemini/skills/gstack && ./setup --team
```

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/setup-gbrain`
- `/retro`
- `/investigate`
- `/document-release`
- `/document-generate`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`

---

## Permanent Project Architecture & Email Delivery Rules

1. **Email Delivery Architecture**:
   - **No PDF Attachments**: Do not attach heavy base64 PDFs directly to transactional email dispatches (`sendOfferLetterEmail`).
   - **Verified Platform Retrieval**: Transactional emails notify the candidate and direct them to retrieve official documents on-demand via the Student Dashboard (`/student/offer-letters`) or the Public Verification Portal (`/verify?type=offer&id=...`).
   - **Storage Persistence**: PDFs must continue to be generated and stored in Supabase Storage (`offer-letters` bucket) on creation for user portal downloads.

2. **Canonical HTTPS Domain Resolution**:
   - All email template link generation must use the hardcoded canonical origin `https://zyroo.org` (`const siteUrl = 'https://zyroo.org';`).
   - Never resolve `siteUrl` to dynamic `window.location.origin`, `localhost`, or `127.0.0.1` in transactional emails to avoid link redaction or security warnings in email clients.

3. **Versioning & Release Rules**:
   - Version jumps for consolidated releases bump `package.json` and `CHANGELOG.md` (e.g., `0.36.0`).

