-- Migration 076: company team access for task documents and path normalization
--
-- Migration 072 privatized task-documents but only allowed the direct uploader,
-- platform admin, or direct 1-to-1 task assigner/assignee to read files. This
-- prevented company owners, admins, and reviewers from viewing task briefs or
-- deliverables uploaded by other mentors in their own company.
--
-- This migration updates task-documents policies to:
-- 1. Allow members of the same company (owner, admin, mentor, reviewer, hr) to read task files.
-- 2. Support both 'task-documents/<uploaderId>/<file>' and '<uploaderId>/<file>' object paths.

drop policy if exists "task-documents: workflow read" on storage.objects;
drop policy if exists "task-documents: owner write" on storage.objects;

create policy "task-documents: workflow read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'task-documents'
    and (
      -- Caller is the uploader
      (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end) = auth.uid()::text
      or public.is_admin()
      -- Direct task assigner/assignee
      or exists (
        select 1 from public.tasks t
        where (t.assigned_by::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end) and t.assigned_to = auth.uid())
           or (t.assigned_to::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end) and t.assigned_by = auth.uid())
      )
      -- Uploader is a student who applied to caller's company
      or exists (
        select 1
        from public.applications a
        join public.internships i on i.id = a.internship_id
        join public.companies c on c.id = i.company_id
        where a.student_id::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end)
          and (
            c.owner_id = auth.uid()
            or public.is_company_member_with_role(i.company_id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
          )
      )
      -- Caller is a student who applied to uploader's company
      or exists (
        select 1
        from public.applications a
        join public.internships i on i.id = a.internship_id
        join public.companies c on c.id = i.company_id
        where a.student_id = auth.uid()
          and (
            c.owner_id::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end)
            or exists (
              select 1 from public.company_team_members m
              where m.company_id = c.id
                and m.user_id::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end)
                and m.status = 'accepted'
            )
          )
      )
      -- Both caller and uploader belong to the same company team
      or exists (
        select 1
        from public.companies c
        where (
          c.owner_id::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end)
          or exists (
            select 1 from public.company_team_members m
            where m.company_id = c.id
              and m.user_id::text = (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end)
              and m.status = 'accepted'
          )
        )
        and (
          c.owner_id = auth.uid()
          or public.is_company_member_with_role(c.id, auth.uid(), array['admin', 'hr', 'mentor', 'reviewer'])
        )
      )
    )
  );

create policy "task-documents: owner write"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'task-documents'
    and (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end) = auth.uid()::text
  )
  with check (
    bucket_id = 'task-documents'
    and (case when split_part(name, '/', 1) = 'task-documents' then split_part(name, '/', 2) else split_part(name, '/', 1) end) = auth.uid()::text
  );
