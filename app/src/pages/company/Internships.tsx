import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, XCircle, Users, TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react';
import { internships } from '@/data/mockData';

const tabs = ['All', 'Active', 'Closed', 'Draft'];

export default function CompanyInternships() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = internships.filter(i => {
    const matchTab = activeTab === 'All' || i.status === activeTab;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Internships</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your internship postings</p>
        </div>
        <Link to="/company/internships/new" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Plus className="w-4 h-4" /> Post New
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search internships..."
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

      <div className="space-y-3">
        {filtered.map((internship, i) => (
          <motion.div key={internship.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{internship.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    internship.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    internship.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{internship.status}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {internship.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {internship.stipend}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-muted-foreground" /> {internship.applicants} applicants</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-muted-foreground" /> {internship.views} views</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Close"><XCircle className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
