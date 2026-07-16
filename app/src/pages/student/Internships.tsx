import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, DollarSign, X, ArrowRight, Loader2 } from 'lucide-react';
import { getInternships } from '@/services/internships';
import { SaveButton } from '@/components/SaveButton';

const domains = ['All', 'Engineering', 'Design', 'Data Science', 'Marketing', 'Business', 'Research'];
const locations = ['All', 'Remote', 'On-site', 'Hybrid'];

export default function StudentInternships() {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInternships() {
      setLoading(true);
      try {
        const { data } = await getInternships({
          status: 'Active',
          domain: selectedDomain !== 'All' ? selectedDomain : undefined,
          location_type: selectedLocation !== 'All' ? selectedLocation : undefined,
          search: search.trim() || undefined,
        });
        if (data) {
          setInternships(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadInternships();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedDomain, selectedLocation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Internships</h1>
        <p className="text-sm text-muted-foreground mt-1">Find the perfect opportunity to kickstart your career</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search internships..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
        <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Showing {internships.length} internships</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {internships.length === 0 ? (
              <div className="lg:col-span-2 text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
                No internships found.
              </div>
            ) : (
              internships.map((internship, i) => (
                <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="internship-card bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={internship.company?.logo_url || `https://ui-avatars.com/api/?name=${internship.company?.name || 'Company'}`} alt="" className="w-10 h-10 rounded-lg object-cover bg-background" />
                        <div>
                          <p className="text-sm font-medium">{internship.company?.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(internship.posted_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <SaveButton internshipId={internship.id} compact className="p-1.5 rounded-lg hover:bg-muted transition-colors" />
                    </div>
                    <h3 className="mt-3 font-semibold">{internship.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">{internship.domain}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{internship.stipend_type}</span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{internship.location_type}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{internship.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {internship.duration}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {internship.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {internship.stipend || 'Unpaid'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Deadline: {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}</span>
                      <Link to={`/student/internships/${internship.id}`} className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
