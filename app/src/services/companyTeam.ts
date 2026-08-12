import { supabase } from '@/lib/supabase';
import type { CompanyTeamMember, CompanyTeamRole } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';

export const COMPANY_TEAM_ROLES: { value: CompanyTeamRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR Manager' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'reviewer', label: 'Reviewer' },
];

export function teamRoleLabel(role: string): string {
  return COMPANY_TEAM_ROLES.find((r) => r.value === role)?.label ?? role;
}

/** Canonical company portal tab keys (path segment after /company/). */
export const COMPANY_TAB_KEYS = [
  'dashboard',
  'profile',
  'internships',
  'applications',
  'interns',
  'tasks',
  'messages',
  'analytics',
  'certificates',
  'offer-letters',
  'team',
  'settings',
] as const;
export type CompanyTabKey = (typeof COMPANY_TAB_KEYS)[number];

const ALL_TABS: CompanyTabKey[] = [...COMPANY_TAB_KEYS];

/** Tab access per team role. Owned companies can access everything. */
export const COMPANY_ROLE_PERMISSIONS: Record<CompanyTeamRole, CompanyTabKey[]> = {
  admin: ALL_TABS.filter((t) => t !== 'settings'),
  hr: ['dashboard', 'profile', 'internships', 'applications', 'interns', 'messages', 'certificates', 'offer-letters'],
  mentor: ['dashboard', 'profile', 'interns', 'tasks', 'messages'],
  reviewer: ['dashboard', 'profile', 'applications', 'interns', 'tasks'],
};

export function canAccessCompanyTab(role: CompanyTeamRole | null, isOwner: boolean, tab: CompanyTabKey): boolean {
  if (isOwner) return true;
  if (!role) return false;
  return (COMPANY_ROLE_PERMISSIONS[role] ?? []).includes(tab);
}

const SITE_URL = 'https://zyroo.org';

async function sendInviteEmail(member: CompanyTeamMember, companyName: string) {
  const token = member.invite_token;
  if (!token || !member.email) return;

  const acceptUrl = `${SITE_URL}/accept-invite?token=${encodeURIComponent(token)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${companyName} on ZYR0</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background-color: #1e3a8a; border-bottom: 3px solid #b89c56;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #ffffff;">ZYR0</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #f1c40f;">Team Invitation</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: #334155;">
                Hi ${member.name},
              </p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #334155;">
                You've been invited to join <strong>${companyName}</strong> on ZYR0 as a
                <strong>${teamRoleLabel(member.role)}</strong>. Accept the invitation to access your
                company dashboard and start managing your team's internship program.
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px; text-align: center;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1e3a8a; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);">
                    <a href="${acceptUrl}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #b89c56;">Accept Invitation</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #64748b;">
                Already have a ZYR0 account? Simply sign in and the invitation will be applied automatically.
                New here? Create a free account with this email address and you'll be added as a team member right away.
              </p>
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                This invitation link is unique to you. If you weren't expecting this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8;">Sent automatically from the ZYR0 platform.</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${member.name},`,
    '',
    `You've been invited to join ${companyName} on ZYR0 as a ${teamRoleLabel(member.role)}.`,
    'Accept the invitation to access your company dashboard:',
    '',
    acceptUrl,
    '',
    'Already have a ZYR0 account? Sign in and the invitation will be applied automatically.',
    'New here? Create a free account with this email and you will be added as a team member.',
    '',
    '— The ZYR0 Team',
  ].join('\n');

  const { data: resData, error: invokeErr } = await supabase.functions.invoke('send-email', {
    body: {
      to: member.email,
      from: 'ZYR0 Team <team@zyroo.org>',
      replyTo: 'team@zyroo.org',
      subject: `You're invited to join ${companyName} on ZYR0`,
      html,
      text,
    },
  });
  if (invokeErr) throw invokeErr;
  if (resData?.error) throw new Error(resData.error);
}

