import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, CheckCircle2, Clock, Circle, Calendar, Paperclip, ChevronRight, User, Loader2, X, AlertCircle, Pencil } from 'lucide-react';
import { getTasksAssignedByMe, createTask, updateTask, reviewSubmission } from '@/services/tasks';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import { getInternships } from '@/services/internships';

const tabs = ['All', 'Pending', 'Submitted', 'Approved', 'Rejected'];

export default function CompanyTasks() {
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  // Create task modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newInternshipId, setNewInternshipId] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('Medium');
    setNewDueDate('');
    setNewInternshipId('');
    setNewAssignedTo('');
    setValidationErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDescription(task.description || '');
    setNewPriority(task.priority);
    setNewDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setNewInternshipId(task.internship_id);
    setNewAssignedTo(task.assigned_to);
    setValidationErrors({});
    setShowCreateModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) {
      errors.title = 'Title is required';
    } else if (newTitle.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!newDescription.trim()) {
      errors.description = 'Description is required';
    } else if (newDescription.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!newInternshipId) {
      errors.internship = 'Please select an internship project';
    }

    if (!newAssignedTo) {
      errors.intern = 'Please select an intern';
    }

    if (newDueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(newDueDate);
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Review submission state
  const [reviewingTask, setReviewingTask] = useState<any>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [useRubric, setUseRubric] = useState(true);
  const [rubricCodeQuality, setRubricCodeQuality] = useState(30);
  const [rubricDesign, setRubricDesign] = useState(30);
  const [rubricFunctionality, setRubricFunctionality] = useState(40);

  const loadData = async () => {
    try {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompany(co);
        const [tasksRes, appsRes, internshipsRes] = await Promise.all([
          getTasksAssignedByMe(),
          getAllCompanyApplications(co.id),
          getInternships({ company_id: co.id, status: 'Active' }),
        ]);

        if (tasksRes.data) {
          setTasks(tasksRes.data);
        }
        if (appsRes.data) {
          // Find all accepted applications - these are active interns
          const activeInterns = appsRes.data.filter((app: any) => app.status === 'Accepted');
          setInterns(activeInterns);
        }
        if (internshipsRes.data) {
          setInternships(internshipsRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingTaskId) {
        const { error } = await updateTask(editingTaskId, {
          title: newTitle.trim(),
          description: newDescription.trim(),
          priority: newPriority,
          due_date: newDueDate || null,
          internship_id: newInternshipId,
          assigned_to: newAssignedTo,
        });
        if (!error) {
          setShowCreateModal(false);
          await loadData();
        }
      } else {
        const { error } = await createTask({
          title: newTitle.trim(),
          description: newDescription.trim(),
          priority: newPriority,
          due_date: newDueDate || null,
          internship_id: newInternshipId,
          assigned_to: newAssignedTo,
          status: 'Pending',
        });
        if (!error) {
          setShowCreateModal(false);
          await loadData();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmission = async (status: 'Approved' | 'Rejected') => {
    if (!reviewingTask || !reviewingTask.submissions?.[0]) return;
    setReviewing(true);
    try {
      const submission = reviewingTask.submissions[0];
      const calculatedGrade = useRubric 
        ? (rubricCodeQuality + rubricDesign + rubricFunctionality) 
        : (reviewGrade ? parseInt(reviewGrade, 10) : 100);
      
      let finalFeedback = reviewFeedback.trim();
      if (useRubric) {
        const rubricBreakdown = `[Rubric Breakdown - Code Quality: ${rubricCodeQuality}/30, Design: ${rubricDesign}/30, Functionality: ${rubricFunctionality}/40]`;
        finalFeedback = finalFeedback ? `${rubricBreakdown}\nFeedback: ${finalFeedback}` : rubricBreakdown;
      }

      const { error } = await reviewSubmission(submission.id, {
        status,
        feedback: finalFeedback || undefined,
        grade: calculatedGrade,
      });

      if (!error) {
        // Correctly update the task status using updateTask instead of createTask
        await updateTask(reviewingTask.id, {
          status,
          feedback: finalFeedback || undefined,
          grade: calculatedGrade,
        });

        setReviewingTask(null);
        setReviewFeedback('');
        setReviewGrade('');
        setRubricCodeQuality(30);
        setRubricDesign(30);
        setRubricFunctionality(40);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage tasks for your interns</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab} <span className="text-xs text-muted-foreground">({tab === 'All' ? tasks.length : tasks.filter(t => t.status === tab).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground mt-1">Create a task to assign work to your active interns.</p>
          </div>
        ) : (
          filtered.map((task, i) => {
            const submission = task.submissions?.[0];
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {task.status === 'Approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> :
                     task.status === 'Submitted' ? <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" /> :
                     task.status === 'Rejected' ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" /> :
                     <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.internship?.title || 'Internship'}</p>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {task.assignee?.full_name || 'Unassigned'}</span>
                        {task.attachments && task.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> {task.attachments.length} files</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{task.priority}</span>
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      task.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'Submitted' ? 'bg-amber-100 text-amber-700' :
                      task.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{task.status}</span>
                  </div>
                </div>

                {submission && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm">
                          Submitted by <span className="font-medium">{task.assignee?.full_name}</span> on {new Date(submission.submitted_at).toLocaleDateString()}
                          {submission.grade !== null && submission.grade !== undefined && <span className="ml-2 text-emerald-600 font-medium">Grade: {submission.grade}%</span>}
                        </p>
                        {submission.notes && <p className="text-xs text-muted-foreground mt-1 bg-muted p-2.5 rounded-lg border border-border">Note: {submission.notes}</p>}
                        {submission.feedback && <p className="text-xs text-muted-foreground italic">&ldquo;{submission.feedback}&rdquo;</p>}
                      </div>
                      {task.status === 'Submitted' && (
                        <button onClick={() => setReviewingTask(task)} className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors">
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!submission && task.status === 'Pending' && (
                  <div className="mt-4 pt-3 border-t border-border flex justify-end">
                    <button onClick={() => handleOpenEditModal(task)} className="px-3 py-1.5 border border-border text-foreground hover:bg-muted rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Task
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-lg">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input type="text" value={newTitle} onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors(prev => ({ ...prev, title: '' }));
                  }
                }} placeholder="e.g. Design Homepage Mockups"
                  className={`w-full px-3.5 py-2.5 bg-background border ${validationErrors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-accent/20'} rounded-lg text-sm focus:outline-none focus:ring-2`} />
                {validationErrors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea rows={3} value={newDescription} onChange={(e) => {
                  setNewDescription(e.target.value);
                  if (validationErrors.description) {
                    setValidationErrors(prev => ({ ...prev, description: '' }));
                  }
                }} placeholder="Provide detailed instructions for the task..."
                  className={`w-full px-3.5 py-2.5 bg-background border ${validationErrors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-accent/20'} rounded-lg text-sm focus:outline-none focus:ring-2 resize-none`} />
                {validationErrors.description && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Internship Project</label>
                  <select value={newInternshipId} onChange={(e) => {
                    setNewInternshipId(e.target.value);
                    if (validationErrors.internship) {
                      setValidationErrors(prev => ({ ...prev, internship: '' }));
                    }
                  }}
                    className={`w-full px-3.5 py-2.5 bg-background border ${validationErrors.internship ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-accent/20'} rounded-lg text-sm focus:outline-none focus:ring-2`}>
                    <option value="">Select Internship</option>
                    {internships.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                  {validationErrors.internship && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.internship}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Assign To (Intern)</label>
                  <select value={newAssignedTo} onChange={(e) => {
                    setNewAssignedTo(e.target.value);
                    if (validationErrors.intern) {
                      setValidationErrors(prev => ({ ...prev, intern: '' }));
                    }
                  }}
                    className={`w-full px-3.5 py-2.5 bg-background border ${validationErrors.intern ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-accent/20'} rounded-lg text-sm focus:outline-none focus:ring-2`}>
                    <option value="">Select Intern</option>
                    {interns.map(i => <option key={i.student.id} value={i.student.id}>{i.student.full_name}</option>)}
                  </select>
                  {validationErrors.intern && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.intern}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select value={newPriority} onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <input type="date" value={newDueDate} onChange={(e) => {
                    setNewDueDate(e.target.value);
                    if (validationErrors.dueDate) {
                      setValidationErrors(prev => ({ ...prev, dueDate: '' }));
                    }
                  }}
                    className={`w-full px-3.5 py-2.5 bg-background border ${validationErrors.dueDate ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-accent/20'} rounded-lg text-sm focus:outline-none focus:ring-2`} />
                  {validationErrors.dueDate && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.dueDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTaskId ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-lg">Review Task Submission</h2>
              <button onClick={() => setReviewingTask(null)} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-base">{reviewingTask.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{reviewingTask.description}</p>
              </div>

              <div className="bg-muted p-4 rounded-xl border border-border space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Student Submission Notes</span>
                  <span>{new Date(reviewingTask.submissions[0].submitted_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground">{reviewingTask.submissions[0].notes || 'No submission notes provided.'}</p>
              </div>

              {/* Scoring Mode Toggle */}
              <div className="flex items-center justify-between border-t border-b border-border py-3">
                <span className="text-sm font-medium">Use Scoring Rubric</span>
                <button
                  type="button"
                  onClick={() => setUseRubric(!useRubric)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    useRubric ? 'bg-accent' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useRubric ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {useRubric ? (
                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rubric Criteria</h4>
                  
                  {/* Code Quality */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Code Quality & Best Practices</span>
                      <span className="text-accent">{rubricCodeQuality} / 30</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={rubricCodeQuality}
                      onChange={(e) => setRubricCodeQuality(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  {/* UI/UX Design */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>UI/UX Design & Polish</span>
                      <span className="text-accent">{rubricDesign} / 30</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={rubricDesign}
                      onChange={(e) => setRubricDesign(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  {/* Functionality */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Functionality & Completion</span>
                      <span className="text-accent">{rubricFunctionality} / 40</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={rubricFunctionality}
                      onChange={(e) => setRubricFunctionality(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  {/* Rubric Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-border text-sm font-semibold">
                    <span>Total Rubric Grade</span>
                    <span className="text-emerald-500 text-base">{rubricCodeQuality + rubricDesign + rubricFunctionality}%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">Grade (0-100, Optional)</label>
                  <input type="number" min="0" max="100" value={reviewGrade} onChange={(e) => setReviewGrade(e.target.value)} placeholder="e.g. 95"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Feedback & Revision Guidance</label>
                <textarea rows={3} value={reviewFeedback} onChange={(e) => setReviewFeedback(e.target.value)} placeholder="Provide structured feedback or exact instructions for revision..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
                <button type="button" disabled={reviewing} onClick={() => handleReviewSubmission('Rejected')} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                  Reject
                </button>
                <button type="button" disabled={reviewing} onClick={() => handleReviewSubmission('Rejected')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors">
                  Request Revision
                </button>
                <button type="button" disabled={reviewing} onClick={() => handleReviewSubmission('Approved')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1">
                  Approve Task
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
