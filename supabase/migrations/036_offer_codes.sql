-- Migration 036: Human-readable offer codes for offer letters.
-- Mirrors the certificate credential_id pattern (ZYRO-<code>-<year>-<random6>)
-- so the ID shown on documents/emails is exactly what /verify accepts.

alter table public.offer_letters add column if not exists offer_code text;

-- ── Backfill existing offers ──────────────────────────────────────────────────
do $$
declare
  rec record;
  code text;
  year text;
  rand int;
  tries int;
  done boolean;
begin
  for rec in select id, coalesce(issued_at, created_at) as ts
             from public.offer_letters
             where offer_code is null
  loop
    year := to_char(rec.ts, 'YYYY');
    done := false;
    tries := 0;
    while not done and tries < 20 loop
      tries := tries + 1;
      rand := floor(100000 + random() * 900000)::int;
      code := 'ZYRO-OF-' || year || '-' || lpad(rand::text, 6, '0');
      begin
        update public.offer_letters
           set offer_code = code
         where id = rec.id
           and offer_code is null;
        if found then
          done := true;
        end if;
      exception when unique_violation then
        null;
      end;
    end loop;
  end loop;
end $$;

-- ── Enforce + index ───────────────────────────────────────────────────────────
alter table public.offer_letters alter column offer_code set not null;

create unique index if not exists idx_offer_letters_offer_code
  on public.offer_letters (offer_code);
