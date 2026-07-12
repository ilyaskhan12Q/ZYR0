import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Star, FolderOpen, Users, X, Loader2 } from 'lucide-react';
import { getCompanies } from '@/services/companies';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';

const industries = ['All', 'Technology', 'Design', 'Data Science', 'Cloud Computing', 'Sustainability', 'FinTech', 'Engineering'];
const sizes = ['All', '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];

export default function Companies() {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [internshipCounts, setInternshipCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      try {
        const { data } = await getCompanies({
          search: search.trim() || undefined,
          industry: selectedIndustry !== 'All' ? selectedIndustry : undefined
        });

        if (data) {
          // If size is selected, filter locally
          let filtered = data;
          if (selectedSize !== 'All') {
            filtered = data.filter((c: any) => c.size === selectedSize);
          }
          setCompanies(filtered);

          // Get internship counts for all these companies
          const companyIds = filtered.map((c: any) => c.id);
          if (companyIds.length > 0) {
            const { data: countData } = await supabase
              .from('internships')
              .select('company_id')
              .in('company_id', companyIds)
              .eq('status', 'Active');

            if (countData) {
              const counts: Record<string, number> = {};
              countData.forEach((i: any) => {
                counts[i.company_id] = (counts[i.company_id] || 0) + 1;
              });
              setInternshipCounts(counts);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCompanies();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedIndustry, selectedSize]);

  return (
    <div className="pt-20 pb-16 px-4">
      <SEO
        title="Partner Companies — Internship Opportunities from Top Organizations"
        description="Discover internship opportunities from verified companies across technology, design, data science, fintech, and more. Explore company profiles, active listings, and team culture."
        path="/companies"
        keywords="internship companies, hiring companies, top internship providers, company profiles, tech companies hiring interns"
      />
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Browse Companies</h1>
          <p className="mt-2 text-muted-foreground">Discover top companies offering internship opportunities</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              {industries.map(i => <option key={i} value={i}>{i} Industry</option>)}
            </select>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : companies.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No companies found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, i) => {
              const activeJobs = internshipCounts[company.id] || 0;
              return (
                <motion.div key={company.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl border border-border shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="h-24 bg-gradient-to-r from-primary to-accent dark:from-slate-900 dark:to-accent/50 relative">
                    <div className="absolute -bottom-8 left-5">
                      <img src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name || 'Company'}`} alt="" className="w-16 h-16 rounded-xl border-4 border-card shadow-sm object-cover" />
                    </div>
                  </div>
                  <div className="pt-10 px-5 pb-5">
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.industry || 'General Industry'}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{company.description || 'No description provided.'}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {company.size || 'N/A'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{company.rating || '5.0'}</span>
                        <span className="text-xs text-muted-foreground">({company.review_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {activeJobs} active job{activeJobs !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <Link to={`/companies/${company.id}`} className="mt-4 block w-full text-center py-2.5 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors">
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
