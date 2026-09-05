import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  X, User, Users, AlertCircle, CheckCircle2, Info, Calendar,
  Upload, FileText, Trash2, Plus,
} from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { createTask, updateTask, updateMasterDeliverable, bulkCreateTasks, uploadTaskDocument } from '@/services/tasks';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';
import type { TaskAttachment } from '@/lib/database.types';

interface TaskCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: any;
  internships: any[];
  interns: any[];
  existingTasks: any[];
  onSuccess: () => void;
}

const ACCEPTED_FILE_TYPES = 'application/pdf,image/png,image/jpeg,image/webp';
const MAX_FILE_SIZE_MB = 25;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [internshipId, setInternshipId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Document attachments
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Structured fields
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // Bulk assignment state
  const [assignmentScope, setAssignmentScope] = useState<'individual' | 'bulk'>('individual');
  const [bulkInternshipId, setBulkInternshipId] = useState('');
  const [bulkEligibleInterns, setBulkEligibleInterns] = useState<any[]>([]);
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const prevIsOpenRef = useRef(false);
  const prevTaskToEditIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only re-initialize when modal opens (false -> true) or when taskToEdit ID changes.
    // Do NOT wipe user form state on redundant re-renders while the modal remains open.
    const isOpening = isOpen && !prevIsOpenRef.current;
    const taskChanged = (taskToEdit?.id || null) !== prevTaskToEditIdRef.current;
    prevIsOpenRef.current = isOpen;
    prevTaskToEditIdRef.current = taskToEdit?.id || null;

    if (!isOpen) return;
    if (!isOpening && !taskChanged) return;

    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
      setInternshipId(taskToEdit.internship_id || '');
      setAssignedTo(taskToEdit.assigned_to || '');
      setAssignmentScope('individual');
      setAttachments(taskToEdit.attachments || []);
      setObjectives(taskToEdit.objectives?.length ? taskToEdit.objectives : ['']);
      setAcceptanceCriteria(taskToEdit.acceptance_criteria?.length ? taskToEdit.acceptance_criteria : ['']);
      setDifficulty(taskToEdit.difficulty || 'Beginner');
      setEstimatedDuration(taskToEdit.estimated_duration || '');
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
      setAttachments([]);
      setObjectives(['']);
      setAcceptanceCriteria(['']);
      setDifficulty('Beginner');
      setEstimatedDuration('');
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
    const eligible = interns.filter((app: any) => app.internship_id === id && app.status === 'Accepted');
    setBulkEligibleInterns(eligible);
  };

  // Derive eligible individual interns for the currently selected internship project
  const eligibleIndividualInterns = useMemo(() => {
    if (!internshipId) return [];
    const seen = new Set<string>();
    return interns.filter((app: any) => {
      if (app.internship_id !== internshipId || app.status !== 'Accepted') return false;
      const internId = app.student?.id || app.student_id;
      if (!internId || seen.has(internId)) return false;
      seen.add(internId);
      return true;
    });
  }, [interns, internshipId]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationErrors((prev) => ({ ...prev, file: `File must be under ${MAX_FILE_SIZE_MB}MB` }));
      return;
    }

    setUploadingFile(true);
    setValidationErrors((prev) => ({ ...prev, file: '' }));

    try {
      const attachment = await uploadTaskDocument(file);
      setAttachments((prev) => [...prev, attachment]);
    } catch (err: any) {
      setValidationErrors((prev) => ({ ...prev, file: err.message || 'Upload failed' }));
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const cleanListItems = (items: string[]): string[] =>
    items.map((s) => s.trim()).filter(Boolean);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim() && attachments.length === 0) {
      errors.description = 'Provide a description or upload a task document';
    } else if (description.trim() && description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (taskToEdit?.isMasterEdit) {
      if (!internshipId) {
        errors.internship = 'Please select an internship project';
      }
    } else if (assignmentScope === 'individual' || isEditMode) {
      if (!internshipId) {
        errors.internship = 'Please select an internship project';
      }
      if (!assignedTo) {
        errors.intern = 'Please select an intern';
      } else if (
        internshipId &&
        eligibleIndividualInterns.length > 0 &&
        !eligibleIndividualInterns.some((i) => (i.student?.id || i.student_id) === assignedTo)
      ) {
        errors.intern = 'Selected intern is not enrolled in this project';
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

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || null,
      attachments,
      objectives: cleanListItems(objectives),
      acceptance_criteria: cleanListItems(acceptanceCriteria),
      difficulty,
      estimated_duration: estimatedDuration.trim() || undefined,
    };

    try {
      if (isEditMode) {
        if (taskToEdit.isMasterEdit) {
          const { error } = await updateMasterDeliverable(
            taskToEdit.internship_id || internshipId,
            taskToEdit.originalTitle || taskToEdit.title,
            taskData,
            true
          );

          if (!error) {
            onSuccess();
            onClose();
          }
        } else {
          const { error } = await updateTask(taskToEdit.id, {
            ...taskData,
            internship_id: internshipId,
            assigned_to: assignedTo,
          });

          if (!error) {
            onSuccess();
            onClose();
          }
        }
      } else if (assignmentScope === 'bulk') {
        const internIds = bulkEligibleInterns.map((app: any) => app.student?.id || app.student_id);
        const { created, skipped, error } = await bulkCreateTasks(
          { ...taskData, internship_id: bulkInternshipId, status: 'Pending' },
          internIds,
          existingTasks
        );

        if (!error) {
          setBulkResult({ created, skipped });

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
          ...taskData,
          internship_id: internshipId,
          assigned_to: assignedTo,
          status: 'Pending',
        });

        if (!error) {
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
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {taskToEdit?.isMasterEdit
                  ? 'Edit Master Deliverable'
                  : isEditMode
                  ? 'Edit Task Specifications'
                  : 'Assign New Task'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {taskToEdit?.isMasterEdit
                  ? 'Updates will sync across all assigned interns in this project'
                  : isEditMode
                  ? 'Modify task requirements & details'
                  : 'Delegate work to enrolled interns'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
                Description & Instructions
                <span className="text-muted-foreground/60 font-normal normal-case ml-1">
                  (required if no document uploaded)
                </span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationErrors.description) {
                    setValidationErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Brief summary of the task. Upload a PDF for the full specification..."
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

            {/* Document Upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Task Brief Document
              </label>
              <div
                onClick={() => !uploadingFile && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInputRef.current.files = dataTransfer.files;
                    fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  uploadingFile
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border hover:border-accent/40 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadingFile ? (
                  <div className="flex items-center justify-center gap-2 text-accent text-sm">
                    <Loader variant="button" /> Uploading...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <p className="text-xs">
                      <span className="font-semibold text-accent">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px]">PDF, PNG, JPG up to {MAX_FILE_SIZE_MB}MB</p>
                  </div>
                )}
              </div>
              {validationErrors.file && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.file}
                </p>
              )}

              {/* Uploaded files list */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="truncate">{att.name}</span>
                        <span className="text-muted-foreground flex-shrink-0">
                          ({(Number(att.size) / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-950/30 rounded text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
                      const newId = e.target.value;
                      if (newId !== internshipId) {
                        setInternshipId(newId);
                        setAssignedTo(''); // Clear previously selected intern
                        if (validationErrors.internship || validationErrors.intern) {
                          setValidationErrors((prev) => ({ ...prev, internship: '', intern: '' }));
                        }
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

                {taskToEdit?.isMasterEdit ? (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Target Scope
                    </label>
                    <div className="w-full px-3.5 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-semibold text-accent flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Syncs across all assigned interns in project</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Assign To *
                    </label>
                    <select
                      value={assignedTo}
                      disabled={!internshipId}
                      onChange={(e) => {
                        setAssignedTo(e.target.value);
                        if (validationErrors.intern) {
                          setValidationErrors((prev) => ({ ...prev, intern: '' }));
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 bg-background border ${
                        validationErrors.intern ? 'border-red-500' : 'border-border'
                      } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {!internshipId ? (
                        <option value="">Select an Internship Project first</option>
                      ) : eligibleIndividualInterns.length === 0 ? (
                        <option value="">No accepted interns found for this project</option>
                      ) : (
                        <>
                          <option value="">Select Intern ({eligibleIndividualInterns.length} available)</option>
                          {eligibleIndividualInterns.map((i) => {
                            const internId = i.student?.id || i.student_id;
                            return (
                              <option key={internId} value={internId}>
                                {i.student?.full_name || 'Intern'} {i.student?.email ? `(${i.student.email})` : ''}
                              </option>
                            );
                          })}
                        </>
                      )}
                    </select>
                    {validationErrors.intern && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.intern}
                      </p>
                    )}
                    {internshipId && eligibleIndividualInterns.length === 0 && !validationErrors.intern && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        No accepted interns enrolled in this project yet.
                      </p>
                    )}
                  </div>
                )}
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

            {/* Structured Fields: Objectives */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateListItem(setObjectives, idx, e.target.value)}
                      placeholder={`Objective ${idx + 1}`}
                      className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    {objectives.length > 1 && (
                      <button type="button" onClick={() => removeListItem(setObjectives, idx)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addListItem(setObjectives)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add Objective
                </button>
              </div>
            </div>

            {/* Structured Fields: Acceptance Criteria */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Acceptance Criteria
              </label>
              <div className="space-y-2">
                {acceptanceCriteria.map((crt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={crt}
                      onChange={(e) => updateListItem(setAcceptanceCriteria, idx, e.target.value)}
                      placeholder={`Criterion ${idx + 1}`}
                      className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    {acceptanceCriteria.length > 1 && (
                      <button type="button" onClick={() => removeListItem(setAcceptanceCriteria, idx)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addListItem(setAcceptanceCriteria)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add Criterion
                </button>
              </div>
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 2 hours, 1 week"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

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
                  uploadingFile ||
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
        </m.div>
      </div>
    </AnimatePresence>
  );
}
