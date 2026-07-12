import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Building2, Calendar, MapPin, ClipboardList, CheckCircle2,
  Clock, AlertTriangle, AlertCircle, FileCheck, ExternalLink, ShieldCheck,
  Github, LayoutGrid, ChevronRight, Lock, BookOpen, Clock3, Award, MessageSquare, Loader2, ArrowRight
} from 'lucide-react';
import { getMyActiveInternships } from '@/services/internships';
import { getMyTasks, submitTask } from '@/services/tasks';
import { getMyCertificates } from '@/services/certificates';
import { getWorkspaceEvents, clearWorkspaceEventsCache } from '@/services/workspaceEvents';
import { useRealtimeInsert } from '@/hooks/useRealtime';
import { clearCache } from '@/lib/cache';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

type WorkspaceTab = 'overview' | 'tasks' | 'submissions' | 'certificate';

export default function StudentWorkspace() {
  const { internshipId } = useParams<{ internshipId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading and placements states
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState<any[]>([]);
  const [activePlacement, setActivePlacement] = useState<any | null>(null);

  // Workspace-specific states
  const [tasks, setTasks] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // Task detail and submission states
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load placement information, tasks and certificates
  const loadWorkspaceData = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    setLoading(true);
    try {
      if (forceRefresh) {
        clearCache(`my_tasks_${user.id}`);
      }

      // 1. Fetch all active accepted offer placements
      const { data: activePlacements, error: placementsErr } = await getMyActiveInternships();
      if (placementsErr) throw placementsErr;

      const placementList = activePlacements || [];
      setPlacements(placementList);

      if (placementList.length === 0) {
        setActivePlacement(null);
        setLoading(false);
        return;
      }

      // 2. Select the placement (from URL param or default to the first active placement)
      let selected = placementList[0];
      if (internshipId) {
        const found = placementList.find(p => (p.internship as any)?.id === internshipId);
        if (found) {
          selected = found;
        } else {
          // Redirect to root workspace or correct ID if path is invalid
          navigate(`/student/workspace/${(selected.internship as any)?.id}`, { replace: true });
          return;
        }
      } else {
        // Redirection to the specific path
        navigate(`/student/workspace/${(selected.internship as any)?.id}`, { replace: true });
        return;
      }

      setActivePlacement(selected);

      // 3. Fetch tasks and filter in memory by this placement's internship_id
      const { data: allTasks, error: tasksErr } = await getMyTasks(!forceRefresh);
      if (tasksErr) throw tasksErr;

      const filteredTasks = (allTasks || []).filter(
        (t: any) => t.internship_id === (selected.internship as any)?.id
      );
      setTasks(filteredTasks);

      // 4. Fetch certificates to check if this placement's certificate is issued
      const { data: certs } = await getMyCertificates();
      setCertificates(certs || []);

      // 5. Fetch workspace events
      const internshipIdVal = (selected.internship as any)?.id;
      if (internshipIdVal) {
        if (forceRefresh) {
          clearWorkspaceEventsCache(internshipIdVal, user.id);
        }
        const { data: eventsList, error: eventsErr } = await getWorkspaceEvents(
          internshipIdVal,
          user.id,
          !forceRefresh
        );
        if (eventsErr) throw eventsErr;
        setEvents(eventsList || []);
      }

    } catch (err: any) {
      console.error('Error loading workspace data:', err);
      toast.error('Failed to load workspace files. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user, internshipId, navigate]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Subscribe to real-time updates for timeline events
  const activeInternshipId = (activePlacement?.internship as any)?.id;
  const realtimeFilter = activeInternshipId
    ? `internship_id=eq.${activeInternshipId}`
    : 'internship_id=eq.00000000-0000-0000-0000-000000000000';

  useRealtimeInsert<any>(
    'workspace_events',
    realtimeFilter,
    async () => {
      await loadWorkspaceData(true);
    },
    [activeInternshipId, loadWorkspaceData]
  );

  // Handle task submission
  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTask) return;

    const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/;
    if (!githubRegex.test(githubUrl.trim())) {
      toast.error('Invalid GitHub URL. Must be in the format: https://github.com/username/repository');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await submitTask({
        task_id: selectedTask.id,
        notes: notes.trim() || undefined,
        github_url: githubUrl.trim(),
        live_demo_url: demoUrl.trim() || undefined,
      });

      if (error) throw error;

      toast.success('Task submitted successfully for review!');
      setGithubUrl('');
      setDemoUrl('');
      setNotes('');

      // Trigger simulation notification to mentor/company supervisor
      const recipientId = selectedTask.mentor_id || selectedTask.company_id;
      if (recipientId) {
        try {
          await dispatchNotificationWithSimulation({
            userId: recipientId,
            title: 'New Task Submission',
            message: `${user?.user_metadata?.full_name || 'An intern'} has submitted a task: "${selectedTask.title}".`,
            type: 'task',
            actionUrl: `/mentor/tasks`,
          });
        } catch (notifErr) {
          console.error('Failed to trigger submission notification simulation:', notifErr);
        }
      }

      // Reload to reflect new submission status
      await loadWorkspaceData();

      // Refresh the selected task state with updated submission data
      const updatedTasks = await getMyTasks();
      const match = (updatedTasks.data || []).find((t: any) => t.id === selectedTask.id);
      if (match) setSelectedTask(match);

    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate project metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Approved').length;
  const inProgressTasks = tasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Rejected').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Check if a certificate is issued for this specific internship
  const activeCertificate = activePlacement
    ? certificates.find((c: any) => c.internship_id === (activePlacement.internship as any)?.id)
    : null;

  const isEligibleForCertificate = totalTasks > 0 && completedTasks === totalTasks;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Panel Skeleton */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 border border-border/60 rounded-xl p-4 md:w-80 w-full">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex border border-border bg-card rounded-xl p-1 gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 md:w-36 rounded-lg" />
          ))}
        </div>

        {/* Tab Body content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render onboarding/empty state if student has no accepted offers
  if (!activePlacement) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Your Internship Workspace</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              This is the workspace where you manage tasks, track timelines, submit GitHub links, receive mentor grading, and download your final certified credentials.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-muted/50 rounded-xl p-5 border border-border text-left text-sm space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent" /> How to unlock your Workspace:
            </h3>
            <ul className="space-y-2.5 text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">1.</span> Apply to open internships matching your skill sets.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">2.</span> Receive and review offer letters issued by companies.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">3.</span> Accept an offer letter to instantiate your custom workspace.
              </li>
            </ul>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/student/internships"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm"
            >
              Browse Open Positions <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student/offer-letters"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-lg font-medium transition-colors"
            >
              View Offer Letters
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const internship = activePlacement.internship as any;
  const company = internship?.company;

  return (
    <div className="space-y-6">
      {/* Workspace Header Panel */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{internship?.title}</h1>
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-accent/15 text-accent font-medium uppercase tracking-wider">
                Active Placement
              </span>
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
              <span className="font-semibold text-foreground">{company?.name}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {internship?.location} ({internship?.location_type})</span>
            </p>
          </div>
        </div>

        {/* Progress gauge summary */}
        <div className="flex items-center gap-4 bg-muted/30 border border-border/60 rounded-xl p-4 md:w-80">
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Internship Progress</span>
              <span className="text-accent">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{completedTasks} of {totalTasks} Tasks Approved</span>
              <span>{isEligibleForCertificate ? 'Eligible' : 'In Progress'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-border bg-card/45 backdrop-blur-md rounded-xl p-1 border border-border shadow-sm overflow-x-auto gap-1">
        {(['overview', 'tasks', 'submissions', 'certificate'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<WorkspaceTab, string> = {
            overview: 'Overview',
            tasks: 'Tasks & Submission',
            submissions: 'Submissions History',
            certificate: 'Completion Certificate',
          };
          const icons: Record<WorkspaceTab, React.ElementType> = {
            overview: LayoutGrid,
            tasks: ClipboardList,
            submissions: Clock3,
            certificate: Award,
          };
          const Icon = icons[tab];

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // Reset selected task if changing tab
                if (tab !== 'tasks') setSelectedTask(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/15'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{labels[tab]}</span>
              {tab === 'tasks' && totalTasks > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-accent' : 'bg-muted-foreground/15 text-muted-foreground'
                }`}>
                  {pendingTasks}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel contents */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Main Overview content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Internship Description Card */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-accent" /> Role & Details
                    </h2>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {internship?.description || 'No internship description provided.'}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Domain</span>
                        <span className="font-semibold text-sm">{internship?.domain}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Job Type</span>
                        <span className="font-semibold text-sm">{internship?.type}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Duration</span>
                        <span className="font-semibold text-sm">{internship?.duration}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Start Date</span>
                        <span className="font-semibold text-sm">
                          {internship?.start_date ? new Date(internship.start_date).toLocaleDateString() : 'Immediate'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones / Timeline Section */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent" /> Placement Timeline
                    </h2>
                    <div className="relative pl-6 border-l border-border space-y-6">
                      {events.length === 0 ? (
                        <div className="relative">
                          <div className="absolute -left-[33px] top-0.5 w-5 h-5 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center text-white">
                            <Briefcase className="w-2.5 h-2.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Internship Initiated</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Offer Letter accepted on {activePlacement.accepted_at ? new Date(activePlacement.accepted_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        events.map((event) => {
                          let iconColor = 'bg-muted-foreground';
                          let Icon = ClipboardList;
                          
                          switch (event.event_type) {
                            case 'offer_accepted':
                              iconColor = 'bg-emerald-500';
                              Icon = Briefcase;
                              break;
                            case 'task_assigned':
                              iconColor = 'bg-blue-500';
                              Icon = ClipboardList;
                              break;
                            case 'task_submitted':
                              iconColor = 'bg-amber-500';
                              Icon = Clock;
                              break;
                            case 'task_approved':
                              iconColor = 'bg-emerald-500';
                              Icon = CheckCircle2;
                              break;
                            case 'task_rejected':
                              iconColor = 'bg-red-500';
                              Icon = AlertTriangle;
                              break;
                            case 'certificate_issued':
                              iconColor = 'bg-purple-500 animate-pulse';
                              Icon = Award;
                              break;
                          }

                          return (
                            <div key={event.id} className="relative group">
                              <div className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full border-4 border-card flex items-center justify-center text-white shadow-sm transition-all duration-200 group-hover:scale-110 ${iconColor}`}>
                                <Icon className="w-2.5 h-2.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                  <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-150">{event.title}</h4>
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {new Date(event.created_at).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {event.description}
                                  </p>
                                )}
                                
                                {/* Event-specific metadata details */}
                                {event.event_type === 'task_assigned' && event.metadata && (
                                  <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                                    {event.metadata.priority && (
                                      <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                                        Priority: {event.metadata.priority}
                                      </span>
                                    )}
                                    {event.metadata.due_date && (
                                      <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                                        Due: {new Date(event.metadata.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {event.event_type === 'task_submitted' && event.metadata && (
                                  <div className="mt-1 space-y-1">
                                    {event.metadata.github_url && (
                                      <a
                                        href={event.metadata.github_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[10px] text-accent hover:underline bg-accent/5 px-2 py-0.5 rounded-full"
                                      >
                                        <Github className="w-3 h-3" /> View Code Submission
                                      </a>
                                    )}
                                  </div>
                                )}

                                {event.event_type === 'task_approved' && event.metadata && (
                                  <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                                    {event.metadata.grade && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                        Grade: {event.metadata.grade}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {event.event_type === 'certificate_issued' && (
                                  <button
                                    onClick={() => setActiveTab('certificate')}
                                    className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline mt-1 bg-accent/5 px-2 py-0.5 rounded-full"
                                  >
                                    View Certificate <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Widget contents */}
                <div className="space-y-6">
                  {/* Task counts widget */}
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-md text-foreground">Task Summary</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <span className="text-2xl font-extrabold text-foreground">{pendingTasks}</span>
                        <span className="text-[10px] text-muted-foreground block font-medium mt-1">Pending</span>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <span className="text-2xl font-extrabold text-amber-600">{inProgressTasks}</span>
                        <span className="text-[10px] text-muted-foreground block font-medium mt-1">Submitted</span>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <span className="text-2xl font-extrabold text-emerald-600">{completedTasks}</span>
                        <span className="text-[10px] text-muted-foreground block font-medium mt-1">Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Mentor details widget */}
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-md text-foreground">Support & Mentor</h3>
                    <p className="text-xs text-muted-foreground">
                      If you have questions regarding tasks, timeline schedules, or submissions, message your assigned company coordinators.
                    </p>
                    <div className="flex gap-3">
                      <Link
                        to="/student/messages"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Message Coordinator
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TASKS PANEL */}
            {activeTab === 'tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tasks List */}
                <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-4 shadow-sm h-[600px] overflow-y-auto space-y-3">
                  <div className="pb-3 border-b border-border mb-2">
                    <h3 className="font-bold text-foreground">Assigned Tasks</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Select a task row to review or submit credentials</p>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No tasks assigned for this placement.
                    </div>
                  ) : (
                    tasks.map((t) => {
                      const isSelected = selectedTask?.id === t.id;
                      const statusColors: Record<string, string> = {
                        Pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400',
                        Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                        'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                        Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
                        Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                      };

                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTask(t);
                            // Clear form values
                            setGithubUrl('');
                            setDemoUrl('');
                            setNotes('');
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-accent bg-accent/5 shadow-sm'
                              : 'border-border hover:bg-muted/40 hover:border-border/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-sm line-clamp-1">{t.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              statusColors[t.status]
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {t.description || 'No description provided.'}
                          </p>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" /> {t.estimated_duration || 'Flex'}</span>
                            <span className="font-semibold">{t.difficulty || 'Beginner'}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Right: Selected Task Details & Form */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedTask ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6"
                    >
                      {/* Task Info row */}
                      <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-border">
                        <div>
                          <h2 className="text-lg font-bold">{selectedTask.title}</h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${
                              selectedTask.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                              selectedTask.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                            }`}>
                              Priority: {selectedTask.priority}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Due: {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Flexible'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground block">Difficulty: {selectedTask.difficulty || 'Beginner'}</span>
                          <span className="text-xs text-muted-foreground block">Estimated duration: {selectedTask.estimated_duration || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Task Description */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedTask.description || 'No detailed instructions provided.'}
                        </p>
                      </div>

                      {/* Objectives & Criteria */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Objectives */}
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2.5">
                          <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-accent" /> Objectives
                          </h4>
                          {selectedTask.objectives && selectedTask.objectives.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                              {selectedTask.objectives.map((obj: string, index: number) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-accent">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No specific objectives defined.</p>
                          )}
                        </div>

                        {/* Acceptance Criteria */}
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2.5">
                          <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-accent" /> Acceptance Criteria
                          </h4>
                          {selectedTask.acceptance_criteria && selectedTask.acceptance_criteria.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                              {selectedTask.acceptance_criteria.map((crt: string, index: number) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-accent">•</span>
                                  <span>{crt}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No specific acceptance criteria defined.</p>
                          )}
                        </div>
                      </div>

                      {/* Task Submissions Form or Review Status */}
                      <div className="border-t border-border pt-6">
                        {selectedTask.status === 'Approved' ? (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-5 h-5" />
                              <h4 className="font-bold text-sm">Task Approved & Completed!</h4>
                            </div>
                            {selectedTask.grade && (
                              <p className="text-sm font-semibold text-foreground">
                                Grade Awarded: <span className="text-emerald-600 font-bold">{selectedTask.grade}%</span>
                              </p>
                            )}
                            {selectedTask.feedback && (
                              <div className="text-xs text-muted-foreground italic bg-card/65 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/10">
                                &ldquo;{selectedTask.feedback}&rdquo;
                              </div>
                            )}
                          </div>
                        ) : selectedTask.status === 'Submitted' || selectedTask.status === 'Under Review' ? (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                              <Clock className="w-5 h-5" />
                              <h4 className="font-bold text-sm">Awaiting Mentor Review</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your solution has been submitted. The program coordinator will review your GitHub repository and grade your work.
                            </p>

                            {selectedTask.submissions?.[0] && (
                              <div className="pt-2 text-xs space-y-1.5">
                                <p className="font-medium">Submitted Links:</p>
                                <a
                                  href={selectedTask.submissions[0].github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-accent hover:underline"
                                >
                                  <Github className="w-3.5 h-3.5" /> Repository Link <ExternalLink className="w-3 h-3" />
                                </a>
                                {selectedTask.submissions[0].live_demo_url && (
                                  <a
                                    href={selectedTask.submissions[0].live_demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-accent hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo Link <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Form submission
                          <form onSubmit={handleSubmitTask} className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-sm flex items-center gap-1.5">
                                <Github className="w-4 h-4" /> Submit Task Solution
                              </h4>
                              {selectedTask.status === 'Rejected' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Requesting Resubmission
                                </span>
                              )}
                            </div>

                            {selectedTask.status === 'Rejected' && selectedTask.feedback && (
                              <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 text-red-700 dark:text-red-400 text-xs p-3.5 rounded-lg italic">
                                <strong>Mentor Feedback:</strong> &ldquo;{selectedTask.feedback}&rdquo;
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label htmlFor="submission-github-url" className="text-xs font-semibold text-muted-foreground block">
                                  GitHub Repository URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                  id="submission-github-url"
                                  type="url"
                                  required
                                  value={githubUrl}
                                  onChange={(e) => setGithubUrl(e.target.value)}
                                  placeholder="https://github.com/username/project"
                                  className="w-full text-sm px-3.5 py-2.5 bg-background border border-border rounded-lg input-focus focus-visible-ring"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label htmlFor="submission-demo-url" className="text-xs font-semibold text-muted-foreground block">
                                  Live Demo URL <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <input
                                  id="submission-demo-url"
                                  type="url"
                                  value={demoUrl}
                                  onChange={(e) => setDemoUrl(e.target.value)}
                                  placeholder="https://project.vercel.app"
                                  className="w-full text-sm px-3.5 py-2.5 bg-background border border-border rounded-lg input-focus focus-visible-ring"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="submission-notes" className="text-xs font-semibold text-muted-foreground block">
                                Submission Notes <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                              </label>
                              <textarea
                                id="submission-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Explain implementation details, challenges, or assumptions..."
                                className="w-full text-sm p-3 bg-background border border-border rounded-lg input-focus resize-none focus-visible-ring"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-sm font-medium transition-colors shadow-sm focus-visible-ring"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Submitting...
                                </>
                              ) : (
                                'Submit Solution'
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm text-center text-muted-foreground min-h-[300px] flex flex-col justify-center items-center gap-3">
                      <ClipboardList className="w-12 h-12 text-muted-foreground/45" />
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">No Task Selected</p>
                        <p className="text-xs max-w-xs mx-auto">Select an assigned task from the left list to review criteria details and submit your work.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBMISSIONS HISTORY PANEL */}
            {activeTab === 'submissions' && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Submissions Log</h2>
                  <p className="text-xs text-muted-foreground">Historical records of your uploaded solutions and coordinator evaluations</p>
                </div>

                {tasks.filter(t => t.submissions && t.submissions.length > 0).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                    You have not submitted any task solutions yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4">Task Name</th>
                          <th className="py-3 px-4">Submitted Date</th>
                          <th className="py-3 px-4">GitHub Repository</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tasks
                          .filter(t => t.submissions && t.submissions.length > 0)
                          .map((t) => {
                            const sub = t.submissions[0];
                            const badgeColors: Record<string, string> = {
                              Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                              'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                              Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
                              Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                            };

                            return (
                              <tr key={t.id} className="table-row-hover">
                                <td className="py-4 px-4 font-semibold text-foreground">
                                  <div>
                                    <span>{t.title}</span>
                                    {sub.notes && (
                                      <span className="block text-[11px] text-muted-foreground font-normal italic mt-0.5 line-clamp-1">
                                        Note: &ldquo;{sub.notes}&rdquo;
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-muted-foreground">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                  <a
                                    href={sub.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-accent hover:underline text-xs"
                                  >
                                    <Github className="w-3.5 h-3.5" /> repo <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    badgeColors[sub.status] || 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-foreground">
                                  {sub.grade ? (
                                    <span className="text-emerald-600">{sub.grade}%</span>
                                  ) : (
                                    <span className="text-muted-foreground font-medium">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CERTIFICATE PANEL */}
            {activeTab === 'certificate' && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Verification & Credential</h2>
                  <p className="text-xs text-muted-foreground">View and verify your official credentials issued by Zyro and partners</p>
                </div>

                {activeCertificate ? (
                  // Renders real certificate mockup
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border-8 border-double border-accent/25 rounded-2xl p-8 shadow-lg text-center relative overflow-hidden"
                  >
                    {/* Background seal watermarks */}
                    <div className="absolute right-4 bottom-4 w-40 h-40 bg-accent/5 rounded-full border-4 border-dashed border-accent/10 flex items-center justify-center -rotate-12 pointer-events-none">
                      <ShieldCheck className="w-20 h-20 text-accent/10" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <div className="text-left">
                          <h4 className="text-xl font-bold tracking-tight text-accent italic">ZYRO</h4>
                          <span className="text-[10px] text-muted-foreground block uppercase tracking-widest mt-0.5">Global Placements Network</span>
                        </div>
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border overflow-hidden">
                          {company?.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold block">
                          Certificate of Completion
                        </span>
                        <p className="text-sm italic text-muted-foreground">This is to officially certify that</p>
                        <h2 className="text-2xl font-bold text-foreground font-serif tracking-wide py-2">
                          {user?.email?.split('@')[0].toUpperCase() || 'STUDENT INTERN'}
                        </h2>
                        <p className="text-sm max-w-md mx-auto text-muted-foreground leading-relaxed">
                          has successfully completed the <strong>{internship?.title}</strong> program. The participant demonstrated outstanding professionalism, completed all assigned code tasks, and achieved full grading criteria under the supervision of <strong>{company?.name}</strong>.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 text-xs text-muted-foreground max-w-sm mx-auto">
                        <div>
                          <span className="block font-semibold text-foreground">
                            {new Date(activeCertificate.issue_date).toLocaleDateString()}
                          </span>
                          <span className="text-[10px]">Date of Issuance</span>
                        </div>
                        <div>
                          <span className="block font-mono text-foreground font-semibold">
                            {activeCertificate.credential_id}
                          </span>
                          <span className="text-[10px]">Credential Identifier</span>
                        </div>
                      </div>

                      {/* Digital Signatures */}
                      <div className="grid grid-cols-2 gap-8 pt-8 pb-4 max-w-lg mx-auto border-t border-border">
                        <div className="flex flex-col items-center">
                          <div className="h-10 flex items-center justify-center relative select-none">
                            <svg className="w-28 h-10 text-accent/70 absolute -top-2" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M10 25 C 20 5, 40 35, 50 15 C 60 5, 70 30, 85 20 C 90 15, 95 10, 99 22" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M30 22 L 75 22" strokeLinecap="round" />
                            </svg>
                            <span className="font-serif italic text-sm text-foreground/80 mt-4">{company?.name || 'Supervisor'}</span>
                          </div>
                          <div className="w-32 border-t border-border mt-2 pt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            Company Director
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="h-10 flex items-center justify-center relative select-none">
                            <svg className="w-28 h-10 text-accent/70 absolute -top-2" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 20 Q 20 5, 35 25 T 60 15 T 80 20 T 95 10" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M15 15 C 25 25, 45 5, 55 25" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-serif italic text-sm text-foreground/80 mt-4">Zyro Verifier</span>
                          </div>
                          <div className="w-32 border-t border-border mt-2 pt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            Program Director
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap justify-center gap-4">
                        <Link
                          to={`/verify/${activeCertificate.credential_id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" /> Verify Credential Verification <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Lock screen
                  <div className="max-w-md mx-auto text-center py-12 px-6 bg-muted/30 border border-border rounded-2xl space-y-5">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                      <Lock className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-md text-foreground">Certificate Locked</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Your completion certificate will be automatically generated and verified once all assigned tasks are approved by your program mentor.
                      </p>
                    </div>

                    <div className="progress-bar max-w-xs mx-auto">
                      <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Current Task Progress: {completedTasks} / {totalTasks} Tasks Approved
                    </p>

                    {isEligibleForCertificate && (
                      <div className="bg-amber-100/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-lg p-3 text-[11px] text-amber-800 dark:text-amber-400 text-left flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                          All tasks have been approved! The coordinator is in the process of generating your official credentials.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
