-- Migration 073: code-keyed public offer verification.
--
-- 065 removes anonymous SELECT on offer_letters, but the public /verify page
-- still verified an offer by its id or offer code. Replace that table read with
-- one SECURITY DEFINER lookup that only returns the fields the offer document
-- renders — no notes, no student email, no other rows.

create or replace function public.verify_offer_public(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.offer_letters%rowtype;
begin
  if p_code is null or btrim(p_code) = '' then
    return null;
  end if;

  select * into v_offer
  from public.offer_letters o
  where o.id::text = btrim(p_code)
     or lower(o.offer_code) = lower(btrim(p_code))
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_offer.id,
    'offer_code', v_offer.offer_code,
    'status', v_offer.status,
    'issued_at', v_offer.issued_at,
    'expires_at', v_offer.expires_at,
    'accepted_at', v_offer.accepted_at,
    'rejected_at', v_offer.rejected_at,
    'student', (
      select jsonb_build_object('full_name', p.full_name)
      from public.profiles p where p.id = v_offer.student_id
    ),
    'company', (
      select jsonb_build_object('name', c.name, 'logo_url', c.logo_url, 'location', c.location)
      from public.companies c where c.id = v_offer.company_id
    ),
    'internship', (
      select jsonb_build_object(
        'title', i.title,
        'type', i.type,
        'location_type', i.location_type,
        'location', i.location,
        'duration', i.duration,
        'stipend', i.stipend,
        'stipend_type', i.stipend_type,
        'start_date', i.start_date,
        'responsibilities', i.responsibilities
      )
      from public.internships i where i.id = v_offer.internship_id
    )
  );
end;
$$;

revoke all on function public.verify_offer_public(text) from public;
grant execute on function public.verify_offer_public(text) to anon, authenticated;

-- shortcut: the offer code is a short numeric string, so the public endpoint can
-- be brute-forced. Add a rate limit (or longer code) if abuse is observed.
