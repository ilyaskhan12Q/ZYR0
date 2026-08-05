-- Migration 034: Contact form submissions from the public Contact page.
-- Written by the send-email edge function (service role). Public users can
-- INSERT (the form is anonymous); reads are restricted to admins via policies.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  category text not null default 'general',
  message text not null,
  ip_hash text,               -- opaque marker, never the raw IP
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Public (anonymous + authenticated) can submit the form.
create policy "contact_messages_insert_anon"
  on public.contact_messages
  for insert
  to anon
  with check (true);

create policy "contact_messages_insert_auth"
  on public.contact_messages
  for insert
  to authenticated
  with check (true);

-- Only admins can read/update (codebase convention: public.is_admin()).
create policy "contact_messages_select_admin"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_admin());
