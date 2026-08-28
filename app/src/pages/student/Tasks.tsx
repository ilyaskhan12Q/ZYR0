import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, Circle, Calendar,
  ChevronRight, Loader2, FileText, MessageCircle, ExternalLink,
} from 'lucide-react';
import { getMyTasks } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';

const tabs = ['All', 'Pending', 'Submitted', 'Approved'];

const statusConfig: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  Pending: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50', dot: 'bg-slate-400', label: 'Pending' },
  Submitted: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500', label: 'Submitted' },
  'Under Review': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500', label: 'Under Review' },
  Approved: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500', label: 'Approved' },
  Rejected: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', dot: 'bg-red-500', label: 'Rejected' },
};

const priorityConfig: Record<string, { dot: string; text: string }> = {
  High: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  Low: { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
};

const WHATSAPP_URL = 'https://wa.me/923279883150';

export default function StudentTasks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data } = await getMyTasks();
        if (data) setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadTasks();
  }, [user]);

  const filtered = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);
  const completedCount = tasks.filter(t => t.status === 'Approved').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Tasks assigned across your active internships</p>
        </div>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4" /> Need Help?
        </a>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-accent">{completedCount}/{tasks.length} completed</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
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

      {/* Task cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">No tasks found</p>
            <p className="text-xs mt-1">No tasks in this category yet.</p>
          </div>
        ) : (
          filtered.map((task, i) => {
            const status = statusConfig[task.status] || statusConfig.Pending;
            const priority = priorityConfig[task.priority] || priorityConfig.Low;
            const hasDocuments = task.attachments && task.attachments.length > 0;
            const submission = task.submissions?.[0];
            const isPending = task.status === 'Pending' || task.status === 'Rejected';

            const borderClass =
              task.status === 'Approved' ? 'border-emerald-300 dark:border-emerald-800' :
              task.status === 'Submitted' || task.status === 'Under Review' ? 'border-amber-300 dark:border-amber-800' :
              task.status === 'Rejected' ? 'border-red-300 dark:border-red-800' :
              isPending ? 'border-accent/40' : 'border-border';

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card rounded-xl border shadow-sm hover:shadow-md transition-all ${borderClass}`}
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Top row: status + priority */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    {task.priority && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        <span className={priority.text}>{task.priority}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground text-[15px] leading-snug">{task.title}</h3>

                  {/* Meta: internship + due date + difficulty */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium">{task.internship?.title || 'General'}</span>
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.difficulty && (
                      <span>{task.difficulty}</span>
                    )}
                    {hasDocuments && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {task.attachments.length} doc{task.attachments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Submission summary — only for submitted/approved */}
                  {submission && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      {submission.grade != null && (
                        <span className="font-semibold text-emerald-600">Grade: {submission.grade}%</span>
                      )}
                      {submission.feedback && (
                        <span className="italic truncate max-w-[250px]">&ldquo;{submission.feedback}&rdquo;</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={task.internship_id ? `/student/workspace/${task.internship_id}?tab=tasks&taskId=${task.id}` : '#'}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isPending
                          ? 'bg-accent text-white hover:bg-accent/90 shadow-sm'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      Open Workspace <ChevronRight className="w-4 h-4" />
                    </Link>
                    {hasDocuments && (
                      <a
                        href={task.attachments[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Brief
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
