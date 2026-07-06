import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Clock, CheckCircle2, XCircle, Star, AlertCircle, Loader2 } from 'lucide-react';
import { getMyApplications } from '@/services/applications';

const tabs = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Pending: { color: 'bg-blue-100 text-blue-700', icon: FileCheck },
  'Under Review': { color: 'bg-amber-100 text-amber-700', icon: Clock },
  Shortlisted: { color: 'bg-blue-100 text-blue-700', icon: Star },
  Accepted: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  Rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function StudentApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getMyApplications();
      if (data) setApplications(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeTab === 'All' ? applications : applications.filter(a => a.status === activeTab);

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
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your internship applications</p>
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
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground mt-1">You haven't applied to any internships in this category yet.</p>
          </div>
        ) : (
          filtered.map((app, i) => {
            const config = statusConfig[app.status] || statusConfig.Pending;
            const StatusIcon = config.icon;
            
            // Handle Supabase join array vs object safely
            const company = Array.isArray(app.internship?.company) ? app.internship.company[0] : app.internship?.company;

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img src={company?.logo_url || `https://ui-avatars.com/api/?name=${company?.name || 'Company'}`} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-semibold">{app.internship?.title || 'Unknown Internship'}</h3>
                      <p className="text-sm text-muted-foreground">{company?.name || 'Unknown Company'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" /> {app.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    {['Submitted', 'Under Review', 'Interview', 'Decision'].map((step, idx) => {
                      const statusOrder = ['Pending', 'Under Review', 'Shortlisted', 'Accepted'];
                      const currentIdx = statusOrder.indexOf(app.status === 'Rejected' ? 'Accepted' : app.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-emerald-100' : isCurrent ? 'bg-accent/10' : 'bg-muted'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                               isCurrent ? <AlertCircle className="w-4 h-4 text-accent" /> :
                               <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />}
                            </div>
                            <span className={`text-[10px] mt-1.5 ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step}</span>
                          </div>
                          {idx < 3 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-200' : 'bg-border'}`} />}
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
