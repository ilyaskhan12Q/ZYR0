import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, XCircle, Users, TrendingUp, Calendar, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getInternships, closeInternship } from '@/services/internships';
import { getAllCompanyApplications } from '@/services/applications';
import EditInternshipModal from './EditInternshipModal';
import type { Internship } from '@/lib/database.types';

const tabs = ['All', 'Active', 'Closed', 'Draft'];

export default function CompanyInternships() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  // Edit modal state
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);

  async function loadData() {
    const { data: co } = await getMyCompany();
    if (co) {
      setCompany(co);
      const [internshipsRes, appsRes] = await Promise.all([
        getInternships({ company_id: co.id, status: 'all' }),
        getAllCompanyApplications(co.id)
      ]);
      if (internshipsRes.data) setInternships(internshipsRes.data);
      if (appsRes.data) setApplications(appsRes.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const filtered = internships.filter(i => {
    const matchTab = activeTab === 'All' || i.status === activeTab;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  async function handleCloseInternship(id: string) {
    if (!window.confirm('Are you sure you want to close this internship?')) return;
    setUpdating(id);
    const { error } = await closeInternship(id, company?.id);
    if (!error) {
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: 'Closed' } : i));
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Internships</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and edit your internship postings</p>
        </div>
        <Link to="/company/internships/new" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 shadow-sm transition-all hover:shadow">
          <Plus className="w-4 h-4" /> Post New
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search internships..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No internships found.</p>
        ) : (
          filtered.map((internship, idx) => {
            const appCount = applications.filter(a => {
              const ai = Array.isArray(a.internship) ? a.internship[0] : a.internship;
              return ai?.id === internship.id;
            }).length;
            const isUpdating = updating === internship.id;

            return (
              <motion.div key={internship.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{internship.title}</h3>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                        internship.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        internship.status === 'Closed' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>{internship.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {internship.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {internship.stipend || 'Unpaid'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-muted-foreground" /> {appCount} applicant{appCount !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-muted-foreground" /> {internship.view_count || 0} view{internship.view_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingInternship(internship)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-accent"
                          title="Edit Internship"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <Link to={`/internships/${internship.id}`} className="p-2 hover:bg-muted rounded-lg transition-colors" title="View Public Page">
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                        {internship.status !== 'Closed' && (
                          <button onClick={() => handleCloseInternship(internship.id)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Close">
                            <XCircle className="w-4 h-4 text-red-500 hover:text-red-600" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Edit Internship Modal */}
      {editingInternship && (
        <EditInternshipModal
          internship={editingInternship}
          isOpen={!!editingInternship}
          onClose={() => setEditingInternship(null)}
          onSuccess={(updated) => {
            setInternships(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
          }}
        />
      )}
    </div>
  );
}
