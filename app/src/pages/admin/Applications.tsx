import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star } from 'lucide-react';
import { applications } from '@/data/mockData';

const tabs = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Shortlisted: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function AdminApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const filtered = applications.filter(a => {
    const matchTab = activeTab === 'All' || a.status === activeTab;
    const matchSearch = !search || a.studentName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
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
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>)}</div>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Applicant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Internship</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((app) => (
                <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={app.studentAvatar} alt="" className="w-8 h-8 rounded-full" /><span className="text-sm font-medium">{app.studentName}</span></div></td>
                  <td className="px-4 py-3 text-sm">{app.internshipTitle}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusColors[app.status] || 'bg-muted'}`}>{app.status}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
