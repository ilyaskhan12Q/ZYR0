-- Migration 066: company verification is admin-controlled.
--
-- The companies INSERT policy let a self-registered company set its own
-- `status = 'approved'` and `verified_at`, and the UPDATE policy let it flip
-- those fields later. That grants the verified badge (and everything gated on
-- is_company_verified) without review.

create or replace function public.protect_company_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.verified_at := null;
    new.verified_by := null;
    new.verification_notes := null;
    return new;
  end if;

  if new.status is distinct from old.status
     or new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.verification_notes is distinct from old.verification_notes
     or new.owner_id is distinct from old.owner_id then
    raise exception 'Company verification fields can only be changed by an admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_company_verification on public.companies;
create trigger trg_protect_company_verification
  before insert or update on public.companies
  for each row execute function public.protect_company_verification();
