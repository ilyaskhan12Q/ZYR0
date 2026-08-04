-- 031_create_site_banners.sql
-- Site-wide announcement/notification bars (e.g. scheduled maintenance notices).
-- RLS: public reads active banners; admins manage all rows.

create table if not exists public.site_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Notice',
  message text not null,
  link_url text,
  link_label text,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_banners enable row level security;

create policy "Public can read active banners"
  on public.site_banners for select
  using (is_active = true);

create policy "Admins can manage banners"
  on public.site_banners for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger handle_site_banners_updated_at
  before update on public.site_banners
  for each row execute function public.handle_updated_at();

-- Seed the current maintenance notice (toggle off from the admin panel when done).
insert into public.site_banners (title, message, link_url, link_label, is_active)
values (
  'Scheduled Maintenance',
  'ZYR0 is undergoing scheduled maintenance. If you run into any issues while exploring, reach out — our team is here to help.',
  'https://chat.whatsapp.com/Hp2rnX1B61PDzVlbF89Tha',
  'Contact us',
  true
);