export async function getCompanyTeam(companyId: string) {
  const cacheKey = `company_team_${companyId}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  const fetchFn = () => supabase
    .from('company_team_members')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Add a member (pending invite). Sends the invite email once the row exists. */
export async function addTeamMember(data: {
  company_id: string;
  name: string;
  role: CompanyTeamRole;
  email?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const existing = await supabase
    .from('company_team_members')
    .select('id, email, user_id, status')
    .eq('company_id', data.company_id)
    .eq('email', data.email?.trim().toLowerCase() ?? '');

  if (existing.data && existing.data.length > 0) {
    throw new Error('A member with this email is already on the team.');
  }

  const res = await supabase
    .from('company_team_members')
    .insert({
      company_id: data.company_id,
      name: data.name.trim(),
      role: data.role,
      email: data.email?.trim().toLowerCase() || null,
      status: 'invited',
      invite_token: crypto.randomUUID(),
      invited_by: user.id,
      invited_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (res.error) throw res.error;

  clearCache(`company_team_${data.company_id}`);
  clearCache(createRequestKey('my_company', user.id));

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', data.company_id)
    .single();

  try {
    await sendInviteEmail(res.data, company?.name ?? 'your company');
  } catch (err) {
    console.error('Failed to send team invite email:', err);
    throw new Error('Member added, but the invite email could not be sent. Use "Resend Invite".');
  }

  return { data: res.data, error: null };
}

export async function updateTeamMember(id: string, data: { role?: CompanyTeamRole; name?: string }) {
  const res = await supabase
    .from('company_team_members')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (!res.error && res.data) {
    clearCache(`company_team_${res.data.company_id}`);
    clearCache(createRequestKey('my_company', res.data.user_id ?? ''));
  }
  return res;
}

export async function resendTeamInvite(id: string) {
  const { data: member } = await supabase
    .from('company_team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (!member) return { data: null, error: new Error('Member not found') };
  if (member.status === 'accepted') {
    return { data: null, error: new Error('This member has already accepted the invitation.') };
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', member.company_id)
    .single();

  await sendInviteEmail(member, company?.name ?? 'your company');
  return { data: member, error: null };
}

export async function removeTeamMember(id: string) {
  const { data: member } = await supabase
    .from('company_team_members')
    .select('company_id, user_id')
    .eq('id', id)
    .single();

  const res = await supabase.from('company_team_members').delete().eq('id', id);

  if (member?.company_id && !res.error) {
    clearCache(`company_team_${member.company_id}`);
    if (member.user_id) clearCache(createRequestKey('my_company', member.user_id));
  }
  return res;
}

/** Accept a pending invite for the currently authenticated user. */
export async function acceptTeamInvite(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.rpc('accept_company_invite', { p_token: token });
  if (error) throw error;
  if (data === true && user) {
    clearCache(createRequestKey('my_company', user.id));
  }
  return data === true;
}

/**
 * Resolve the current user's company + team role.
 * Owner (profile role "company") resolves through companies.owner_id;
 * everyone else resolves through their accepted company_team_members row.
 */
export async function getMyCompanyMembership(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { company: null, member: null, data: null, error: new Error('Not authenticated') };

  const cacheKey = createRequestKey('my_company', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) {
      // If cached entry comes from old getMyCompany ({ data: company, error }), migrate it to membership shape
      if (cached.data && !('company' in cached)) {
        const comp = cached.data;
        return {
          company: comp,
          member: null,
          data: { company: comp, member: null },
          error: cached.error ?? null,
        };
      }
      // If cached is new shape, ensure data alias is attached for compatibility with destructuring { data }
      if ('company' in cached) {
        return {
          ...cached,
          data: cached.data ?? { company: cached.company, member: cached.member ?? null },
        };
      }
      return cached;
    }
  }

  const fetchFn = async () => {
    const { data: ownerCompany } = await supabase
      .from('companies')
      .select('*, team:company_team_members(*), owner:profiles!owner_id (id, full_name, title, department)')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (ownerCompany) {
      const payload = { company: ownerCompany, member: null };
      return { ...payload, data: payload, error: null };
    }

    const { data: member, error } = await supabase
      .from('company_team_members')
      .select('*, company:companies(*, team:company_team_members(*), owner:profiles!owner_id (id, full_name, title, department))')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (error) {
      const payload = { company: null, member: null };
      return { ...payload, data: payload, error };
    }
    if (!member) {
      const payload = { company: null, member: null };
      return { ...payload, data: payload, error: null };
    }

    const comp = (member.company as unknown as import('@/lib/database.types').Company) ?? null;
    const payload = { company: comp, member };
    return { ...payload, data: payload, error: null };
  };

  const result = await dedupRequest(cacheKey, fetchFn);

  if (!result.error) setCachedData(cacheKey, result);
  return result;
}