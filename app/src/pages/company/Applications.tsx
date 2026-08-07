import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Eye, Inbox, Loader2, MessageSquare, Search, Star, XCircle } from 'lucide-react';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications, updateApplicationStatus, APPLICATION_STATUSES } from '@/services/applications';
import { applicationStatusClass } from '@/components/applications/status';
import ApplicationDetailDialog from '@/components/applications/ApplicationDetailDialog';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/lib/database.types';

const tabs = ['All', ...APPLICATION_STATUSES];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CompanyApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const { data: co } = await getMyCompany();
      if (co) {
        const { data, error } = await getAllCompanyApplications(co.id);
        if (error) throw error;
        setApplications(data ?? []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error loading company applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const student = Array.isArray(a.student) ? a.student[0] : a.student;
      const internship = Array.isArray(a.internship) ? a.internship[0] : a.internship;
      const matchTab = activeTab === 'All' || a.status === activeTab;
      const matchSearch =
        !q ||
        student?.full_name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        student?.university?.toLowerCase().includes(q) ||
        internship?.title?.toLowerCase().includes(q) ||
        (student?.skills || []).some((s: string) => s.toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [applications, search, activeTab]);

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
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage internship applications with full applicant details</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants or positions..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}>
              {tab}
            </button>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
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
                            <img
                              src={student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.full_name || 'U')}`}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{student?.full_name || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">{student?.university || 'Unknown university'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{internship?.title || '—'}</td>
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
                            {busy === `status-${app.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <button onClick={() => setDetail(app)} title="View applicant details"
                                  className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors" aria-label="View applicant details">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <select
                                  value={app.status}
                                  onChange={(e) => changeStatus(app.id, e.target.value as ApplicationStatus)}
                                  aria-label={`Change status for ${student?.full_name || 'applicant'}`}
                                  className="text-xs px-2 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/20">
                                  {APPLICATION_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => changeStatus(app.id, 'Shortlisted')}
                                  disabled={app.status === 'Shortlisted'}
                                  className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg disabled:opacity-40 text-purple-600 dark:text-purple-400"
                                  title="Shortlist"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => changeStatus(app.id, 'Accepted')}
                                  disabled={app.status === 'Accepted'}
                                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg disabled:opacity-40 text-emerald-600 dark:text-emerald-400"
                                  title="Accept"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => changeStatus(app.id, 'Rejected')}
                                  disabled={app.status === 'Rejected'}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg disabled:opacity-40 text-red-600 dark:text-red-400"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                {student?.resume_url && (
                                  <a href={student.resume_url} target="_blank" rel="noreferrer"
                                    className="p-1.5 hover:bg-muted rounded-lg" title="View Resume">
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                  </a>
                                )}
                                <a href={`/company/messages?internshipId=${app.internship_id}&userId=${student?.id}`}
                                  className="p-1.5 hover:bg-accent/10 rounded-lg text-accent" title="Message Applicant">
                                  <MessageSquare className="w-4 h-4" />
                                </a>
                              </>
                            )}
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
