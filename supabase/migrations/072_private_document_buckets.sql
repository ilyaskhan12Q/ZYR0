-- Migration 072: student documents are private and writable only by their owner.
--
-- offer-letters and task-documents were public buckets, so every object was
-- served without RLS, and their write policies only checked bucket_id +
-- "authenticated": any account could overwrite or delete any tenant's file.
--
-- Reads now go through signed URLs (see app/src/lib/storage.ts) and are limited
-- to the student, the company in the workflow, or an admin. Writes are limited
-- to the uploader's own folder (task-documents) or the company that owns the
-- offer (offer-letters). company-assets stays public because logos are shown on
-- public pages; its writes are scoped to the owning company.

update storage.buckets set public = false where id in ('offer-letters', 'task-documents');

drop policy if exists "offer-letters: public read" on storage.objects;
drop policy if exists "offer-letters: authenticated upload" on storage.objects;
drop policy if exists "offer-letters: authenticated update" on storage.objects;
drop policy if exists "offer-letters: authenticated delete" on storage.objects;
drop policy if exists "task-documents: public read" on storage.objects;
drop policy if exists "task-documents: authenticated upload" on storage.objects;
drop policy if exists "task-documents: authenticated update" on storage.objects;
drop policy if exists "task-documents: authenticated delete" on storage.objects;
drop policy if exists "company-assets: authenticated upload" on storage.objects;
drop policy if exists "company-assets: authenticated update" on storage.objects;
drop policy if exists "company-assets: authenticated delete" on storage.objects;

-- Object name is '<studentId>/offer-letter-<offerId>.pdf'.
create policy "offer-letters: parties read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'offer-letters'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
        from public.offer_letters o
        join public.companies c on c.id = o.company_id
        where o.student_id::text = split_part(name, '/', 1)
          and o.id::text = regexp_replace(split_part(name, '/', 2), '^offer-letter-|\.pdf$', '', 'g')
          and (
            c.owner_id = auth.uid()
            or public.is_company_member_with_role(o.company_id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
          )
      )
    )
  );

create policy "offer-letters: company write"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'offer-letters'
    and exists (
      select 1
      from public.offer_letters o
      join public.companies c on c.id = o.company_id
      where o.student_id::text = split_part(name, '/', 1)
        and o.id::text = regexp_replace(split_part(name, '/', 2), '^offer-letter-|\.pdf$', '', 'g')
        and (
          c.owner_id = auth.uid()
          or public.is_company_member_with_role(o.company_id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
        )
    )
  )
  with check (
    bucket_id = 'offer-letters'
    and exists (
      select 1
      from public.offer_letters o
      join public.companies c on c.id = o.company_id
      where o.student_id::text = split_part(name, '/', 1)
        and o.id::text = regexp_replace(split_part(name, '/', 2), '^offer-letter-|\.pdf$', '', 'g')
        and (
          c.owner_id = auth.uid()
          or public.is_company_member_with_role(o.company_id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
        )
    )
  );

-- Object name is 'task-documents/<uploaderId>/<file>'.
create policy "task-documents: workflow read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'task-documents'
    and (
      split_part(name, '/', 2) = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1 from public.tasks t
        where (t.assigned_by::text = split_part(name, '/', 2) and t.assigned_to = auth.uid())
           or (t.assigned_to::text = split_part(name, '/', 2) and t.assigned_by = auth.uid())
      )
      -- uploader applied to the caller's company
      or exists (
        select 1
        from public.applications a
        join public.internships i on i.id = a.internship_id
        join public.companies c on c.id = i.company_id
        where a.student_id::text = split_part(name, '/', 2)
          and (
            c.owner_id = auth.uid()
            or public.is_company_member_with_role(i.company_id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
          )
      )
      -- caller applied to the uploader's company
      or exists (
        select 1
        from public.applications a
        join public.internships i on i.id = a.internship_id
        join public.companies c on c.id = i.company_id
        where a.student_id = auth.uid()
          and (
            c.owner_id::text = split_part(name, '/', 2)
            or exists (
              select 1 from public.company_team_members m
              where m.company_id = c.id
                and m.user_id::text = split_part(name, '/', 2)
                and m.status = 'accepted'
            )
          )
      )
    )
  );

create policy "task-documents: owner write"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'task-documents'
    and split_part(name, '/', 2) = auth.uid()::text
  )
  with check (
    bucket_id = 'task-documents'
    and split_part(name, '/', 2) = auth.uid()::text
  );

-- company-assets: public read stays; writes scoped to the owning company or admin.
create policy "company-assets: owner write"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'company-assets'
    and (
      public.is_admin()
      or exists (
        select 1 from public.companies c
        where c.id::text = substring(
          split_part(name, '/', 2)
          from '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        )
        and (
          c.owner_id = auth.uid()
          or public.is_company_member_with_role(c.id, auth.uid(), array['admin'])
        )
      )
    )
  )
  with check (
    bucket_id = 'company-assets'
    and (
      public.is_admin()
      or exists (
        select 1 from public.companies c
        where c.id::text = substring(
          split_part(name, '/', 2)
          from '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        )
        and (
          c.owner_id = auth.uid()
          or public.is_company_member_with_role(c.id, auth.uid(), array['admin'])
        )
      )
    )
  );
