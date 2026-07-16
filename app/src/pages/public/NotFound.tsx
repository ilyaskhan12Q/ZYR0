import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/internships?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="pt-28 pb-16 px-4 min-h-[80vh] flex items-center justify-center">
      <SEO
        title="Page Not Found | ZYR0"
        description="The page you are looking for does not exist or has been moved. Use our search or links to find internships and company profiles."
        noIndex={true}
      />
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-3xl mb-4 text-accent"
        >
          <FileQuestion className="w-12 h-12" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">404 Error</h1>
          <h2 className="text-xl font-semibold text-foreground/80">Page Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Sorry, we couldn&apos;t find the page you are looking for. It might have been removed, renamed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Search Bar to help users find other content */}
        <motion.form
          onSubmit={handleSearchSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative max-w-xs mx-auto"
        >
          <input
            type="text"
            placeholder="Search internships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-muted-foreground" />
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" /> Go back home
          </Link>
          <Link
            to="/internships"
            className="inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Internships
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
