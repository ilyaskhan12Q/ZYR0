import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { FileCheck, ClipboardList, Award, Briefcase, ArrowRight, Clock, MessageSquare, AlertCircle, CheckCircle2, Circle, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyApplications } from '@/services/applications';
import { getMyTasks } from '@/services/tasks';
import { getUnreadCount, getMyConversations } from '@/services/messages';
import { getMyCertificates } from '@/services/certificates';
import { getMyTeamApplications } from '@/services/teamApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';

const iconMap: Record<string, React.ElementType> = { FileCheck, ClipboardList, Award, Briefcase };

const stagger = (isMobile: boolean, delay: number) => ({ delay: isMobile ? 0 : delay });

export default function StudentDashboard() {
  const { user, profileCompleted, profileCompletionPercentage, profileCompletionRequirements } = useAuth();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [teamApplications, setTeamApplications] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [apps, myTasks, unread, convos, certs, teamApps] = await Promise.allSettled([
          getMyApplications(),
          getMyTasks(),
          getUnreadCount(),
          getMyConversations(),
          getMyCertificates(),
          getMyTeamApplications()
        ]);
        
        setApplications(apps.status === 'fulfilled' ? (apps.value?.data || []) : []);
        setTasks(myTasks.status === 'fulfilled' ? (myTasks.value?.data || []) : []);
        setUnreadMessages(unread.status === 'fulfilled' ? (unread.value || 0) : 0);
        setConversations(convos.status === 'fulfilled' ? (convos.value?.data || []) : []);
        setCertificates(certs.status === 'fulfilled' ? (certs.value?.data || []) : []);
        setTeamApplications(teamApps.status === 'fulfilled' ? (teamApps.value?.data || []) : []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  // Refresh data when browser tab regains focus
  const refreshOnFocus = useCallback(() => {
    async function refreshDashboard() {
      try {
        const [apps, myTasks, unread, convos, certs, teamApps] = await Promise.allSettled([
          getMyApplications(),
          getMyTasks(),
          getUnreadCount(),
          getMyConversations(),
          getMyCertificates(),
          getMyTeamApplications()
        ]);
        setApplications(apps.status === 'fulfilled' ? (apps.value?.data || []) : []);
        setTasks(myTasks.status === 'fulfilled' ? (myTasks.value?.data || []) : []);
        setUnreadMessages(unread.status === 'fulfilled' ? (unread.value || 0) : 0);
        setConversations(convos.status === 'fulfilled' ? (convos.value?.data || []) : []);
        setCertificates(certs.status === 'fulfilled' ? (certs.value?.data || []) : []);
        setTeamApplications(teamApps.status === 'fulfilled' ? (teamApps.value?.data || []) : []);
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    }
    refreshDashboard();
  }, []);
  useRefreshOnFocus(refreshOnFocus);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-8 h-4 rounded-full" />
              </div>
              <Skeleton className="h-7 w-12 mt-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeletons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applications Skeleton */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Skeleton */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2 py-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <div className="pl-8">
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Assigned');
  const recentApps = applications.slice(0, 4);
  const recentTasks = tasks.slice(0, 3);
  const approvedTasksCount = tasks.filter(t => t.status === 'Approved').length;
  const progressPercent = tasks.length > 0 ? Math.round((approvedTasksCount / tasks.length) * 100) : 0;

  const studentStats = [
    { label: 'Total Applications', value: applications.length, icon: 'FileCheck' },
    { label: 'Active Tasks', value: pendingTasks.length, icon: 'ClipboardList' },
    { label: 'Completed Tasks', value: approvedTasksCount, icon: 'Award' },
    { label: 'Certificates Earned', value: certificates.length, icon: 'Briefcase' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!</h1>
        <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </m.div>

      {/* Profile Completion Warning Banner */}
      {!profileCompleted && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Action Required: Complete Candidate Profile</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {profileCompletionPercentage}% Done
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Setup your profile once to enable instant 1-click applications for all company internships.
                </p>
              </div>
            </div>

            <Link
              to="/student/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shrink-0 shadow-md shadow-amber-600/20"
            >
              Complete Profile ({profileCompletionPercentage}%)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Missing items badges & progress bar */}
          <div className="pt-3 border-t border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Missing Profile Items:</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{profileCompletionRequirements.length} item(s) left</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${profileCompletionPercentage}%` }}
              />
            </div>
            {profileCompletionRequirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profileCompletionRequirements.map((req, i) => (
                  <span key={i} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    {req}
                  </span>
                ))}
              </div>
            )}
          </div>
        </m.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {studentStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Briefcase;
          return (
            <m.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, i * 0.08)}
              className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-blue-100 dark:bg-blue-950/30' : i === 1 ? 'bg-amber-100 dark:bg-amber-950/30' : i === 2 ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-purple-100 dark:bg-purple-950/30'}`}>
                  <Icon className={`w-5 h-5 ${i === 0 ? 'text-blue-600 dark:text-blue-400' : i === 1 ? 'text-amber-600 dark:text-amber-400' : i === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </m.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.2)}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Recent Applications</h3>
              <Link to="/student/applications" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentApps.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No recent applications found.</div>
              ) : recentApps.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={app.internship?.company?.logo_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium">{app.internship?.title}</p>
                      <p className="text-xs text-muted-foreground">{app.internship?.company?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                    app.status === 'Under Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                    app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400'
                  }`}>{app.status || 'Applied'}</span>
                </div>
              ))}
            </div>
          </m.div>

          {/* My Tasks */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.3)}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">My Tasks</h3>
              <Link to="/student/tasks" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentTasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No recent tasks.</div>
              ) : recentTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {task.status === 'Approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> :
                       task.status === 'Submitted' ? <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" /> :
                       <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.internship?.title}</p>
                      </div>
                    </div>
                    {task.priority && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                        task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>{task.priority}</span>
                    )}
                  </div>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-2 ml-8">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Task Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </m.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Join the Founding Team */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.25)}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-600/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Join the Founding Team</h3>
                <p className="text-xs text-blue-100/90">11 student-friendly roles, real product work</p>
              </div>
            </div>
            {teamApplications.length > 0 ? (
              <>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-blue-100/90">Application status</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold">
                    {teamApplications[0].status}
                  </span>
                </div>
                <Link
                  to="/student/team-applications"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                >
                  Track application
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-blue-100/90 leading-relaxed">
                  Build shipped products, get reviewed code, and earn verified recognition.
                </p>
                <Link
                  to="/careers/apply"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                >
                  Apply now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </m.div>

          {/* Quick Actions */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.3)}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse', href: '/student/internships', icon: FileCheck },
                { label: 'Profile', href: '/student/profile', icon: Briefcase },
                { label: 'Certificates', href: '/student/certificates', icon: Award },
                { label: 'Messages', href: '/student/messages', icon: MessageSquare, badge: unreadMessages },
              ].map((item, i) => (
                <Link key={i} to={item.href} className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg hover:bg-accent/10 transition-colors text-center relative">
                  <item.icon className="w-5 h-5 text-accent" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge ? <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{item.badge}</span> : null}
                </Link>
              ))}
            </div>
          </m.div>

          {/* Upcoming Deadlines */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.4)}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {pendingTasks.filter(t => t.due_date).slice(0, 3).length === 0 ? (
                 <div className="text-sm text-muted-foreground">No upcoming deadlines.</div>
              ) : pendingTasks.filter(t => t.due_date).slice(0, 3).map((task) => {
                const daysLeft = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.internship?.title}</p>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${daysLeft <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    </span>
                  </div>
                );
              })}
            </div>
          </m.div>

          {/* Recent Messages */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(isMobile, 0.5)}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent messages.</div>
              ) : conversations.slice(0, 2).map((conv) => {
                const otherParticipant = conv.participants.find((p: any) => p.user?.id !== user?.id)?.user;
                return (
                  <Link key={conv.id} to={`/student/messages/${conv.id}`} className="flex items-center gap-3 hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="relative">
                      <img src={otherParticipant?.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{otherParticipant?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message?.content || 'No messages yet'}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-accent text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">{conv.unread_count}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
