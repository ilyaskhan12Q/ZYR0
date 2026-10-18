-- All four student-document buckets were created public = true, so every file was
-- readable by anyone holding its URL with no login at all. `resumes` also had a
-- world-readable SELECT policy, and team-resumes additionally allowed anonymous
-- upload/update/delete.
--
-- This migration privatises the two buckets holding student resumes and scopes
-- reads. offer-letters and task-documents stay public on purpose: the public
-- /verify page reads offer_letters through its own `public read` table policy, so
-- that policy has to be replaced with a code-keyed lookup first. Tracked separately.

-- resumes: the owner, a platform admin, or a company the student applied to.
-- The subquery never references `name`, so the object path is read from the
-- policy's own row rather than shadowed by companies.name.
drop policy if exists "resumes: public read" on storage.objects;

create policy "resumes: owner, admin or applicant company read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (
      split_part(name, '/', 2) = auth.uid()::text
      or public.is_admin()
      or split_part(name, '/', 2) in (
        select a.student_id::text
        from public.applications a
        join public.internships i on i.id = a.internship_id
        join public.companies c on c.id = i.company_id
        where public.is_company_verified(i.company_id)
          and (
            c.owner_id = auth.uid()
            or public.is_company_member_with_role(
                 i.company_id, auth.uid(), array['admin', 'hr', 'reviewer', 'mentor']
               )
          )
      )
    )
  );

-- team-resumes: hiring inbox, admins only. Anonymous write policies removed.
drop policy if exists "team-resumes: public read" on storage.objects;
drop policy if exists "team-resumes: anon upload" on storage.objects;
drop policy if exists "team-resumes: anon update" on storage.objects;
drop policy if exists "team-resumes: anon delete" on storage.objects;

create policy "team-resumes: admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'team-resumes' and public.is_admin());

create policy "team-resumes: authenticated upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'team-resumes');

-- shortcut: any signed-in user may upload here; the object path carries no owner,
-- so a per-applicant upload rule needs the path convention changed first.

update storage.buckets set public = false where id in ('resumes', 'team-resumes');
