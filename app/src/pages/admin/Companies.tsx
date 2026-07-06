import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Eye, Edit, Lock } from 'lucide-react';
import { companies } from '@/data/mockData';

const tabs = ['All', 'Active', 'Pending', 'Suspended'];

export default function AdminCompanies() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c => {
    const matchTab = activeTab === 'All' || c.status === activeTab;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
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
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Industry</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stats</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((company) => (
                <motion.tr key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={company.logo} alt="" className="w-9 h-9 rounded-lg" />
                      <div>
                        <p className="text-sm font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{company.industry}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      company.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : company.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{company.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{company.internshipsPosted} postings &middot; {company.activeInterns} interns</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-muted rounded-lg"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 hover:bg-muted rounded-lg"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                      {company.status === 'Active' ? (
                        <button className="p-1.5 hover:bg-red-50 rounded-lg"><Lock className="w-4 h-4 text-red-500" /></button>
                      ) : (
                        <button className="p-1.5 hover:bg-emerald-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></button>
                      )}
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
