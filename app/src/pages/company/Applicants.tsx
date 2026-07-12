import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, XCircle, Star, Eye, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications, updateApplicationStatus } from '@/services/applications';

const tabs = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  Withdrawn: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400',
};

export default function CompanyApplicants() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: co } = await getMyCompany();
      if (co) {
        const { data } = await getAllCompanyApplications(co.id);
        if (data) setApplications(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = applications.filter((a) => {
    const student = Array.isArray(a.student) ? a.student[0] : a.student;
    const internship = Array.isArray(a.internship) ? a.internship[0] : a.internship;
    const matchTab = activeTab === 'All' || a.status === activeTab;
    const matchSearch =
      !search ||
      student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      internship?.title?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  async function handleStatusChange(appId: string, newStatus: string) {
    setUpdating(appId);
    const { data } = await updateApplicationStatus(appId, newStatus as any);
    if (data) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage internship applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants or positions..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const student = Array.isArray(app.student) ? app.student[0] : app.student;
                  const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
                  const isUpdating = updating === app.id;
                  return (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student?.avatar_url || `https://ui-avatars.com/api/?name=${student?.full_name || 'User'}`}
                            alt=""
                            className="w-9 h-9 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium">{student?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{student?.university || 'Unknown university'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{internship?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusColors[app.status] || 'bg-muted text-muted-foreground'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {student?.resume_url && (
                                <a
                                  href={student.resume_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 hover:bg-muted rounded-lg"
                                  title="View Resume"
                                >
                                  <Eye className="w-4 h-4 text-muted-foreground" />
                                </a>
                              )}
                              <button
                                onClick={() => handleStatusChange(app.id, 'Shortlisted')}
                                disabled={app.status === 'Shortlisted'}
                                className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg disabled:opacity-40 text-purple-600 dark:text-purple-400"
                                title="Shortlist"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(app.id, 'Accepted')}
                                disabled={app.status === 'Accepted'}
                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg disabled:opacity-40 text-emerald-600 dark:text-emerald-400"
                                title="Accept"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(app.id, 'Rejected')}
                                disabled={app.status === 'Rejected'}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg disabled:opacity-40 text-red-600 dark:text-red-400"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
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
    </div>
  );
}
