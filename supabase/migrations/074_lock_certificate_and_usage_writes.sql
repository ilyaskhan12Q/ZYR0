-- Migration 074: close two self-service holes left open by 046 and 053.
--
-- certificates: a company owner/admin/hr could INSERT directly, minting an
-- Active, publicly verifiable certificate for any recipient and any company's
-- internship. Certificates are only issued by the issue-certificate edge
-- function (service role), so clients never need INSERT.
--
-- agent_usage: users could DELETE their own usage rows, which is the only
-- per-user AI rate-limit ledger — deleting them resets the throttle.

drop policy if exists "Certificates: company or admin insert" on public.certificates;
revoke insert on public.certificates from anon, authenticated;
grant insert on public.certificates to service_role;

drop policy if exists "agent_usage_owner_delete" on public.agent_usage;
revoke delete on public.agent_usage from anon, authenticated;
grant delete on public.agent_usage to service_role;
