import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark, MapPin, Calendar, DollarSign,
  ArrowRight, Loader2, Search
} from 'lucide-react';
import { getSavedInternships } from '@/services/internships';
import { SaveButton } from '@/components/SaveButton';

export default function StudentSavedInternships() {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await getSavedInternships(false); // always fresh
      if (mounted) {
        setSaves(data || []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Remove an item from local list when unsaved
  const handleUnsave = (internshipId: string) => {
    setSaves(prev => prev.filter(s => s.internship?.id !== internshipId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-accent" /> Saved Internships
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your bookmarked internship opportunities
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : saves.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No saved internships yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Browse internships and click the bookmark icon to save them here.
          </p>
          <Link
            to="/student/internships"
            className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Browse Internships <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {saves.map((save, i) => {
            const internship = save.internship;
            if (!internship) return null;
            const company = internship.company;

            return (
              <motion.div
                key={save.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={company?.logo_url || `https://ui-avatars.com/api/?name=${company?.name || 'Company'}`}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-background"
                      />
                      <div>
                        <p className="text-sm font-medium">{company?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved {new Date(save.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Live save/unsave button – clicking unsave removes from list */}
                    <div onClick={() => handleUnsave(internship.id)}>
                      <SaveButton
                        internshipId={internship.id}
                        compact
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      />
                    </div>
                  </div>

                  <h3 className="mt-3 font-semibold">{internship.title}</h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                      {internship.domain}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                      {internship.stipend_type}
                    </span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {internship.location_type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {internship.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {internship.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {internship.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {internship.stipend || 'Unpaid'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Deadline: {internship.deadline
                        ? new Date(internship.deadline).toLocaleDateString()
                        : 'Rolling'}
                    </span>
                    <Link
                      to={`/student/internships/${internship.id}`}
                      className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
