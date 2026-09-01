import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileCheck, Clock, Star, Phone, XCircle, Rocket, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { getMyTeamApplications } from '@/services/teamApplications';
import { TEAM_ROLES } from '@/components/team/team-data';
import { withTimeout } from '@/lib/timeout';
import { toast } from 'sonner';

const tabs = ['All', 'New', 'Under Review', 'Shortlisted', 'Contacted', 'Rejected'];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  New: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', icon: FileCheck },
  'Under Review': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', icon: Clock },
  Shortlisted: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400', icon: Star },
  Contacted: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400', icon: Phone },
  Rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: XCircle },
};

const timelineSteps = ['Submitted', 'Under Review', 'Shortlisted', 'Contacted', 'Decision'];
const statusOrder = ['New', 'Under Review', 'Shortlisted', 'Contacted'];

const roleTitle = (id: string) => TEAM_ROLES.find((r) => r.id === id)?.title ?? id;

export default function StudentTeamApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await withTimeout(getMyTeamApplications(), 10000, { data: [] }, 'StudentTeamApplications');
        const data = result?.data;
        if (data && !cancelled) setApplications(data);
      } catch (error) {
        console.error('Failed to load team applications:', error);
        toast.error('Failed to load team applications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeTab === 'All' ? applications : applications.filter(a => a.status === activeTab);

  if (loading) {
    return <Loader variant="container" className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your founding team applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab}
            {tab !== 'All' && <span className="ml-1.5 text-xs text-muted-foreground">({applications.filter(a => a.status === tab).length})</span>}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No team applications found</h3>
            <p className="text-muted-foreground mt-1">You haven't applied to any founding team roles yet.</p>
            <Link
              to="/careers/apply"
              className="mt-5 inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Apply to the founding team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          filtered.map((app, i) => {
            const config = statusConfig[app.status] || statusConfig.New;
            const StatusIcon = config.icon;
            const isRejected = app.status === 'Rejected';

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{roleTitle(app.preferred_role)}</h3>
                    {app.secondary_role && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Secondary: {roleTitle(app.secondary_role)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {app.status}
                    </span>
                    {app.skills?.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">{app.skills.length} skills listed</span>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    {timelineSteps.map((step, idx) => {
                      const currentIdx = statusOrder.indexOf(isRejected ? 'Contacted' : app.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/30' : isCurrent ? 'bg-accent/10' : 'bg-muted'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
                               isCurrent ? <AlertCircle className="w-4 h-4 text-accent" /> :
                               <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />}
                            </div>
                            <span className={`text-[10px] mt-1.5 ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step}</span>
                          </div>
                          {idx < timelineSteps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-200 dark:bg-emerald-900/30' : 'bg-border'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}