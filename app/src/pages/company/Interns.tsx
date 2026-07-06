import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ClipboardList, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import { getTasksAssignedByMe } from '@/services/tasks';

export default function CompanyInterns() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: co } = await getMyCompany();
        if (co) {
          setCompany(co);
          const [appsRes, tasksRes] = await Promise.all([
            getAllCompanyApplications(co.id),
            getTasksAssignedByMe(),
          ]);

          if (appsRes.data) {
            // Find all accepted applications - these are our active interns
            const activeApplicants = appsRes.data.filter((app: any) => app.status === 'Accepted');
            setInterns(activeApplicants);
          }
          if (tasksRes.data) {
            setTasks(tasksRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load interns data', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Interns</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track your active interns</p>
      </div>

      {interns.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground shadow-sm">
          No active interns found. Accept applicants to onboard them as interns.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {interns.map((intern, i) => {
            const student = intern.student;
            const internship = intern.internship;
            const studentTasks = tasks.filter(t => t.assigned_to === student.id);
            const totalTasks = studentTasks.length;
            const tasksCompleted = studentTasks.filter(t => t.status === 'Approved').length;
            const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
            const status = progress >= 80 ? 'Exceeding' : progress >= 50 ? 'On Track' : 'Needs Attention';

            return (
              <motion.div key={intern.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name || 'Intern'}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold">{student.full_name || 'Unnamed Student'}</h3>
                      <p className="text-sm text-muted-foreground">{internship?.title || 'Intern'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    status === 'On Track' ? 'bg-emerald-100 text-emerald-700' :
                    status === 'Exceeding' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{status}</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{tasksCompleted}/{totalTasks}</p>
                    <p className="text-[10px] text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{student.university || 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">University</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-[10px] text-muted-foreground">Status</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigate(`/company/tasks?studentId=${student.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                    <ClipboardList className="w-3.5 h-3.5" /> Tasks
                  </button>
                  <button onClick={() => navigate(`/company/certificates`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                    <Star className="w-3.5 h-3.5" /> Certificate
                  </button>
                  <button onClick={() => navigate(`/company/messages?userId=${student.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
