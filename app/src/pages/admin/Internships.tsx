import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Lock, Loader2, Unlock } from 'lucide-react';
import { getInternships, updateInternship } from '@/services/internships';

const tabs = ['All', 'Active', 'Closed', 'Draft'];

export default function AdminInternships() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInternships() {
    try {
      const statusFilter = activeTab === 'All' ? 'all' : activeTab;
      const res = await getInternships({ status: statusFilter, limit: 100 });
      if (res.data) {
        setInternships(res.data);
      }
    } catch (err) {
      console.error('Error loading internships:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInternships();
  }, [activeTab]);

  const toggleInternshipStatus = async (internshipId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      await updateInternship(internshipId, { status: nextStatus as any });
      setInternships((prev) =>
        prev.map((i) => (i.id === internshipId ? { ...i, status: nextStatus } : i))
      );
    } catch (err) {
      console.error('Error toggling internship status:', err);
      alert('Failed to update status');
    }
  };

  const filtered = internships.filter((i) => {
    const company = Array.isArray(i.company) ? i.company[0] : i.company;
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (company?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Internship Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate all internship postings</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Internship</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stats</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No internships found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((i) => {
                    const company = Array.isArray(i.company) ? i.company[0] : i.company;
                    return (
                      <motion.tr key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{i.title}</p>
                          <p className="text-xs text-muted-foreground">{i.domain} &middot; {i.location_type}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{company?.name || 'Company Name'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            i.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : i.status === 'Closed' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>{i.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {i.views_count || 0} views
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleInternshipStatus(i.id, i.status)}
                              className="p-1.5 hover:bg-muted rounded-lg border border-border"
                              title={i.status === 'Active' ? 'Close Internship' : 'Re-open Internship'}
                            >
                              {i.status === 'Active' ? (
                                <Lock className="w-4 h-4 text-red-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-emerald-500" />
                              )}
                            </button>
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
    </div>
  );
}
