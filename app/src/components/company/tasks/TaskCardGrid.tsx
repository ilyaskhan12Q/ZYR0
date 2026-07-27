import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  User,
  Paperclip,
  Pencil,
  Eye,
  AlertTriangle,
  Github,
  ExternalLink,
  MessageSquare,
  Award,
  Sparkles,
} from 'lucide-react';

interface TaskCardGridProps {
  tasks: any[];
  onOpenReview?: (task: any) => void;
  onOpenEdit?: (task: any) => void;
  onReviewTask?: (task: any) => void;
  onEditTask?: (task: any) => void;
}

export function TaskCardGrid({
  tasks,
  onOpenReview,
  onOpenEdit,
  onReviewTask,
  onEditTask,
}: TaskCardGridProps) {
  const handleReview = onReviewTask || onOpenReview || (() => {});
  const handleEdit = onEditTask || onOpenEdit || (() => {});
  if (tasks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task, i) => {
        const submission = task.submissions?.[0];
        const isOverdue =
          task.status !== 'Approved' &&
          task.due_date &&
          new Date(task.due_date).setHours(23, 59, 59, 999) < Date.now();

        const formattedDueDate = task.due_date
          ? new Date(task.due_date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'No date';

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-card rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
              isOverdue
                ? 'border-red-500/30 dark:border-red-500/20 bg-red-500/5'
                : task.status === 'Submitted'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-border'
            }`}
          >
            {/* Top Row: Status Badge & Priority Pill */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${
                      task.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : task.status === 'Submitted'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                        : task.status === 'Rejected'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {task.status === 'Approved' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : task.status === 'Submitted' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : task.status === 'Rejected' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                    {task.status === 'Submitted' ? 'Needs Review' : task.status}
                  </span>

                  {isOverdue && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-0.5 text-[11px] rounded-full font-bold uppercase tracking-wider ${
                    task.priority === 'High'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : task.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Title & Internship Project */}
              <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {task.title}
              </h3>
              <p className="text-xs font-medium text-accent/90 mt-0.5">
                {task.internship?.title || 'Internship Project'}
              </p>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 min-h-[2rem]">
                {task.description || 'No additional guidelines specified.'}
              </p>

              {/* Assignee & Meta Details */}
              <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="w-3.5 h-3.5 text-accent" />
                    {task.assignee?.full_name || 'Unassigned Intern'}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDueDate}
                  </span>
                </div>
              </div>

              {/* Submission Details snippet if available */}
              {submission && (
                <div className="mt-3 p-2.5 rounded-xl bg-muted/60 border border-border/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Submitted Deliverable
                    </span>
                    {submission.grade !== null && submission.grade !== undefined && (
                      <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Award className="w-3 h-3" /> {submission.grade}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    {submission.github_url && (
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <Github className="w-3 h-3" /> Code Repo
                      </span>
                    )}
                    {submission.live_demo_url && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <ExternalLink className="w-3 h-3" /> Live Demo
                      </span>
                    )}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <Paperclip className="w-3 h-3" /> {submission.attachments.length} files
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              {submission ? (
                <button
                  type="button"
                  onClick={() => handleReview(task)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    task.status === 'Submitted'
                      ? 'bg-accent text-white shadow-sm hover:bg-accent/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {task.status === 'Submitted' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Review Deliverables
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> View Review & Grade
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] text-muted-foreground italic">Awaiting submission</span>
                  <button
                    type="button"
                    onClick={() => handleEdit(task)}
                    className="py-1.5 px-3 border border-border text-foreground hover:bg-muted rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
