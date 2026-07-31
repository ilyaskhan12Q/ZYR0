import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, AlertCircle, CheckCircle2, Info, Calendar } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { createTask, updateTask, bulkCreateTasks } from '@/services/tasks';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

interface TaskCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: any;
  internships: any[];
  interns: any[];
  existingTasks: any[];
  onSuccess: () => void;
}

export function TaskCreateEditModal({
  isOpen,
  onClose,
  taskToEdit,
  internships,
  interns,
  existingTasks,
  onSuccess,
}: TaskCreateEditModalProps) {
  const isEditMode = !!taskToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [internshipId, setInternshipId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Bulk assignment state
  const [assignmentScope, setAssignmentScope] = useState<'individual' | 'bulk'>('individual');
  const [bulkInternshipId, setBulkInternshipId] = useState('');
  const [bulkEligibleInterns, setBulkEligibleInterns] = useState<any[]>([]);
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
      setInternshipId(taskToEdit.internship_id || '');
      setAssignedTo(taskToEdit.assigned_to || '');
      setAssignmentScope('individual');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setInternshipId('');
      setAssignedTo('');
      setAssignmentScope('individual');
      setBulkInternshipId('');
      setBulkEligibleInterns([]);
      setBulkResult(null);
    }
    setValidationErrors({});
  }, [taskToEdit, isOpen]);

  const handleBulkInternshipChange = (id: string) => {
    setBulkInternshipId(id);
    if (validationErrors.bulkInternship) {
      setValidationErrors((prev) => ({ ...prev, bulkInternship: '' }));
    }
    if (!id) {
      setBulkEligibleInterns([]);
      return;
    }
    const eligible = interns.filter((app: any) => app.internship_id === id);
    setBulkEligibleInterns(eligible);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (assignmentScope === 'individual' || isEditMode) {
      if (!internshipId) {
        errors.internship = 'Please select an internship project';
      }
      if (!assignedTo) {
        errors.intern = 'Please select an intern';
      }
    } else {
      if (!bulkInternshipId) {
        errors.bulkInternship = 'Please select an internship project';
      } else if (bulkEligibleInterns.length === 0) {
        errors.bulkInternship = 'No active/enrolled interns found for this project';
      }
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(dueDate);
      if (selected < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setBulkResult(null);

    try {
      if (isEditMode) {
        const { error } = await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || null,
          internship_id: internshipId,
          assigned_to: assignedTo,
        });

        if (!error) {
          onSuccess();
          onClose();
        }
      } else if (assignmentScope === 'bulk') {
        const internIds = bulkEligibleInterns.map((app: any) => app.student?.id || app.student_id);
        const { created, skipped, error } = await bulkCreateTasks(
          {
            title: title.trim(),
            description: description.trim(),
            priority,
            due_date: dueDate || null,
            internship_id: bulkInternshipId,
            status: 'Pending',
          },
          internIds,
          existingTasks
        );

        if (!error) {
          setBulkResult({ created, skipped });

          // Send notifications
          for (const app of bulkEligibleInterns) {
            const internId = app.student?.id || app.student_id;
            try {
              await dispatchNotificationWithSimulation({
                userId: internId,
                title: 'New Task Assigned',
                message: `You have been assigned a new task: "${title.trim()}"`,
                type: 'task',
                actionUrl: '/student/workspace',
                studentEmail: app.student?.email,
              });
            } catch (notifErr) {
              console.error('Bulk notification failed for', internId, notifErr);
            }
          }

          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        }
      } else {
        const { error } = await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || null,
          internship_id: internshipId,
          assigned_to: assignedTo,
          status: 'Pending',
        });

        if (!error) {
          // Trigger notification
          const assignedIntern = interns.find((i) => (i.student?.id || i.student_id) === assignedTo);
          if (assignedIntern) {
            try {
              await dispatchNotificationWithSimulation({
                userId: assignedTo,
                title: 'New Task Assigned',
                message: `You have been assigned a task: "${title.trim()}"`,
                type: 'task',
                actionUrl: '/student/workspace',
                studentEmail: assignedIntern.student?.email,
              });
            } catch (notifErr) {
              console.error('Task assignment notification error:', notifErr);
            }
          }

          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {isEditMode ? 'Edit Task Specifications' : 'Assign New Task'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditMode ? 'Modify task requirements & details' : 'Delegate work to enrolled interns'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="e.g. Implement User Authentication Flow & Tests"
                className={`w-full px-3.5 py-2.5 bg-background border ${
                  validationErrors.title ? 'border-red-500' : 'border-border'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20`}
              />
              {validationErrors.title && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Description & Instructions *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationErrors.description) {
                    setValidationErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Detail the technical requirements, expected deliverables, and evaluation criteria..."
                className={`w-full px-3.5 py-2.5 bg-background border ${
                  validationErrors.description ? 'border-red-500' : 'border-border'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none`}
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Assignment Scope — only in create mode */}
            {!isEditMode && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Assignment Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignmentScope('individual')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      assignmentScope === 'individual'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <User className="w-4 h-4" /> Individual Intern
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentScope('bulk')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      assignmentScope === 'bulk'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Users className="w-4 h-4" /> All Enrolled Interns
                  </button>
                </div>
              </div>
            )}

            {/* Individual Assignment Dropdowns */}
            {(assignmentScope === 'individual' || isEditMode) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Internship Project *
                  </label>
                  <select
                    value={internshipId}
                    onChange={(e) => {
                      setInternshipId(e.target.value);
                      if (validationErrors.internship) {
                        setValidationErrors((prev) => ({ ...prev, internship: '' }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-background border ${
                      validationErrors.internship ? 'border-red-500' : 'border-border'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer`}
                  >
                    <option value="">Select Project</option>
                    {internships.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                  </select>
                  {validationErrors.internship && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.internship}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Assign To *
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => {
                      setAssignedTo(e.target.value);
                      if (validationErrors.intern) {
                        setValidationErrors((prev) => ({ ...prev, intern: '' }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-background border ${
                      validationErrors.intern ? 'border-red-500' : 'border-border'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer`}
                  >
                    <option value="">Select Intern</option>
                    {interns.map((i) => (
                      <option key={i.student?.id || i.student_id} value={i.student?.id || i.student_id}>
                        {i.student?.full_name || 'Intern'}
                      </option>
                    ))}
                  </select>
                  {validationErrors.intern && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.intern}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bulk Assignment Selector */}
            {assignmentScope === 'bulk' && !isEditMode && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Select Target Project *
                  </label>
                  <select
                    value={bulkInternshipId}
                    onChange={(e) => handleBulkInternshipChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-background border ${
                      validationErrors.bulkInternship ? 'border-red-500' : 'border-border'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer`}
                  >
                    <option value="">Select Project</option>
                    {internships.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                  </select>
                  {validationErrors.bulkInternship && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.bulkInternship}
                    </p>
                  )}
                </div>

                {bulkInternshipId && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      bulkEligibleInterns.length > 0
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                    }`}
                  >
                    {bulkEligibleInterns.length > 0 ? (
                      <>
                        <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold">
                            {bulkEligibleInterns.length} intern{bulkEligibleInterns.length !== 1 ? 's' : ''} will receive this task
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {bulkEligibleInterns.map((a: any) => a.student?.full_name).filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>No active enrolled interns found for this project.</p>
                      </>
                    )}
                  </div>
                )}

                {bulkResult && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Task assigned to {bulkResult.created} intern(s).
                    {bulkResult.skipped > 0 && ` (${bulkResult.skipped} skipped — already assigned)`}
                  </div>
                )}
              </div>
            )}

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (validationErrors.dueDate) {
                      setValidationErrors((prev) => ({ ...prev, dueDate: '' }));
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-background border ${
                    validationErrors.dueDate ? 'border-red-500' : 'border-border'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20`}
                />
                {validationErrors.dueDate && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.dueDate}
                  </p>
                )}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  (assignmentScope === 'bulk' && !isEditMode && bulkEligibleInterns.length === 0) ||
                  !!bulkResult
                }
                className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader variant="button" />
                ) : isEditMode ? (
                  'Save Task Changes'
                ) : assignmentScope === 'bulk' ? (
                  `Assign to ${bulkEligibleInterns.length} Interns`
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
