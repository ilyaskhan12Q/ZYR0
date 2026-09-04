import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertTriangle,
  Pencil,
  Eye,
  Award,
  Github,
  ExternalLink,
  Paperclip,
} from 'lucide-react';

interface TaskTableProps {
  tasks: any[];
  selectedTaskIds?: string[];
  onToggleSelectTask?: (taskId: string) => void;
  onSelectAllOnPage?: () => void;
  onExtendDeadline?: (task: any) => void;
  onOpenReview?: (task: any) => void;
  onOpenEdit?: (task: any) => void;
  onReviewTask?: (task: any) => void;
  onEditTask?: (task: any) => void;
}

export function TaskTable({
  tasks,
  selectedTaskIds = [],
  onToggleSelectTask,
  onSelectAllOnPage,
  onExtendDeadline,
  onOpenReview,
  onOpenEdit,
  onReviewTask,
  onEditTask,
}: TaskTableProps) {
  const handleReview = onReviewTask || onOpenReview || (() => {});
  const handleEdit = onEditTask || onOpenEdit || (() => {});
  if (tasks.length === 0) return null;

  const isAllSelected = tasks.length > 0 && tasks.every((t) => selectedTaskIds.includes(t.id));

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4 w-10">
                {onSelectAllOnPage && (
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAllOnPage}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                  />
                )}
              </th>
              <th className="py-3.5 px-4">Task & Project</th>
              <th className="py-3.5 px-4">Assigned Intern</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Deliverables</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task, idx) => {
              const submission = task.submissions?.[0];
              const isOverdue =
                task.status !== 'Approved' &&
                task.due_date &&
                new Date(task.due_date).setHours(23, 59, 59, 999) < Date.now();

              const formattedDueDate = task.due_date
                ? new Date(task.due_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—';

              return (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`hover:bg-muted/40 transition-colors group ${
                    selectedTaskIds.includes(task.id) ? 'bg-accent/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 w-10">
                    {onToggleSelectTask && (
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => onToggleSelectTask(task.id)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                      />
                    )}
                  </td>
                  {/* Task & Project */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {task.internship?.title || 'Internship Project'}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center border border-accent/20">
                        {task.assignee?.full_name ? task.assignee.full_name.charAt(0) : '?'}
                      </div>
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">
                        {task.assignee?.full_name || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium ${
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
                          <CheckCircle2 className="w-3 h-3" />
                        ) : task.status === 'Submitted' ? (
                          <Clock className="w-3 h-3" />
                        ) : task.status === 'Rejected' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                        {task.status === 'Submitted' ? 'Needs Review' : task.status}
                      </span>

                      {isOverdue && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-bold uppercase tracking-wider ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formattedDueDate}
                  </td>

                  {/* Deliverables Preview */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    {submission ? (
                      <div className="flex items-center gap-2">
                        {submission.grade !== null && submission.grade !== undefined && (
                          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Award className="w-3 h-3" /> {submission.grade}%
                          </span>
                        )}
                        {submission.github_url && (
                          <span title="GitHub Repo attached" className="text-accent">
                            <Github className="w-4 h-4" />
                          </span>
                        )}
                        {submission.live_demo_url && (
                          <span title="Live Demo link attached" className="text-emerald-600">
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        )}
                        {submission.attachments?.length > 0 && (
                          <span title="File attachments" className="text-muted-foreground flex items-center gap-0.5">
                            <Paperclip className="w-3.5 h-3.5" /> {submission.attachments.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {task.status !== 'Approved' && onExtendDeadline && (
                      <button
                        type="button"
                        onClick={() => onExtendDeadline(task)}
                        className="py-1.5 px-2.5 border border-border text-muted-foreground hover:text-accent hover:border-accent/40 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1 mr-1.5"
                        title="Extend Deadline"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Extend</span>
                      </button>
                    )}
                    {submission ? (
                      <button
                        type="button"
                        onClick={() => handleReview(task)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                          task.status === 'Submitted'
                            ? 'bg-accent text-white hover:bg-accent/90 shadow-sm'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {task.status === 'Submitted' ? 'Review' : 'View'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        className="py-1.5 px-3 border border-border text-foreground hover:bg-muted rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
