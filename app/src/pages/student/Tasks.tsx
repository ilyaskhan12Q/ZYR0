import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, Circle, Calendar,
  Paperclip, ChevronRight, Loader2, FileText, BarChart3, Download,
  ExternalLink, Eye,
} from 'lucide-react';
import { getMyTasks } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const tabs = ['All', 'Pending', 'Submitted', 'Approved'];

const statusIcons: Record<string, React.ElementType> = {
  Pending: Circle,
  Submitted: Clock,
  'Under Review': AlertCircle,
  Approved: CheckCircle2,
  Rejected: AlertCircle,
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  Pending: { color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20', label: 'Pending' },
  Submitted: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Submitted' },
  'Under Review': { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Under Review' },
  Approved: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Approved' },
  Rejected: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', label: 'Rejected' },
};

const priorityConfig: Record<string, { dot: string; text: string; bg: string }> = {
  High: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  Low: { dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
};

export default function StudentTasks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTask, setPreviewTask] = useState<any | null>(null);

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
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks assigned across your active internships</p>
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
            const StatusIcon = statusIcons[task.status] || Circle;
            const status = statusConfig[task.status] || statusConfig.Pending;
            const priority = priorityConfig[task.priority] || priorityConfig.Low;
            const hasDocuments = task.attachments && task.attachments.length > 0;
            const submission = task.submissions?.[0];
            const isPending = task.status === 'Pending';

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  isPending ? 'border-accent/30' : 'border-border'
                }`}
              >
                <div className="flex items-stretch">
                  {/* Left accent strip */}
                  <div className={`w-1 flex-shrink-0 ${
                    task.status === 'Approved' ? 'bg-emerald-500' :
                    task.status === 'Submitted' || task.status === 'Under Review' ? 'bg-amber-500' :
                    task.status === 'Rejected' ? 'bg-red-500' : 'bg-muted'
                  }`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title + status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>

                        {/* Internship + description */}
                        <p className="text-sm text-muted-foreground mt-0.5">{task.internship?.title || 'General'}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {/* Priority */}
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${priority.bg} ${priority.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {task.priority}
                          </span>

                          {/* Due date */}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                          </span>

                          {/* Difficulty */}
                          {task.difficulty && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BarChart3 className="w-3.5 h-3.5" /> {task.difficulty}
                            </span>
                          )}

                          {/* Documents badge */}
                          {hasDocuments && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                              <FileText className="w-3.5 h-3.5" />
                              {task.attachments.length} doc{task.attachments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Submitted info */}
                        {submission && (
                          <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                            {submission.grade && (
                              <span className="font-semibold text-emerald-600">Grade: {submission.grade}%</span>
                            )}
                            {submission.feedback && (
                              <span className="italic truncate max-w-[300px]">&ldquo;{submission.feedback}&rdquo;</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {hasDocuments && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewTask(task); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Brief
                          </button>
                        )}
                        <Link
                          to={task.internship_id ? `/student/workspace/${task.internship_id}` : '#'}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewTask} onOpenChange={(open) => { if (!open) setPreviewTask(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {previewTask && (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{previewTask.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={previewTask.attachments[0].url}
                    download={previewTask.attachments[0].name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <a
                    href={previewTask.attachments[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                </div>
              </div>
              {previewTask.attachments[0].type === 'application/pdf' ? (
                <iframe
                  src={previewTask.attachments[0].url}
                  className="w-full h-[70vh]"
                  title={previewTask.attachments[0].name}
                />
              ) : (
                <div className="p-4 flex justify-center bg-muted/30">
                  <img
                    src={previewTask.attachments[0].url}
                    alt={previewTask.attachments[0].name}
                    className="max-w-full max-h-[70vh] rounded-lg border border-border"
                  />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
