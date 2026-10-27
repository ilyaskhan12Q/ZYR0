-- Migration 075: code-keyed public certificate verification.
--
-- 063 revokes anonymous SELECT on profiles, but the public /verify page joins
-- profiles twice (recipient + issuer) via the anon key. PostgREST rejects the
-- entire query with 42501 → HTTP 401.
--
-- Same pattern as 073 (verify_offer_public): one SECURITY DEFINER function
-- that returns only the fields the certificate document renders.

create or replace function public.verify_certificate_public(p_credential_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cert public.certificates%rowtype;
begin
  if p_credential_id is null or btrim(p_credential_id) = '' then
    return null;
  end if;

  select * into v_cert
  from public.certificates
  where credential_id = btrim(p_credential_id)
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_cert.id,
    'title', v_cert.title,
    'credential_id', v_cert.credential_id,
    'issue_date', v_cert.issue_date,
    'start_date', v_cert.start_date,
    'end_date', v_cert.end_date,
    'skills', v_cert.skills,
    'description', v_cert.description,
    'status', v_cert.status,
    'blockchain_hash', v_cert.blockchain_hash,
    'recipient', (
      select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url)
      from public.profiles p where p.id = v_cert.recipient_id
    ),
    'company', (
      select jsonb_build_object('id', c.id, 'name', c.name, 'logo_url', c.logo_url)
      from public.companies c where c.id = v_cert.company_id
    ),
    'internship', (
      select jsonb_build_object('id', i.id, 'title', i.title, 'start_date', i.start_date, 'end_date', i.end_date)
      from public.internships i where i.id = v_cert.internship_id
    ),
    'issuer', (
      select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'role', p.role, 'title', p.title, 'department', p.department)
      from public.profiles p where p.id = v_cert.issued_by
    )
  );
end;
$$;

revoke all on function public.verify_certificate_public(text) from public;
grant execute on function public.verify_certificate_public(text) to anon, authenticated;
