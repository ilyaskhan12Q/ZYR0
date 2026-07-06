import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Send } from 'lucide-react';
import { users } from '@/data/mockData';

const interns = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Software Engineering Intern', progress: 85, eligible: true },
  { id: '2', name: 'Emily Watson', avatar: 'https://i.pravatar.cc/150?u=emily', role: 'UI/UX Design Intern', progress: 72, eligible: true },
  { id: '3', name: 'James Park', avatar: 'https://i.pravatar.cc/150?u=james', role: 'Data Science Intern', progress: 90, eligible: true },
  { id: '4', name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=maria', role: 'Marketing Intern', progress: 45, eligible: false },
];

export default function CompanyCertificates() {
  const [search, setSearch] = useState('');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  const filtered = interns.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchEligible = !showEligibleOnly || i.eligible;
    return matchSearch && matchEligible;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Issue Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and issue certificates to completed interns</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search interns..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
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
              {filtered.map((intern) => (
                <motion.tr key={intern.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={intern.avatar} alt="" className="w-9 h-9 rounded-full" />
                      <span className="text-sm font-medium">{intern.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{intern.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${intern.progress}%` }} />
                      </div>
                      <span className="text-xs">{intern.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {intern.eligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                        <XCircle className="w-3 h-3" /> In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button disabled={!intern.eligible}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <Send className="w-3 h-3" /> Issue
                    </button>
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
