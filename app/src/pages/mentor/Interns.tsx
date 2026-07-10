import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, CheckSquare, Star, MessageSquare, Loader2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function MentorInterns() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInternsData() {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch accepted applications for the company internships
        const { data: apps, error: appsErr } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            internship:internships!internship_id (
              id,
              title,
              company_id,
              company:companies!company_id (name)
            ),
            student:profiles!student_id (
              id,
              full_name,
              avatar_url,
              university
            )
          `)
          .eq('status', 'Accepted');

        if (appsErr) throw appsErr;

        // Filter applications for the mentor's company
        const filteredApps = (apps || []).filter(
          (app: any) => app.internship?.company_id === profile.company_id
        );

        // 2. Fetch tasks and evaluations for all filtered students to compute stats
        const internsList = await Promise.all(
          filteredApps.map(async (app: any) => {
            const studentId = app.student?.id;
            if (!studentId) return null;

            // Fetch tasks
            const { data: tasks } = await supabase
              .from('tasks')
              .select('id, status')
              .eq('assigned_to', studentId);

            // Fetch average evaluation rating
            const { data: evals } = await supabase
              .from('evaluations')
              .select('overall_rating')
              .eq('intern_id', studentId);

            const totalTasks = tasks?.length || 0;
            const completedTasks = tasks?.filter((t: any) => t.status === 'Approved').length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const ratings = evals?.map((e: any) => e.overall_rating) || [];
            const avgRating = ratings.length > 0
              ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
              : 'N/A';

            // Determine status
            let status = 'On Track';
            if (progress < 40 && totalTasks > 0) status = 'Needs Attention';
            else if (progress >= 85 && totalTasks > 0) status = 'Exceeding';

            return {
              id: studentId,
              name: app.student?.full_name || 'Anonymous Student',
              avatar: app.student?.avatar_url,
              role: app.internship?.title || 'Intern',
              company: app.internship?.company?.name || 'Your Company',
              university: app.student?.university || 'University Not Listed',
              progress,
              tasksCompleted: completedTasks,
              totalTasks,
              rating: avgRating,
              status,
            };
          })
        );

        setInterns(internsList.filter(Boolean));
      } catch (err: any) {
        console.error('Error fetching interns data:', err);
        toast.error('Failed to load interns list');
      } finally {
        setLoading(false);
      }
    }

    fetchInternsData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile?.company_id) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg">No Company Association</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          You must be associated with a company by an admin to view and manage interns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Interns</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and evaluate your assigned interns</p>
      </div>

      {interns.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Interns Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Once students accept internship offers at your company, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {interns.map((intern, i) => (
            <motion.div 
              key={intern.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={intern.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(intern.name)}`} 
                    alt={intern.name} 
                    className="w-12 h-12 rounded-full object-cover border border-border" 
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{intern.name}</h3>
                    <p className="text-sm text-muted-foreground">{intern.role}</p>
                    <p className="text-xs text-muted-foreground">{intern.university}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  intern.status === 'On Track' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  intern.status === 'Exceeding' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>{intern.status}</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5 font-sans">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{intern.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${intern.progress}%` }} 
                    transition={{ duration: 0.8, delay: i * 0.1 }} 
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-muted/40 border border-border/50 rounded-lg">
                  <p className="text-sm font-semibold">{intern.tasksCompleted}/{intern.totalTasks}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Tasks</p>
                </div>
                <div className="text-center p-2 bg-muted/40 border border-border/50 rounded-lg">
                  <p className="text-sm font-semibold flex items-center justify-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {intern.rating}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Rating</p>
                </div>
                <div className="text-center p-2 bg-muted/40 border border-border/50 rounded-lg">
                  <p className="text-sm font-semibold truncate">Active</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Status</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => navigate(`/mentor/tasks?student_id=${intern.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Tasks
                </button>
                <button 
                  onClick={() => navigate(`/mentor/evaluations?student_id=${intern.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <CheckSquare className="w-4 h-4" /> Evaluate
                </button>
                <button 
                  onClick={() => navigate(`/mentor/messages?student_id=${intern.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
