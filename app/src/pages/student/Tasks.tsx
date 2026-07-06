import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Circle, Calendar, Paperclip, ChevronRight, Loader2 } from 'lucide-react';
import { getMyTasks } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';

const tabs = ['All', 'Pending', 'Submitted', 'Approved'];

const statusIcons: Record<string, React.ElementType> = {
  Pending: Circle,
  Submitted: Clock,
  'Under Review': AlertCircle,
  Approved: CheckCircle2,
  Rejected: AlertCircle,
};

const statusColors: Record<string, string> = {
  Pending: 'text-muted-foreground',
  Submitted: 'text-amber-500',
  'Under Review': 'text-amber-500',
  Approved: 'text-emerald-500',
  Rejected: 'text-red-500',
};

export default function StudentTasks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data } = await getMyTasks();
        if (data) {
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadTasks();
    }
  }, [user]);

  const filtered = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);

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
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks assigned across your active internships</p>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab}
            {tab !== 'All' && <span className="ml-1.5 text-xs text-muted-foreground">({tasks.filter(t => t.status === tab).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
            No tasks found.
          </div>
        ) : (
          filtered.map((task, i) => {
            const StatusIcon = statusIcons[task.status] || Circle;
            const submission = task.submissions?.[0];
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusColors[task.status]}`} />
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.internship?.title || 'General'}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
                        {task.attachments && task.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> {task.attachments.length} files</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{task.priority}</span>
                    <Link to={`/student/tasks/${task.id}`} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                </div>

                {submission && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                      {submission.grade && <span className="ml-2 text-emerald-600 font-medium">Grade: {submission.grade}%</span>}
                    </p>
                    {submission.feedback && (
                      <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{submission.feedback}&rdquo;</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
