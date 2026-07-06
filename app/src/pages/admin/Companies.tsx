import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Lock, Loader2, Eye, Unlock } from 'lucide-react';
import { getAllCompanies, updateCompanyStatus } from '@/services/companies';

const tabs = ['All', 'Active', 'Pending', 'Suspended'];

export default function AdminCompanies() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCompanies() {
    try {
      const statusFilter = activeTab === 'All' ? undefined : activeTab;
      const res = await getAllCompanies({ status: statusFilter });
      if (res.data) {
        setCompanies(res.data);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, [activeTab]);

  const toggleCompanyStatus = async (companyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateCompanyStatus(companyId, nextStatus as any);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, status: nextStatus } : c))
      );
    } catch (err) {
      console.error('Error updating company status:', err);
      alert('Failed to update status');
    }
  };

  const filtered = companies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate and manage companies</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..."
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Industry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((company) => (
                    <motion.tr key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name}`} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.location || 'Location not specified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{company.industry || 'General'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                          company.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : company.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        }`}>{company.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleCompanyStatus(company.id, company.status)}
                            className={`p-1.5 rounded-lg border border-border hover:bg-muted`}
                            title={company.status === 'Active' ? 'Suspend Company' : 'Activate Company'}
                          >
                            {company.status === 'Active' ? (
                              <Lock className="w-4 h-4 text-red-500" />
                            ) : (
                              <Unlock className="w-4 h-4 text-emerald-500" />
                            )}
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
    </div>
  );
}
