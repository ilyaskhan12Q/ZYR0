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

/* ── Email templates ─────────────────────────────────────────────────────── */

function buildShortlistEmail(app: any) {
  const role = roleTitle(app.preferred_role);
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://zyroo.org';
  const teamGroupUrl = import.meta.env.VITE_WHATSAPP_TEAM_GROUP_URL || 'https://chat.whatsapp.com/DeVmUUkldtqLR0ho5x95MX';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations — You've Been Shortlisted</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1ece0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1ece0;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fffdf5; border: 1px solid #b89c56; box-shadow: 0 10px 30px rgba(25, 21, 18, 0.08);">
          <tr>
            <td style="padding: 36px 40px 22px; text-align: center; border-bottom: 1px solid #e8dcc0;">
              <p style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 5px; color: #1e3a8a;">ZYR0</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #b89c56;">A Note of Congratulations</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #13100d;">Dear ${app.full_name},</p>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.8; color: #3d372e;">
                Thank you for applying to join the ZYR0 Founding Development Team. After a careful
                review of all applications, we are pleased to confirm that you have advanced to the
                shortlist stage for the <strong style="color: #1e3a8a;">${role}</strong> team seat.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0; border: 1px solid #b89c56; background-color: #faf6ea;">
                <tr>
                  <td style="padding: 18px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Shortlisted For</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 700; color: #13100d;">${role}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.8; color: #3d372e;">
                A member of our team will reach out in the coming days to schedule a conversation —
                an opportunity to get to know you better and for you to learn more about the role.
                Please keep an eye on your inbox.
              </p>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.8; color: #3d372e;">
                In the meantime, you are welcome to join the ZYR0 team group on WhatsApp to connect
                with your future teammates: <a href="${teamGroupUrl}" style="color: #1e3a8a; font-weight: 600; text-decoration: none;">Join the Team WhatsApp Group</a>.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #b89c56;">What Happens Next</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #1e3a8a;">
                    <a href="${siteUrl}/careers" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #fffdf5; text-decoration: none; border: 1px solid #b89c56; border-radius: 4px;">Explore ZYR0 Careers</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 13.5px; line-height: 1.8; color: #3d372e; text-align: center;">Have questions about your application? Our support team is ready to help.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: transparent; border: 1.5px solid #b89c56;">
                    <a href="${siteUrl}/contact" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; letter-spacing: 1px; color: #1e3a8a; text-decoration: none; border-radius: 4px;">Contact Support</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #13100d;">With warm regards,<br><strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px;">The ZYR0 Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center; border-top: 1px solid #e8dcc0;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #8a7f6c;">© 2026 ZYR0. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px; color: #8a7f6c;"><a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
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
    `Thank you for applying to join the ZYR0 Founding Development Team. After a careful review of all applications, we are pleased to confirm that you have advanced to the shortlist stage for the ${role} team seat.`,
    '',
    `A member of our team will reach out in the coming days to schedule a conversation — an opportunity to get to know you better and for you to learn more about the role. Please keep an eye on your inbox.`,
    '',
    `What Happens Next:`,
    `- Explore ZYR0 Careers: ${siteUrl}/careers`,
    `- Join the Team WhatsApp Group: ${teamGroupUrl}`,
    '',
    `Have questions about your application? Contact our support team: ${siteUrl}/contact`,
    '',
    'With warm regards,',
    'The ZYR0 Team',
  ].join('\n');
  return { to: app.email, subject: `You've been shortlisted — ZYR0 Founding Development Team`, html, text };
}

async function sendCandidateEmail(app: any) {
  const { to, subject, html, text } = buildShortlistEmail(app);
  const { data, error } = await supabase.functions.invoke('send-email', {
    headers: { 'x-internal-token': import.meta.env.VITE_EMAIL_INTERNAL_TOKEN || '' },
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
    for (const app of targets) {
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
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
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
          <button onClick={handleBulkEmail} disabled={selectedCount === 0 || busy === 'email'}
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
            <button key={tab} onClick={() => setActiveTab(tab)}
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
