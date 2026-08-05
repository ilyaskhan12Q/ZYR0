# Email DNS Records — zyroo.dpdns.org (stopgap)

Status: 2026-08-05. All records below verified live via `dig`. Resend domain
status: `verified`, sending enabled, region ap-northeast-1 (SES-backed).
Resend domain id: `19e3888e-9ef6-452d-ba3a-15e6db6c351e`.

## Current live state (verified 2026-08-05)

| Record type | Name | Value | Status |
|---|---|---|---|
| TXT (SPF) | `zyroo.dpdns.org` | `v=spf1 include:amazonses.com ~all` | present |
| TXT (SPF) | `send.zyroo.dpdns.org` | `v=spf1 include:amazonses.com ~all` | present |
| MX | `send.zyroo.dpdns.org` | `10 feedback-smtp.ap-northeast-1.amazonses.com` | present |
| TXT (DKIM) | `resend._domainkey.zyroo.dpdns.org` | `p=MIGf...` (Resend key) | present, verified |
| TXT (DMARC) | `_dmarc.zyroo.dpdns.org` | `v=DMARC1; p=none; adkim=s; aspf=s; rua=mailto:team@zyroo.dpdns.org` | present |
| MX | `zyroo.dpdns.org` (bare) | — | **MISSING** |
| TXT | `_vercel.zyroo.dpdns.org` | `vc-domain-verify=zyroo.dpdns.org,ed4820ee83329ba71ce0` | present (Vercel, unrelated) |

All three records Resend requires (DKIM, send. MX, send. SPF) are present and
verified. DKIM/SPF/DMARC all resolve. **Authentication is NOT the failure
point.**

## Why Gmail still bounces

Gmail rejection (2026-07-25): `550 5.7.1 ... likely unsolicited mail
...?p=UnsolicitedMessageError` — a **reputation** block, not an auth failure.
`zyroo.dpdns.org` is a free dynamic-DNS domain (dpdns.org); Gmail gives these
domains effectively zero sending reputation. The bare domain also has no MX,
which further signals "not a real mail domain" to reputation heuristics.

## Stopgap changes (apply at Cloudflare — NS is dara/edward.ns.cloudflare.com)

### 1. Add bare-domain MX (biggest cheap signal)
```
Type: MX
Name: zyroo.dpdns.org  (or @)
Priority: 10
Value: feedback-smtp.ap-northeast-1.amazonses.com
```
Caveat: this MX does not actually receive mail (it is SES's submission
endpoint); it only satisfies the "domain handles mail" heuristic. Harmless,
recommended by Amazon SES guides for custom-MAIL-FROM setups.

### 2. Harden DMARC (do AFTER a few successful deliveries)
```
Type: TXT
Name: _dmarc.zyroo.dpdns.org
Value: v=DMARC1; p=quarantine; adkim=s; aspf=s; rua=mailto:team@zyroo.dpdns.org
```
Keep `p=none` until delivery is confirmed working, then flip to `p=quarantine`
to demonstrate the domain is actively managed.

## Verify after applying

```bash
dig +short MX zyroo.dpdns.org
dig +short TXT zyroo.dpdns.org
dig +short TXT send.zyroo.dpdns.org
dig +short TXT resend._domainkey.zyroo.dpdns.org
dig +short TXT _dmarc.zyroo.dpdns.org
```

## Honest expectation

DNS records do **not** fix a reputation block. The stopgap plan that has any
chance of working:
1. Apply the bare-domain MX above.
2. Send at low volume (a few/week) from `team@zyroo.dpdns.org` for 2–4 weeks
   (warm-up) and watch the Resend bounce/status for each send.
3. Avoid links/attachments in early emails (pure text shortlist notice).
4. Re-test to ik7408008@gmail.com after step 1; if it still bounces with the
   same 550, DNS is not the lever — a real domain (e.g. zyr0.com) is required.

## Long-term fix (recommended)

Verify a real domain in Resend (e.g. `zyr0.com` or `mail.zyr0.com`) and switch
the `from` in `app/src/pages/admin/TeamApplications.tsx` /
`buildShortlistEmail` to that domain. Dynamic-DNS domains can stay blocked
regardless of records.
