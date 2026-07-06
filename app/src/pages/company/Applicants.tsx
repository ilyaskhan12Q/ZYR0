import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, XCircle, Star, Eye } from 'lucide-react';
import { applications } from '@/data/mockData';

const tabs = ['All', 'Applied', 'Under Review', 'Shortlisted'];
const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Shortlisted: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function CompanyApplicants() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = applications.filter(a => {
    const matchTab = activeTab === 'All' || a.status === activeTab;
    const matchSearch = !search || a.studentName.toLowerCase().includes(search.toLowerCase()) || a.internshipTitle.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage internship applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicants..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internship</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((app) => (
                <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={app.studentAvatar} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{app.studentName}</p>
                        <p className="text-xs text-muted-foreground">{app.studentName.toLowerCase().replace(' ', '.')}@email.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{app.internshipTitle}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusColors[app.status] || 'bg-muted text-muted-foreground'}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-muted rounded-lg" title="View"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Shortlist"><Star className="w-4 h-4 text-emerald-600" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject"><XCircle className="w-4 h-4 text-red-600" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
