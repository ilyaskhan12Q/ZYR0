-- Profiles were world-readable to anonymous visitors: `?select=email,phone,resume_url`
-- with only the public browser key returned all 237 rows. No anonymous page reads
-- profiles (verified: app/src/pages/public has no profile query), and the only
-- anon-executable function, expire_stale_offers(), is SECURITY DEFINER and does not
-- touch this table.
drop policy if exists "Profiles: public read" on public.profiles;

create policy "Profiles: authenticated read"
  on public.profiles for select to authenticated
  using (true);

revoke select on public.profiles from anon;

-- shortcut: blocks anonymous scraping only; any free self-signup can still read
-- every row. Upgrade to a profile_private companion table holding the sensitive
-- columns (email, phone, resume_url, linkedin, github, status_reason).
