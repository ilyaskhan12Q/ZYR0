import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ThumbsUp, ThumbsDown, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksAssignedByMe, reviewSubmission, updateTask } from '@/services/tasks';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

const tabs = ['To Review', 'Reviewed'];

export default function MentorTasks() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('To Review');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states per submission/task
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [useRubrics, setUseRubrics] = useState<Record<string, boolean>>({});
  const [rubricsCodeQuality, setRubricsCodeQuality] = useState<Record<string, number>>({});
  const [rubricsDesign, setRubricsDesign] = useState<Record<string, number>>({});
  const [rubricsFunctionality, setRubricsFunctionality] = useState<Record<string, number>>({});

  async function loadTasks() {
    try {
      const res = await getTasksAssignedByMe();
      if (res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error loading mentor tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile) {
      loadTasks();
    }
  }, [profile]);

  const handleReview = async (taskId: string, submissionId: string, status: 'Approved' | 'Rejected') => {
    const rawFeedback = feedbacks[taskId] || '';
    const isRubric = useRubrics[taskId] ?? true;
    const codeQuality = rubricsCodeQuality[taskId] ?? 30;
    const design = rubricsDesign[taskId] ?? 30;
    const functionality = rubricsFunctionality[taskId] ?? 40;
    const grade = isRubric 
      ? (codeQuality + design + functionality)
      : (grades[taskId] ?? 100);

    let finalFeedback = rawFeedback.trim();
    if (isRubric) {
      const rubricBreakdown = `[Rubric Breakdown - Code Quality: ${codeQuality}/30, Design: ${design}/30, Functionality: ${functionality}/40]`;
      finalFeedback = finalFeedback ? `${rubricBreakdown}\nFeedback: ${finalFeedback}` : rubricBreakdown;
    }

    setSubmitting((prev) => ({ ...prev, [taskId]: true }));

    try {
      // 1. Update the submission status, feedback, and grade
      await reviewSubmission(submissionId, {
        status,
        feedback: finalFeedback || undefined,
        grade,
      });

      // 2. Update the parent task status, feedback, and grade
      await updateTask(taskId, {
        status,
        feedback: finalFeedback || undefined,
        grade,
      });

      // Trigger simulation notification
      const targetTask = tasks.find((t) => t.id === taskId);
      if (targetTask) {
        try {
          await dispatchNotificationWithSimulation({
            userId: targetTask.student_id,
            title: `Task ${status === 'Approved' ? 'Approved' : 'Revision Requested'}`,
            message: `Your submission for "${targetTask.title}" has been reviewed. Grade: ${grade}%.`,
            type: 'task',
            actionUrl: '/student/workspace',
            studentEmail: targetTask.assignee?.email,
          });
        } catch (notifErr) {
          console.error('Failed to trigger mentor review notification simulation:', notifErr);
        }
      }

      // Clear states
      setFeedbacks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setGrades((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setUseRubrics((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setRubricsCodeQuality((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setRubricsDesign((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setRubricsFunctionality((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });

      // Refresh task list
      await loadTasks();
    } catch (err) {
      console.error('Error reviewing submission:', err);
      alert('Failed to submit review');
    } finally {
      setSubmitting((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const toReview = tasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review');
  const reviewed = tasks.filter(t => t.status === 'Approved' || t.status === 'Rejected');
  const filtered = activeTab === 'To Review' ? toReview : reviewed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks to Review</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and provide feedback on intern submissions</p>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit border border-border">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab} <span className="text-xs text-muted-foreground">({(tab === 'To Review' ? toReview : reviewed).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center bg-card rounded-xl border border-border">No tasks found in this section.</p>
        ) : (
          filtered.map((task, i) => {
            const submission = task.submissions?.[0];
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.internship?.title || 'Internship'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{task.priority}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <img src={task.assignee?.avatar_url || `https://ui-avatars.com/api/?name=${task.assignee?.full_name || 'Intern'}`} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-sm">{task.assignee?.full_name || 'Student'}</span>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                      <Calendar className="w-3 h-3" /> Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{task.description}</p>

                {submission && (
                  <div className="bg-muted rounded-lg p-4 mb-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Submission Details</p>
                      <span className="text-xs text-muted-foreground">{new Date(submission.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{submission.notes || 'No notes provided.'}</p>
                  </div>
                )}

                {activeTab === 'To Review' ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Rubric toggle */}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Use Scoring Rubric</span>
                      <button
                        type="button"
                        onClick={() => setUseRubrics(prev => ({ ...prev, [task.id]: !(useRubrics[task.id] ?? true) }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          (useRubrics[task.id] ?? true) ? 'bg-accent' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            (useRubrics[task.id] ?? true) ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {(useRubrics[task.id] ?? true) ? (
                      <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border">
                        {/* Code Quality Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Code Quality & Best Practices</span>
                            <span className="text-accent">{rubricsCodeQuality[task.id] ?? 30} / 30</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={rubricsCodeQuality[task.id] ?? 30}
                            onChange={(e) => setRubricsCodeQuality(prev => ({ ...prev, [task.id]: parseInt(e.target.value, 10) }))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>

                        {/* UI/UX Design Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>UI/UX Design & Polish</span>
                            <span className="text-accent">{rubricsDesign[task.id] ?? 30} / 30</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={rubricsDesign[task.id] ?? 30}
                            onChange={(e) => setRubricsDesign(prev => ({ ...prev, [task.id]: parseInt(e.target.value, 10) }))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Functionality Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Functionality & Completion</span>
                            <span className="text-accent">{rubricsFunctionality[task.id] ?? 40} / 40</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            value={rubricsFunctionality[task.id] ?? 40}
                            onChange={(e) => setRubricsFunctionality(prev => ({ ...prev, [task.id]: parseInt(e.target.value, 10) }))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Total rubric score */}
                        <div className="flex justify-between items-center pt-2 border-t border-border text-xs font-bold text-foreground">
                          <span>Computed Grade</span>
                          <span className="text-emerald-500 text-sm">
                            {(rubricsCodeQuality[task.id] ?? 30) + (rubricsDesign[task.id] ?? 30) + (rubricsFunctionality[task.id] ?? 40)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Grade (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade"
                          value={grades[task.id] ?? ''}
                          onChange={(e) => setGrades((prev) => ({ ...prev, [task.id]: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                        />
                      </div>
                    )}

                    <textarea
                      placeholder="Provide constructive feedback and revision guidance..."
                      rows={3}
                      value={feedbacks[task.id] || ''}
                      onChange={(e) => setFeedbacks((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => submission && handleReview(task.id, submission.id, 'Rejected')}
                        disabled={submitting[task.id] || !submission}
                        className="px-3.5 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => submission && handleReview(task.id, submission.id, 'Rejected')}
                        disabled={submitting[task.id] || !submission}
                        className="px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => submission && handleReview(task.id, submission.id, 'Approved')}
                        disabled={submitting[task.id] || !submission}
                        className="px-3.5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {submitting[task.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Approve Task
                      </button>
                    </div>
                  </div>
                ) : (
                  (task.feedback || submission?.feedback) && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Reviewed</span>
                        {(task.grade ?? submission?.grade) !== null && (
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">Grade: {task.grade ?? submission?.grade}%</span>
                        )}
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 italic">&ldquo;{task.feedback || submission?.feedback}&rdquo;</p>
                    </div>
                  )
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
