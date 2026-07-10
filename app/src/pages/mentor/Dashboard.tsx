import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, CheckSquare, Star, ArrowRight, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksAssignedByMe } from '@/services/tasks';
import { supabase } from '@/lib/supabase';

export default function MentorDashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!profile) return;
      try {
        // Get tasks assigned by this mentor
        const tasksRes = await getTasksAssignedByMe();
        
        // Get interns (accepted applications for the company internships)
        let internsData: any[] = [];
        if (profile.company_id) {
          const { data } = await supabase
            .from('applications')
            .select(`
              id, status,
              student:profiles!student_id (id, full_name, avatar_url, university),
              internship:internships!internship_id (id, company_id)
            `)
            .eq('status', 'Accepted');
          // Filter manually by company_id
          internsData = (data || []).filter(
            (app: any) => app.internship?.company_id === profile.company_id
          );
        }

        // Get evaluations created by this mentor
        const { data: evalsData } = await supabase
          .from('evaluations')
          .select(`
            id, overall_rating, created_at, status,
            intern:profiles!intern_id (id, full_name, avatar_url),
            internship:internships!internship_id (id, title)
          `)
          .eq('mentor_id', profile.id)
          .order('created_at', { ascending: false });

        if (tasksRes.data) setTasks(tasksRes.data);
        setInterns(internsData);
        if (evalsData) setEvaluations(evalsData);
      } catch (err) {
        console.error('Error loading mentor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Filter tasks that need review (status is "Submitted" or "Under Review")
  const pendingReviews = tasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review');
  const recentEvals = evaluations.slice(0, 2);

  // Prepare stats
  const stats = [
    { label: 'Total Interns', value: interns.length.toString(), icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Tasks Assigned', value: tasks.length.toString(), icon: ClipboardList, color: 'text-amber-600 bg-amber-100' },
    { label: 'Pending Reviews', value: pendingReviews.length.toString(), icon: Clock, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Evaluations', value: evaluations.length.toString(), icon: Star, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile.full_name || 'Mentor'}!</h1>
        <p className="text-sm text-muted-foreground mt-1">You have {pendingReviews.length} tasks to review today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card border border-border">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Reviews */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Pending Reviews</h3>
              <Link to="/mentor/tasks" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {pendingReviews.length > 0 ? pendingReviews.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.internship?.title || 'Internship'}</p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignee?.full_name || 'Student'}</p>
                    </div>
                  </div>
                  <Link to="/mentor/tasks" className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90">Review</Link>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">No pending reviews</div>
              )}
            </div>
          </motion.div>

          {/* My Interns */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">My Interns</h3>
              <Link to="/mentor/interns" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {interns.length > 0 ? interns.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={app.student?.avatar_url || `https://ui-avatars.com/api/?name=${app.student?.full_name}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{app.student?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.student?.university || 'University Student'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-emerald-100 text-emerald-700">Active</span>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">No active interns found</div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Recent Evaluations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Recent Evaluations</h3>
            <div className="space-y-3">
              {recentEvals.length > 0 ? recentEvals.map((evalItem) => (
                <div key={evalItem.id} className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={evalItem.intern?.avatar_url || `https://ui-avatars.com/api/?name=${evalItem.intern?.full_name}`} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-sm font-medium">{evalItem.intern?.full_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{evalItem.internship?.title}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(evalItem.overall_rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{evalItem.overall_rating}/5</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No evaluations created yet.</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Start Evaluation', icon: CheckSquare, href: '/mentor/evaluations' },
                { label: 'Review Tasks', icon: ClipboardList, href: '/mentor/tasks' },
                { label: 'Messages', icon: MessageSquare, href: '/mentor/messages' },
              ].map((action, i) => (
                <Link key={i} to={action.href} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent/10 transition-colors border border-border">
                  <action.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
