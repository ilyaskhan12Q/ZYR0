import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Inbox, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { withTimeout } from '@/lib/timeout';
import { APPLICATION_STATUSES, getAllAdminApplications, updateApplicationStatus } from '@/services/applications';
import { applicationStatusClass } from '@/components/applications/status';
import ApplicationDetailDialog from '@/components/applications/ApplicationDetailDialog';
import type { ApplicationStatus } from '@/lib/database.types';

const tabs = ['All', ...APPLICATION_STATUSES];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadApplications() {
      try {
        setLoading(true);
        const result = await withTimeout(
          getAllAdminApplications(activeTab as any),
          10000,
          { data: [], error: null },
          'AdminApplications'
        );
        if (result.error) throw result.error;
        if (!cancelled) setApplications(result.data);
      } catch (err) {
        console.error('Error loading admin applications:', err);
        toast.error('Failed to load applications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadApplications();
    return () => { cancelled = true; };
  }, [activeTab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) => {
      const student = Array.isArray(a.student) ? a.student[0] : a.student;
      const internship = Array.isArray(a.internship) ? a.internship[0] : a.internship;
      return (
        student?.full_name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        student?.university?.toLowerCase().includes(q) ||
        internship?.title?.toLowerCase().includes(q) ||
        internship?.company?.name?.toLowerCase().includes(q) ||
        (student?.skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    });
  }, [applications, search]);

  const changeStatus = async (id: string, status: ApplicationStatus) => {
    setBusy(`status-${id}`);
    try {
      const { error } = await updateApplicationStatus(id, status);
      if (error) throw error;
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all platform applications and review applicant details</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, university, internship, company or skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); }}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Applicant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Internship</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No applications found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const student = Array.isArray(app.student) ? app.student[0] : app.student;
                    const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
                    return (
                      <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.full_name || 'U')}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-medium">{student?.full_name || 'No Name Provided'}</p>
                              <p className="text-xs text-muted-foreground">{student?.email || '—'} · {student?.university || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{internship?.title || 'Unknown Internship'}</p>
                          {internship?.company?.name && (
                            <p className="text-xs text-muted-foreground">{internship.company.name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {(student?.skills || []).slice(0, 3).map((s: string) => (
                              <span key={s} className="px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground">{s}</span>
                            ))}
                            {(student?.skills || []).length > 3 && (
                              <span className="text-[11px] text-muted-foreground">+{(student?.skills || []).length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', applicationStatusClass(app.status))}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(app.applied_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setDetail(app)} title="View application details"
                              className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors" aria-label="View application details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <select
                              value={app.status}
                              onChange={(e) => changeStatus(app.id, e.target.value as ApplicationStatus)}
                              disabled={busy === `status-${app.id}`}
                              aria-label={`Change status for ${student?.full_name || 'applicant'}`}
                              className="text-xs px-2 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50">
                              {APPLICATION_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ApplicationDetailDialog application={detail} open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }} />
    </div>
  );
}