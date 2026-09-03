import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, CheckCircle2, X, Send, Sparkles, Loader2, Users } from 'lucide-react';
import { bulkExtendTaskDeadlines } from '@/services/tasks';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

interface TaskExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasksToExtend: any[];
  onSuccess: () => void;
}

export function TaskExtendDeadlineModal({
  isOpen,
  onClose,
  tasksToExtend,
  onSuccess,
}: TaskExtendDeadlineModalProps) {
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Compute a smart initial extended date (3 days from today or 3 days past latest due date)
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  const [newDueDate, setNewDueDate] = useState(defaultDueDate);
  const [extensionNote, setExtensionNote] = useState('');
  const [notifyInterns, setNotifyInterns] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const taskCount = tasksToExtend.length;
  const overdueCount = useMemo(() => {
    return tasksToExtend.filter((t) => {
      if (t.status === 'Approved' || !t.due_date) return false;
      const due = new Date(t.due_date);
      due.setHours(23, 59, 59, 999);
      return due.getTime() < Date.now();
    }).length;
  }, [tasksToExtend]);

  const applyPreset = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setNewDueDate(d.toISOString().split('T')[0]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueDate) {
      setError('Please select a valid new deadline date.');
      return;
    }

    if (newDueDate < todayStr) {
      setError('New deadline cannot be in the past.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const taskIds = tasksToExtend.map((t) => t.id);
      const res = await bulkExtendTaskDeadlines(taskIds, newDueDate);

      if (res.error) {
        throw res.error;
      }

      // Dispatch notifications to assigned interns if enabled
      if (notifyInterns) {
        for (const task of tasksToExtend) {
          const studentId = task.assigned_to;
          if (!studentId) continue;
          try {
            await dispatchNotificationWithSimulation({
              userId: studentId,
              title: 'Task Deadline Extended',
              message: `The deadline for "${task.title}" has been extended to ${newDueDate}.${
                extensionNote.trim() ? ` Note: "${extensionNote.trim()}"` : ''
              }`,
              type: 'task',
              actionUrl: '/student/workspace',
              studentEmail: task.assignee?.email,
            });
          } catch (notifErr) {
            console.error('Failed to dispatch deadline notification:', notifErr);
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to extend task deadline');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {taskCount === 1 ? 'Extend Task Deadline' : `Extend Deadline (${taskCount} Tasks)`}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {overdueCount > 0
                    ? `${overdueCount} of ${taskCount} selected tasks currently overdue`
                    : `Set a new deadline for ${taskCount} selected task${taskCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Task Summary Badge */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  Target Deliverables
                </span>
                <span className="text-muted-foreground">{taskCount} Task{taskCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs text-muted-foreground">
                {tasksToExtend.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-0.5">
                    <span className="truncate max-w-[240px] font-medium text-foreground">
                      {t.title}
                    </span>
                    <span className="text-[11px]">
                      {t.assignee?.full_name || 'Assigned Intern'} • Due: {t.due_date || 'None'}
                    </span>
                  </div>
                ))}
                {tasksToExtend.length > 5 && (
                  <p className="text-[11px] text-accent pt-0.5 font-medium">
                    + {tasksToExtend.length - 5} more task(s)...
                  </p>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Quick Extension Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(3)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all text-center"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all text-center"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(14)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all text-center"
                >
                  +2 Weeks
                </button>
              </div>
            </div>

            {/* Custom Date Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                New Deadline Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={newDueDate}
                  onChange={(e) => {
                    setNewDueDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                />
              </div>
            </div>

            {/* Optional Extension Note */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Extension Note / Reason (Optional)
              </label>
              <textarea
                value={extensionNote}
                onChange={(e) => setExtensionNote(e.target.value)}
                placeholder="e.g., Granted extra days for midterm exam period, or revised scope review..."
                rows={2}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Notify Interns Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="notify-interns"
                type="checkbox"
                checked={notifyInterns}
                onChange={(e) => setNotifyInterns(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
              />
              <label htmlFor="notify-interns" className="text-xs text-foreground font-medium cursor-pointer">
                Send notification & email update to assigned intern(s)
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Deadline...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {taskCount === 1 ? 'Save New Deadline' : `Extend ${taskCount} Deadlines`}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
