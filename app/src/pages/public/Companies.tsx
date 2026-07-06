import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Star, FolderOpen, Users, X, Building2 } from 'lucide-react';
import { companies } from '@/data/mockData';

const industries = ['All', 'Technology', 'Design', 'Data Science', 'Cloud Computing', 'Sustainability', 'FinTech'];
const sizes = ['All', '11-50 employees', '51-200 employees', '201-500 employees'];

export default function Companies() {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
    const matchSize = selectedSize === 'All' || c.size === selectedSize;
    return matchSearch && matchIndustry && matchSize;
  });

  return (
    <div className="pt-20 pb-16 px-4">
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
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company, i) => (
            <motion.div key={company.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-24 bg-gradient-to-r from-primary to-accent relative">
                <div className="absolute -bottom-8 left-5">
                  <img src={company.logo} alt="" className="w-16 h-16 rounded-xl border-4 border-card shadow-sm" />
                </div>
              </div>
              <div className="pt-10 px-5 pb-5">
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.industry}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{company.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {company.size}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{company.rating}</span>
                    <span className="text-xs text-muted-foreground">({company.reviews})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {company.internshipsPosted}</span>
                  </div>
                </div>
                <Link to={`/companies/${company.id}`} className="mt-4 block w-full text-center py-2.5 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors">
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
