import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ThumbsUp, ThumbsDown, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksAssignedByMe, reviewSubmission, updateTask } from '@/services/tasks';

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
    const feedback = feedbacks[taskId] || '';
    const grade = grades[taskId] || 100;

    setSubmitting((prev) => ({ ...prev, [taskId]: true }));

    try {
      // 1. Update the submission status, feedback, and grade
      await reviewSubmission(submissionId, {
        status,
        feedback,
        grade,
      });

      // 2. Update the parent task status, feedback, and grade
      await updateTask(taskId, {
        status: status === 'Approved' ? 'Approved' : 'Rejected',
        feedback,
        grade,
      });

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
                  <div className="space-y-4">
                    <textarea
                      placeholder="Provide constructive feedback..."
                      rows={3}
                      value={feedbacks[task.id] || ''}
                      onChange={(e) => setFeedbacks((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
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
                      <div className="flex items-end gap-2">
                        <button
                          onClick={() => submission && handleReview(task.id, submission.id, 'Approved')}
                          disabled={submitting[task.id] || !submission}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          {submitting[task.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />} Approve
                        </button>
                        <button
                          onClick={() => submission && handleReview(task.id, submission.id, 'Rejected')}
                          disabled={submitting[task.id] || !submission}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {submitting[task.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />} Reject
                        </button>
                      </div>
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
