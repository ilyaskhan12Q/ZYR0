import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, DollarSign, Filter,
  X, Clock, ArrowRight, Loader2
} from 'lucide-react';
import { getInternships, getInternshipDomains } from '@/services/internships';
import { SEO } from '@/components/SEO';
import { SaveButton } from '@/components/SaveButton';

const locations = ['All', 'Remote', 'On-site', 'Hybrid'];
const types = ['All', 'Full-time', 'Part-time'];

export default function BrowseInternships() {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [internships, setInternships] = useState<any[]>([]);
  const [domains, setDomains] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [internshipsRes, domainsRes] = await Promise.all([
        getInternships(),
        getInternshipDomains()
      ]);
      
      if (internshipsRes.data) {
        setInternships(internshipsRes.data);
      }
      if (domainsRes) {
        setDomains(['All', ...domainsRes]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = internships.filter((i) => {
    const company = Array.isArray(i.company) ? i.company[0] : i.company;
    const matchSearch = !search || 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      company?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchDomain = selectedDomain === 'All' || i.domain === selectedDomain;
    const matchLocation = selectedLocation === 'All' || i.location_type === selectedLocation;
    const matchType = selectedType === 'All' || i.type === selectedType;
    return matchSearch && matchDomain && matchLocation && matchType;
  });

  return (
    <div className="pt-20 pb-16 px-4">
      <SEO
        title="Browse Internships — Find Your Perfect Opportunity"
        description="Explore hundreds of verified internship opportunities across technology, design, data science, and more. Filter by domain, location, and type to find the internship that fits your career goals."
        path="/internships"
        keywords="browse internships, internship opportunities, student jobs, career internship, remote internship, technology internship"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Browse Internships</h1>
          <p className="mt-2 text-muted-foreground">Find the perfect opportunity to kickstart your career</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="search-internships" className="sr-only">Search internships</label>
              <input
                id="search-internships"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible-ring rounded"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors focus-visible-ring"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              Filters
              {(selectedDomain !== 'All' || selectedLocation !== 'All' || selectedType !== 'All') && (
                <span className="w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div
              id="filter-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <div>
                <label htmlFor="filter-domain" className="text-xs font-medium text-muted-foreground mb-1 block">Domain</label>
                <select
                  id="filter-domain"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus-visible-ring"
                >
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filter-location" className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <select
                  id="filter-location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus-visible-ring"
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filter-type" className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select
                  id="filter-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus-visible-ring"
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          {/* Active filters */}
          {(selectedDomain !== 'All' || selectedLocation !== 'All' || selectedType !== 'All') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDomain !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">
                  {selectedDomain} <button onClick={() => setSelectedDomain('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLocation !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">
                  {selectedLocation} <button onClick={() => setSelectedLocation('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedType !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">
                  {selectedType} <button onClick={() => setSelectedType('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={() => { setSelectedDomain('All'); setSelectedLocation('All'); setSelectedType('All'); }} className="text-xs text-muted-foreground hover:text-accent transition-colors">
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">Showing {filtered.length} of {internships.length} internships</p>

            {/* Internship Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((internship, i) => {
                const company = Array.isArray(internship.company) ? internship.company[0] : internship.company;
                return (
                  <motion.div
                    key={internship.id}
                    role="article"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="internship-card"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={company?.logo_url || `https://ui-avatars.com/api/?name=${company?.name || 'Company'}`}
                            alt={`${company?.name || 'Company'} logo`}
                            width="40"
                            height="40"
                            loading="lazy"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{company?.name || 'Unknown Company'}</p>
                            <time dateTime={new Date(internship.posted_date || internship.created_at).toISOString().split('T')[0]} className="text-xs text-muted-foreground">{new Date(internship.posted_date || internship.created_at).toLocaleDateString()}</time>
                          </div>
                        </div>
                        <SaveButton
                          internshipId={internship.id}
                          compact
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors focus-visible-ring"
                        />
                      </div>

                      {/* Title */}
                      <h3 className="mt-4 text-lg font-semibold">{internship.title}</h3>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">{internship.domain}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{internship.stipend_type}</span>
                        <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{internship.location_type}</span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{internship.description}</p>

                      {/* Details */}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {internship.duration || 'Flexible'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {internship.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> {internship.stipend || 'Unpaid'}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Deadline: {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}
                        </span>
                        <Link
                          to={`/internships/${internship.id}`}
                          className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors focus-visible-ring"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No internships found</h3>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => { setSearch(''); setSelectedDomain('All'); setSelectedLocation('All'); setSelectedType('All'); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
