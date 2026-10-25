-- Migration 068: stop forged notifications and audit entries.
--
-- notifications accepted any INSERT (WITH CHECK true), so any signed-in user
-- could plant an in-app message for any other user: arbitrary title, body and
-- action_url, rendered inside the real app UI. activity_logs had the same
-- problem, and those rows are what the admin reports and log viewer read.
--
-- Notifications stay insertable from the client, but only between users who
-- already share a workflow: a conversation, an application to the other side's
-- company, or a task assignment. Edge functions keep using the service role.

create or replace function public.can_notify(p_target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = p_target
    or public.is_admin()
    -- share a conversation
    or exists (
      select 1
      from public.conversation_participants mine
      join public.conversation_participants theirs
        on theirs.conversation_id = mine.conversation_id
      where mine.user_id = auth.uid() and theirs.user_id = p_target
    )
    -- target applied to an internship of my company
    or exists (
      select 1
      from public.applications a
      join public.internships i on i.id = a.internship_id
      join public.companies c on c.id = i.company_id
      where a.student_id = p_target
        and (
          c.owner_id = auth.uid()
          or exists (
            select 1 from public.company_team_members m
            where m.company_id = c.id and m.user_id = auth.uid() and m.status = 'accepted'
          )
        )
    )
    -- I applied to an internship of the target's company
    or exists (
      select 1
      from public.applications a
      join public.internships i on i.id = a.internship_id
      join public.companies c on c.id = i.company_id
      where a.student_id = auth.uid()
        and (
          c.owner_id = p_target
          or exists (
            select 1 from public.company_team_members m
            where m.company_id = c.id and m.user_id = p_target and m.status = 'accepted'
          )
        )
    )
    -- task assignment between us
    or exists (
      select 1 from public.tasks t
      where (t.assigned_by = auth.uid() and t.assigned_to = p_target)
         or (t.assigned_to = auth.uid() and t.assigned_by = p_target)
    );
$$;

drop policy if exists "Notifications: system insert" on public.notifications;
create policy "Notifications: related insert"
  on public.notifications for insert to authenticated
  with check (public.can_notify(user_id));

drop policy if exists "Activity logs: insert by service" on public.activity_logs;
drop policy if exists "Activity logs: insert authenticated" on public.activity_logs;

revoke insert on public.notifications from anon, authenticated;
grant insert on public.notifications to authenticated;
revoke insert on public.activity_logs from anon, authenticated;
