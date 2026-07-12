import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Users, GraduationCap, Award, ArrowRight, Plus, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getInternships } from '@/services/internships';
import { getAllCompanyApplications } from '@/services/applications';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompany(co);
        const [internshipsRes, appsRes] = await Promise.all([
          getInternships({ company_id: co.id }),
          getAllCompanyApplications(co.id),
        ]);
        if (internshipsRes.data) setInternships(internshipsRes.data);
        if (appsRes.data) setApplications(appsRes.data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const appStatusColors: Record<string, string> = {
    Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    Shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  };

  const stats = [
    { label: 'Active Internships', value: internships.filter(i => i.status === 'Active').length, icon: FolderOpen, color: 'bg-blue-100 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Applicants', value: applications.length, icon: Users, color: 'bg-emerald-100 dark:bg-emerald-950/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, icon: GraduationCap, color: 'bg-purple-100 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'Accepted').length, icon: Award, color: 'bg-amber-100 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const recentApps = applications.slice(0, 5);
  const activeInternships = internships.filter(i => i.status === 'Active').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {company?.name || 'Your Company'}!</h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your internships</p>
        </div>
        <div className="flex gap-2">
          <Link to="/company/internships/new" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
            <Plus className="w-4 h-4" /> Post Internship
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applicants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Recent Applicants</h3>
              <Link to="/company/applicants" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentApps.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No applications yet.</p>
              ) : (
                recentApps.map((app) => {
                  const student = Array.isArray(app.student) ? app.student[0] : app.student;
                  const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
                  return (
                    <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <img
                          src={student?.avatar_url || `https://ui-avatars.com/api/?name=${student?.full_name || 'User'}`}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{student?.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{internship?.title || 'Unknown Position'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full ${appStatusColors[app.status] || 'bg-muted text-muted-foreground'}`}>{app.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Active Internships */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Active Internships</h3>
              <Link to="/company/internships" className="text-sm text-accent hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {activeInternships.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No active internships yet.</p>
              ) : (
                activeInternships.map((internship) => {
                  const appCount = applications.filter(a => {
                    const ai = Array.isArray(a.internship) ? a.internship[0] : a.internship;
                    return ai?.id === internship.id;
                  }).length;
                  return (
                    <div key={internship.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{internship.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{appCount} applicant{appCount !== 1 ? 's' : ''}</span>
                          <span>{internship.domain}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${internship.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>{internship.status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Application Status Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Application Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Applied', color: 'bg-blue-500' },
                { label: 'Under Review', color: 'bg-amber-500' },
                { label: 'Shortlisted', color: 'bg-purple-500' },
                { label: 'Accepted', color: 'bg-emerald-500' },
                { label: 'Rejected', color: 'bg-red-500' },
              ].map(({ label, color }) => {
                const count = applications.filter(a => a.status === label).length;
                const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Company info card */}
          {company && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold mb-3">Company Profile</h3>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name}`}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.industry}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {company.location && <p>📍 {company.location}</p>}
                {company.website && <p>🌐 {company.website}</p>}
                <p className="mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                    {company.status}
                  </span>
                </p>
              </div>
              <Link to="/company/profile" className="mt-3 text-xs text-accent hover:underline block">Edit Profile →</Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
