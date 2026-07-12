import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import { getTasksAssignedByMe } from '@/services/tasks';
import { getCompanyCertificates, issueCertificate } from '@/services/certificates';
import { createWorkspaceEvent } from '@/services/workspaceEvents';
import { clearCache } from '@/lib/cache';

export default function CompanyCertificates() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompany(co);
        const [appsRes, tasksRes, certsRes] = await Promise.all([
          getAllCompanyApplications(co.id),
          getTasksAssignedByMe(),
          getCompanyCertificates(co.id)
        ]);

        if (appsRes.data) {
          // Accepted applicants are interns
          const activeInterns = appsRes.data.filter((app: any) => app.status === 'Accepted');
          setInterns(activeInterns);
        }
        if (tasksRes.data) setTasks(tasksRes.data);
        if (certsRes.data) setCertificates(certsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleIssue = async (intern: any) => {
    const student = intern.student;
    const internship = intern.internship;
    if (!student || !internship) return;

    setIssuingId(intern.id);
    setError(null);

    try {
      const { data, error: err } = await issueCertificate({
        internship_id: internship.id,
        recipient_id: student.id,
        title: `${internship.title} Internship Completion`,
        skills: internship.skills || [],
        description: `Successfully completed the ${internship.title} internship at ${company.name}.`
      });

      if (err) throw err;

      await createWorkspaceEvent({
        internship_id: internship.id,
        student_id: student.id,
        event_type: 'certificate_issued',
        title: 'Certificate Issued',
        description: `Certificate for ${internship.title} has been issued.`,
      });

      clearCache(`my_certificates_${student.id}`);

      // Refresh certificates
      const { data: updatedCerts } = await getCompanyCertificates(company.id);
      if (updatedCerts) setCertificates(updatedCerts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to issue certificate. Please check Edge Function logs.');
    } finally {
      setIssuingId(null);
    }
  };

  const internsWithStatus = interns.map(intern => {
    const student = intern.student;
    const internship = intern.internship;
    const studentTasks = tasks.filter(t => t.assigned_to === student.id);
    const totalTasks = studentTasks.length;
    const tasksCompleted = studentTasks.filter(t => t.status === 'Approved').length;
    const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
    
    // Eligible if progress >= 80% or they completed at least 1 task
    const eligible = progress >= 80 || (totalTasks > 0 && tasksCompleted >= 1);

    // Check if certificate already exists
    const hasCert = certificates.some(c => c.recipient_id === student.id && c.internship_id === internship.id);

    return {
      ...intern,
      progress,
      eligible,
      hasCert
    };
  });

  const filtered = internsWithStatus.filter(i => {
    const name = i.student?.full_name || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchEligible = !showEligibleOnly || i.eligible;
    return matchSearch && matchEligible;
  });

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
        <h1 className="text-2xl font-bold">Issue Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and issue certificates to completed interns</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search interns..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors select-none">
          <input type="checkbox" checked={showEligibleOnly} onChange={(e) => setShowEligibleOnly(e.target.checked)} className="rounded" />
          Eligible only
        </label>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Intern</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No interns found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((intern) => {
                  const isIssuing = issuingId === intern.id;
                  return (
                    <motion.tr key={intern.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={intern.student?.avatar_url || `https://ui-avatars.com/api/?name=${intern.student?.full_name || 'Intern'}`}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium">{intern.student?.full_name || 'Unnamed Student'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{intern.internship?.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${intern.progress}%` }} />
                          </div>
                          <span className="text-xs">{intern.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {intern.hasCert ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Issued
                          </span>
                        ) : intern.eligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs rounded-full font-medium">
                            <XCircle className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {intern.hasCert ? (
                          <span className="text-xs text-muted-foreground font-medium">Completed</span>
                        ) : (
                          <button
                            onClick={() => handleIssue(intern)}
                            disabled={!intern.eligible || isIssuing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isIssuing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Issue
                          </button>
                        )}
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
