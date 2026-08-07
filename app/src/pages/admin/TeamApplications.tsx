import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Check, Download, Eye, FileText, Inbox, Loader2,
  Mail, Search, Trash2, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { TEAM_ROLES } from '@/components/team/team-data';
import {
  TEAM_APPLICATION_STATUSES,
  deleteTeamApplication,
  getTeamApplications,
  markTeamApplicationEmailed,
  updateTeamApplicationStatus,
} from '@/services/teamApplications';
import type { TeamApplicationStatus } from '@/lib/database.types';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const tabs = ['All', ...TEAM_APPLICATION_STATUSES];

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Contacted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
};

function roleTitle(roleId: string | null | undefined) {
  if (!roleId) return '—';
  return TEAM_ROLES.find((r) => r.id === roleId)?.title ?? roleId;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ── Email templates ─────────────────────────────────────────────────────── */

function buildShortlistEmail(app: any) {
  // full_name and preferred_role come from the applicant (public form input),
  // so they are escaped before interpolation into the HTML template.
  const fullName = escapeHtml(app.full_name);
  const role = escapeHtml(roleTitle(app.preferred_role));
  const plainRole = roleTitle(app.preferred_role);
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://zyroo.org';
  const whatsAppCommunityUrl = 'https://chat.whatsapp.com/EfivEcFI4cJ8pWnbW9OmWh';
  const whatsAppChannelUrl = 'https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F';
  const linkedInUrl = 'https://www.linkedin.com/company/zyr0-co/';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations — You've Been Shortlisted</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background-color: #1e3a8a; border-bottom: 3px solid #b89c56;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #ffffff;">ZYR0</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #f1c40f;">Candidate Selection</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #0f172a;">Dear <strong>${fullName}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #334155;">
                We have wonderful news! After a thorough review of all candidate applications for the ZYR0 Founding Development Team, we were immensely impressed by your background and passion. We are thrilled to confirm that you have been <strong>shortlisted</strong> for the <strong style="color: #1e3a8a;">${role}</strong> role!
              </p>
              
              <!-- Role Highlight Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Shortlisted Position</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #0f172a;">${role}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #334155;">
                Our team is currently coordinating schedules to host a friendly introductory conversation with you. This will be a great opportunity to explore how your talents align with our ambitious roadmap and answer any questions you have about ZYR0.
              </p>

              <!-- Main Primary CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto; text-align: center;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                    <a href="${whatsAppCommunityUrl}" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #b89c56;">💬 Connect on WhatsApp Community</a>
                  </td>
                </tr>
              </table>

              <!-- Quick Action Grid -->
              <div style="border-top: 1px solid #e2e8f0; margin: 28px 0 24px; padding-top: 24px;">
                <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; text-align: center;">Next Steps & Resources</p>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 4px;">
                      <a href="${siteUrl}/careers" style="display: inline-block; width: 85%; padding: 11px 14px; background-color: #1e3a8a; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; text-align: center;">🚀 Explore Careers</a>
                    </td>
                    <td align="center" style="padding: 4px;">
                      <a href="${siteUrl}/internships" style="display: inline-block; width: 85%; padding: 11px 14px; background-color: #0284c7; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; text-align: center;">💼 Active Programs</a>
                    </td>
                    <td align="center" style="padding: 4px;">
                      <a href="${siteUrl}/contact" style="display: inline-block; width: 85%; padding: 11px 14px; background-color: #475569; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; text-align: center;">🤝 Contact Support</a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 28px 0 0; font-size: 15px; line-height: 1.8; color: #0f172a;">
                Congratulations once again on taking this step. We are excited to speak with you soon!<br><br>
                Warmest regards,<br>
                <strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #1e3a8a;">The ZYR0 Founding Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Stay Connected</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #475569;">
                <a href="${linkedInUrl}" style="color: #1e3a8a; text-decoration: none; font-weight: 600;">LinkedIn</a>
                <span style="color: #cbd5e1; padding: 0 8px;">·</span>
                <a href="${whatsAppCommunityUrl}" style="color: #1e3a8a; text-decoration: none; font-weight: 600;">WhatsApp Community</a>
                <span style="color: #cbd5e1; padding: 0 8px;">·</span>
                <a href="${whatsAppChannelUrl}" style="color: #1e3a8a; text-decoration: none; font-weight: 600;">WhatsApp Channel</a>
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8;">© 2026 ZYR0. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;"><a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = [
    `Dear ${app.full_name},`,
    '',
    `We have wonderful news! After a thorough review of all candidate applications for the ZYR0 Founding Development Team, we are thrilled to confirm that you have been shortlisted for the ${plainRole} position!`,
    '',
    `A member of our team will reach out in the coming days to schedule a introductory conversation with you.`,
    '',
    `Quick Actions & Resources:`,
    `- Join WhatsApp Community: ${whatsAppCommunityUrl}`,
    `- Explore ZYR0 Careers: ${siteUrl}/careers`,
    `- Browse Active Internships: ${siteUrl}/internships`,
    `- Support: ${siteUrl}/contact`,
    '',
    `Stay Connected:`,
    `- LinkedIn: ${linkedInUrl}`,
    `- WhatsApp Channel: ${whatsAppChannelUrl}`,
    '',
    'Warmest regards,',
    'The ZYR0 Founding Team',
  ].join('\n');
  return { to: app.email, subject: `Congratulations! You've been shortlisted — ZYR0 Founding Team`, html, text };
}

async function sendCandidateEmail(app: any) {
  const { to, subject, html, text } = buildShortlistEmail(app);
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html, text, from: 'ZYR0 Team <team@zyroo.org>', replyTo: 'team@zyroo.org' },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function AdminTeamApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getTeamApplications(activeTab as any);
      if (error) throw error;
      setApplications(data);
    } catch (err) {
      console.error('Error loading team applications:', err);
      setMessage({ type: 'err', text: 'Failed to load applications.' });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) =>
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.university?.toLowerCase().includes(q) ||
      roleTitle(a.preferred_role).toLowerCase().includes(q) ||
      (a.skills || []).some((s: string) => s.toLowerCase().includes(q))
    );
  }, [applications, search]);

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allChecked = filtered.length > 0 && filtered.every((a) => prev.has(a.id));
      if (allChecked) filtered.forEach((a) => next.delete(a.id));
      else filtered.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const changeStatus = async (id: string, status: TeamApplicationStatus) => {
    setBusy(`status-${id}`);
    try {
      const { error } = await updateTeamApplicationStatus(id, status);
      if (error) throw error;
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to update status.' });
    } finally {
      setBusy(null);
    }
  };

  const handleBulkEmail = async () => {
    const targets = filtered.filter((a) => selected.has(a.id));
    if (targets.length === 0) return;
    setBusy('email');
    setMessage(null);
    let ok = 0;
    let failed = 0;
    const sentIds: { name: string; id: string }[] = [];
    const CONCURRENCY = 3;
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      const chunk = targets.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(async (app) => {
        try {
          const res = await sendCandidateEmail(app);
          await markTeamApplicationEmailed(app.id, res?.id);
          await updateTeamApplicationStatus(app.id, 'Shortlisted');
          if (res?.id) sentIds.push({ name: app.full_name, id: res.id });
          ok += 1;
        } catch (err) {
          console.error('Email failed for', app.email, err);
          failed += 1;
        }
      }));
      setMessage({ type: 'ok', text: `Sending shortlist emails… ${ok + failed} of ${targets.length} done.` });
    }
    setMessage({
      type: failed === 0 ? 'ok' : 'err',
      text: failed === 0
        ? `Shortlist email accepted for delivery to ${ok} candidate${ok === 1 ? '' : 's'} (delivery is async — verify in the recipient's inbox or Resend if it doesn't arrive).`
        : `Emailed ${ok}, failed ${failed}. ${sentIds.length ? 'Sent IDs: ' + sentIds.map(s => `${s.name}=${s.id}`).join(', ') + '. ' : ''}Check the edge function logs for failure reasons.`,
    });
    setSelected(new Set());
    setBusy(null);
    loadApplications();
  };

  const exportCsv = () => {
    const rows = filtered.map((a) => ({
      'Full Name': a.full_name ?? '',
      Email: a.email ?? '',
      Phone: a.phone ?? '',
      Gender: a.gender ?? '',
      University: a.university ?? '',
      'Degree Program': a.degree_program ?? '',
      'Academic Year': a.academic_year ?? '',
      'Preferred Role': roleTitle(a.preferred_role),
      'Secondary Role': roleTitle(a.secondary_role),
      Skills: (a.skills || []).join('; '),
      GitHub: a.github ?? '',
      LinkedIn: a.linkedin ?? '',
      Portfolio: a.portfolio ?? '',
      Availability: a.availability ?? '',
      Projects: a.projects ?? '',
      Motivation: a.motivation ?? '',
      Status: a.status ?? '',
      'Email Sent': a.email_sent ? 'Yes' : 'No',
      'Email Message ID': a.email_message_id ?? '',
      'Applied On': a.created_at ? formatDate(a.created_at) : '',
      'Resume URL': a.resume_url ?? '',
    }));
    const headers = Object.keys(rows[0] ?? {});
    const escape = (v: string) => `"${String(v).replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`;
    const csv = '\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy('delete');
    try {
      const { error } = await deleteTeamApplication(deleteTarget.id);
      if (error) throw error;
      setMessage({ type: 'ok', text: 'Application deleted.' });
      setDeleteTarget(null);
      loadApplications();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to delete application.' });
    } finally {
      setBusy(null);
    }
  };

  const allChecked = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const selectedCount = filtered.filter((a) => selected.has(a.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Founding development team recruitment — review, shortlist, email and export.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setConfirmEmail(true)} disabled={selectedCount === 0 || busy === 'email'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {busy === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Email Selected ({selectedCount})
          </button>
        </div>
      </div>

      {message && (
        <div role="status"
          className={cn(
            'p-4 rounded-lg border text-sm flex items-center gap-2',
            message.type === 'ok'
              ? 'border-emerald-300 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
              : 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
          )}>
          {message.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, university, role or skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelected(new Set()); }}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}>{tab}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll}
                      aria-label="Select all" className="accent-blue-600 w-4 h-4" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Applicant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Preferred Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No team applications found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleSelected(app.id)}
                          aria-label={`Select ${app.full_name}`} className="accent-blue-600 w-4 h-4" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.full_name || 'A')}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-medium">{app.full_name}</p>
                            <p className="text-xs text-muted-foreground">{app.email} · {app.university || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{roleTitle(app.preferred_role)}</p>
                        {app.secondary_role && (
                          <p className="text-xs text-muted-foreground">also: {roleTitle(app.secondary_role)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {(app.skills || []).slice(0, 3).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground">{s}</span>
                          ))}
                          {(app.skills || []).length > 3 && (
                            <span className="text-[11px] text-muted-foreground">+{(app.skills || []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', statusColors[app.status] || 'bg-muted')}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(app.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setDetail(app)} title="View application"
                            className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors" aria-label="View application">
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={app.status}
                            onChange={(e) => changeStatus(app.id, e.target.value as TeamApplicationStatus)}
                            disabled={busy === `status-${app.id}`}
                            aria-label={`Change status for ${app.full_name}`}
                            className="text-xs px-2 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50">
                            {TEAM_APPLICATION_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button onClick={() => setDeleteTarget(app)} title="Delete application"
                            className="p-2 rounded-lg border border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" aria-label="Delete application">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.full_name}</DialogTitle>
            <DialogDescription>
              {detail?.email} · Applied {detail ? formatDate(detail.created_at) : ''}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', statusColors[detail.status] || 'bg-muted')}>{detail.status}</span>
                {detail.email_sent && (
                  <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                    Emailed {detail.email_sent_at ? formatDate(detail.email_sent_at) : ''}
                  </span>
                )}
                {detail.email_message_id && (
                  <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-muted text-muted-foreground" title="Resend message ID (look up delivery in the Resend dashboard)">
                    Resend ID: {detail.email_message_id.slice(0, 8)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Phone" value={detail.phone} />
                <DetailItem label="Gender" value={detail.gender} />
                <DetailItem label="University" value={detail.university} />
                <DetailItem label="Degree Program" value={detail.degree_program} />
                <DetailItem label="Academic Year" value={detail.academic_year} />
                <DetailItem label="Availability" value={detail.availability} />
                <DetailItem label="Preferred Role" value={roleTitle(detail.preferred_role)} />
                <DetailItem label="Secondary Role" value={roleTitle(detail.secondary_role)} />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Links</p>
                <div className="flex flex-wrap gap-2">
                  {[['GitHub', detail.github], ['LinkedIn', detail.linkedin], ['Portfolio', detail.portfolio]].map(([label, url]) => (
                    url ? (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> {label}
                      </a>
                    ) : null
                  ))}
                  {detail.resume_url ? (
                    <a href={detail.resume_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Resume ({detail.resume_filename ?? 'download'})
                    </a>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground">No resume attached</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(detail.skills || []).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 text-xs rounded-md bg-muted text-foreground">{s}</span>
                  ))}
                </div>
              </div>

              {detail.projects && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Projects & Experience</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{detail.projects}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Why this role</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{detail.motivation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk email confirmation */}
      <AlertDialog open={confirmEmail} onOpenChange={setConfirmEmail}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send shortlist emails to {selectedCount} selected candidate{selectedCount === 1 ? '' : 's'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const targets = filtered.filter((a) => selected.has(a.id)).slice(0, 3);
                return targets.length > 0 ? (
                  <>
                    <span className="font-medium text-foreground">{targets.map((t) => t.full_name).join(', ')}{selectedCount > targets.length ? '…' : ''}</span>
                    <br />
                  </>
                ) : null;
              })()}
              Each candidate will receive the shortlist email and their application status will be set to
              &ldquo;Shortlisted&rdquo;. This cannot be undone by this panel — re-run the email flow to resend.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === 'email'}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmEmail(false); handleBulkEmail(); }} disabled={busy === 'email'}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {busy === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Shortlist Emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.full_name}&apos;s application ({deleteTarget?.email}) will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === 'delete'}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={busy === 'delete'}
              className="bg-red-600 hover:bg-red-700 text-white">
              {busy === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}
