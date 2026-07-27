import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Award,
  Github,
  ExternalLink,
  Paperclip,
  FileText,
  Loader2,
  Sparkles,
  Calendar,
  User,
  Copy,
  Check,
  Send,
  MessageSquare,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { updateTask, reviewSubmission } from '@/services/tasks';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

interface TaskReviewDrawerProps {
  task: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_FEEDBACKS = [
  '🌟 Exceptional work! Met all criteria with clean execution.',
  '⚠️ Good effort overall, but minor revisions are requested.',
  '🐞 Bugs or unhandled edge cases found during testing.',
  '🎨 UI/UX needs refinement to match project design guidelines.',
  '📝 Please add additional documentation or code comments.',
];

export function TaskReviewDrawer({ task, onClose, onSuccess }: TaskReviewDrawerProps) {
  const [reviewing, setReviewing] = useState(false);
  const [useRubric, setUseRubric] = useState(true);
  const [rubricCodeQuality, setRubricCodeQuality] = useState(30);
  const [rubricDesign, setRubricDesign] = useState(30);
  const [rubricFunctionality, setRubricFunctionality] = useState(40);
  const [customGrade, setCustomGrade] = useState('100');
  const [feedback, setFeedback] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const submission = task?.submissions?.[0];

  useEffect(() => {
    if (task && submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        setCustomGrade(String(submission.grade));
      } else {
        setCustomGrade('100');
      }
      setFeedback(submission.feedback || '');
      setRubricCodeQuality(30);
      setRubricDesign(30);
      setRubricFunctionality(40);
    }
  }, [task, submission]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && task) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, onClose]);

  if (!task || !submission) return null;

  const calculatedGrade = useRubric
    ? rubricCodeQuality + rubricDesign + rubricFunctionality
    : customGrade
    ? parseInt(customGrade, 10)
    : 100;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handlePresetSelect = (preset: string) => {
    if (feedback.includes(preset)) return;
    setFeedback((prev) => (prev ? `${prev}\n\n${preset}` : preset));
  };

  const handleReviewAction = async (status: 'Approved' | 'Rejected') => {
    setReviewing(true);
    try {
      let finalFeedback = feedback.trim();
      if (useRubric) {
        const rubricBreakdown = `[Rubric Scores — Code Quality: ${rubricCodeQuality}/30, UI/UX: ${rubricDesign}/30, Functionality: ${rubricFunctionality}/40]`;
        finalFeedback = finalFeedback
          ? `${rubricBreakdown}\n\nFeedback: ${finalFeedback}`
          : rubricBreakdown;
      }

      const { error: reviewErr } = await reviewSubmission(submission.id, {
        status,
        feedback: finalFeedback || undefined,
        grade: calculatedGrade,
      });

      if (!reviewErr) {
        await updateTask(task.id, {
          status,
          feedback: finalFeedback || undefined,
          grade: calculatedGrade,
        });

        // Trigger simulation notification
        try {
          await dispatchNotificationWithSimulation({
            userId: task.assigned_to,
            title: `Task ${status === 'Approved' ? 'Approved' : 'Revision Requested'}`,
            message: `Your submission for "${task.title}" has been reviewed. Final Grade: ${calculatedGrade}%.`,
            type: 'task',
            actionUrl: '/student/workspace',
            studentEmail: task.assignee?.email,
          });
        } catch (notifErr) {
          console.error('Notification simulation failed:', notifErr);
        }

        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  const formattedSubmittedAt = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Unknown time';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col justify-end lg:justify-center overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Task Review Workspace"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border w-full h-[95vh] lg:h-[90vh] max-w-7xl mx-auto rounded-t-3xl lg:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Workspace Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-base">
                {task.assignee?.full_name ? task.assignee.full_name.charAt(0) : 'I'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-foreground line-clamp-1">{task.title}</h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
                      task.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : task.status === 'Submitted'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}
                  >
                    {task.status === 'Submitted' ? 'Submitted — Needs Review' : task.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span>Submitted by <strong>{task.assignee?.full_name || 'Intern'}</strong></span>
                  <span>•</span>
                  <span>Project: <strong>{task.internship?.title || 'Internship'}</strong></span>
                  <span>•</span>
                  <span>{formattedSubmittedAt}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 bg-muted border border-border rounded-md text-muted-foreground">
                Esc to exit
              </kbd>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
                title="Close Review Workspace"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workspace Body: Split Pane */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-muted/20">
            {/* Left Pane (Deliverables & Prompt Context) */}
            <div className="lg:col-span-7 p-6 overflow-y-auto border-r border-border space-y-6">
              {/* Task Requirements & Prompt */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-accent">
                    <FileText className="w-4 h-4" /> Task Specification & Guidelines
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due:{' '}
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Student Submission Notes */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <MessageSquare className="w-4 h-4" /> Intern Notes & Work Summary
                  </span>
                  <span className="text-[11px] text-muted-foreground">{formattedSubmittedAt}</span>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/80 text-sm text-foreground leading-relaxed">
                  {submission.notes ? (
                    submission.notes
                  ) : (
                    <span className="text-muted-foreground italic">No additional notes provided by intern.</span>
                  )}
                </div>
              </div>

              {/* Submitted Deliverables Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent" /> Submitted Code & Live Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* GitHub Repo Card */}
                  {submission.github_url ? (
                    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 hover:border-accent/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Github className="w-4 h-4 text-accent" /> GitHub Repository
                          </span>
                          <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                            Source Code
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-2">
                          {submission.github_url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 bg-accent text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Launch Repo
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(submission.github_url)}
                          className="p-2 border border-border rounded-xl text-xs hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Copy Repository URL"
                        >
                          {copiedLink === submission.github_url ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border/60 p-4 rounded-2xl opacity-60 text-xs text-muted-foreground flex items-center gap-2">
                      <Github className="w-4 h-4" /> No GitHub URL provided
                    </div>
                  )}

                  {/* Live Demo Card */}
                  {submission.live_demo_url ? (
                    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <ExternalLink className="w-4 h-4 text-emerald-500" /> Live Demo URL
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                            Interactive App
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-2">
                          {submission.live_demo_url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <a
                          href={submission.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Launch Live Demo
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(submission.live_demo_url)}
                          className="p-2 border border-border rounded-xl text-xs hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Copy Demo URL"
                        >
                          {copiedLink === submission.live_demo_url ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border/60 p-4 rounded-2xl opacity-60 text-xs text-muted-foreground flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> No Live Demo URL provided
                    </div>
                  )}
                </div>

                {/* File Attachments */}
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-accent" /> File Attachments ({submission.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {submission.attachments.map((file: any, idx: number) => (
                        <a
                          key={idx}
                          href={file.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-muted/50 border border-border hover:border-accent rounded-xl text-xs font-medium flex items-center justify-between transition-all group"
                        >
                          <span className="truncate text-foreground group-hover:text-accent">
                            {file.name || `Attachment #${idx + 1}`}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane (Evaluation, Rubric & Decision Action) */}
            <div className="lg:col-span-5 p-6 overflow-y-auto space-y-5 bg-card flex flex-col justify-between">
              <div className="space-y-5">
                {/* Scoring Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-emerald-500" /> Evaluation & Grading
                    </h3>
                    <p className="text-xs text-muted-foreground">Rate submission quality and deliver feedback</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Use Rubric</span>
                    <button
                      type="button"
                      onClick={() => setUseRubric(!useRubric)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                </div>

                {/* Rubric Sliders vs Direct Score */}
                {useRubric ? (
                  <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Rubric Criteria</span>
                      <span className="text-emerald-500 font-bold text-sm">{calculatedGrade}% Total Score</span>
                    </div>

                    {/* Criteria 1: Code Quality */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">Code Quality & Architecture</span>
                        <span className="text-accent font-bold">{rubricCodeQuality} / 30 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={rubricCodeQuality}
                        onChange={(e) => setRubricCodeQuality(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Criteria 2: UI/UX Design */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">UI/UX Polish & Responsiveness</span>
                        <span className="text-accent font-bold">{rubricDesign} / 30 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={rubricDesign}
                        onChange={(e) => setRubricDesign(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Criteria 3: Functionality */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">Functionality & Requirement Coverage</span>
                        <span className="text-accent font-bold">{rubricFunctionality} / 40 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={rubricFunctionality}
                        onChange={(e) => setRubricFunctionality(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Progress Bar Meter */}
                    <div className="pt-2 border-t border-border/80">
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            calculatedGrade >= 80
                              ? 'bg-emerald-500'
                              : calculatedGrade >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${calculatedGrade}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Overall Grade Percentage (0–100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customGrade}
                      onChange={(e) => setCustomGrade(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                )}

                {/* Quick Feedback Presets */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Quick Feedback Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FEEDBACKS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-muted hover:bg-accent/10 hover:text-accent border border-border transition-colors text-left"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Feedback Textarea */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Reviewer Guidance & Comments
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, instructions for revisions, or praise for outstanding implementation..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Bottom Decision Bar */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction('Rejected')}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Request Revision
                </button>

                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction('Approved')}
                  className="w-full sm:w-auto flex-2 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {reviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Task ({calculatedGrade}%)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
