import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, DollarSign, Bookmark, X, Filter, ArrowRight } from 'lucide-react';
import { internships } from '@/data/mockData';

const domains = ['All', 'Engineering', 'Design', 'Data Science', 'Marketing', 'Business', 'Research'];
const locations = ['All', 'Remote', 'On-site', 'Hybrid'];

export default function StudentInternships() {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const filtered = internships.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase());
    const matchDomain = selectedDomain === 'All' || i.domain === selectedDomain;
    const matchLocation = selectedLocation === 'All' || i.locationType === selectedLocation;
    return matchSearch && matchDomain && matchLocation;
  });

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

      <p className="text-sm text-muted-foreground">Showing {filtered.length} internships</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((internship, i) => (
          <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="internship-card">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={internship.companyLogo} alt="" className="w-10 h-10 rounded-lg" />
                  <div>
                    <p className="text-sm font-medium">{internship.company}</p>
                    <p className="text-xs text-muted-foreground">{internship.postedDate}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Bookmark className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <h3 className="mt-3 font-semibold">{internship.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">{internship.domain}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{internship.stipendType}</span>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{internship.locationType}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{internship.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {internship.duration}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {internship.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {internship.stipend}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                <Link to={`/internships/${internship.id}`} className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
