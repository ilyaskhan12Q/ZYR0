import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const tabs = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
  Withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function AdminApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadApplications() {
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          internship:internships!internship_id (id, title),
          student:profiles!student_id (id, full_name, avatar_url)
        `)
        .order('applied_at', { ascending: false });

      if (activeTab !== 'All') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setApplications(data);
      }
    } catch (err) {
      console.error('Error loading admin applications:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const filtered = applications.filter((a) => {
    const matchSearch =
      !search ||
      (a.student?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.internship?.title || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all platform applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={app.student?.avatar_url || `https://ui-avatars.com/api/?name=${app.student?.full_name || 'User'}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm font-medium">{app.student?.full_name || 'No Name Provided'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{app.internship?.title || 'Unknown Internship'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusColors[app.status] || 'bg-muted'}`}>{app.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
