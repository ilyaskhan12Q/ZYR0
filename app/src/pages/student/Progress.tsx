import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Clock, Target, Award, BookOpen, Code, Users, MessageSquare, Lightbulb, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCertificates } from '@/services/certificates';
import { getMyTasks } from '@/services/tasks';
import { getMyApplications } from '@/services/applications';
import { supabase } from '@/lib/supabase';

export default function StudentProgress() {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgressData() {
      if (!profile) return;
      try {
        const [certsRes, tasksRes, appsRes, logsRes] = await Promise.all([
          getMyCertificates(),
          getMyTasks(),
          getMyApplications(),
          supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (certsRes.data) setCertificates(certsRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);
        if (appsRes.data) setApplications(appsRes.data);
        if (logsRes.data) setActivities(logsRes.data);
      } catch (err) {
        console.error('Error loading progress data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgressData();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'Approved').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active internships
  const activeInternships = applications.filter((app) => app.status === 'Accepted');

  // Hardcode skills category/level mappings based on profile.skills array for visual presentation
  const skillsList = (profile.skills || []).map((skill, index) => {
    // Generate deterministic ratings & categories for user skills
    const categories = ['Technical', 'Tools', 'Soft Skills'];
    const category = categories[index % categories.length];
    const level = 70 + (index * 7) % 25; // 70% to 95%
    return { name: skill, category, level };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Progress</h1>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <motion.circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--accent))" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - completionRate / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Internships', value: `${activeInternships.length} Active`, icon: Target, color: 'text-blue-500' },
              { label: 'Certificates', value: certificates.length.toString(), icon: Award, color: 'text-purple-500' },
              { label: 'Skills', value: skillsList.length.toString(), icon: Star, color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-muted rounded-xl border border-border">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Internship */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Internship Progress</h3>
          {activeInternships.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active internship progress details found.</p>
          ) : (
            <div className="space-y-5">
              {activeInternships.map((app, i) => {
                const company = Array.isArray(app.internship?.company) ? app.internship.company[0] : app.internship?.company;
                const internTasks = tasks.filter(t => t.internship_id === app.internship_id);
                const completed = internTasks.filter(t => t.status === 'Approved').length;
                const pct = internTasks.length > 0 ? Math.round((completed / internTasks.length) * 100) : 0;
                return (
                  <div key={app.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img src={company?.logo_url || `https://ui-avatars.com/api/?name=${company?.name || 'Company'}`} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="text-sm font-medium">{app.internship?.title || 'Internship'}</span>
                      </div>
                      <span className="text-sm font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{completed}/{internTasks.length} tasks completed</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Skills Gained</h3>
          {skillsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills recorded in profile yet.</p>
          ) : (
            <div className="space-y-3">
              {skillsList.map((skill, i) => {
                const categoryColors: Record<string, string> = {
                  Technical: 'bg-blue-100 text-blue-700',
                  'Soft Skills': 'bg-purple-100 text-purple-700',
                  Tools: 'bg-amber-100 text-amber-700',
                };
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[skill.category] || 'bg-slate-100 text-slate-700'}`}>{skill.category}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent account activities recorded.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            {activities.map((item, i) => (
              <div key={item.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.action || 'Performed Action'}</p>
                  {item.details && <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
