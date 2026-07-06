import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCheck, ClipboardList, Award, Briefcase, ArrowRight, Clock, MessageSquare, AlertCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyApplications } from '@/services/applications';
import { getMyTasks } from '@/services/tasks';
import { getUnreadCount, getMyConversations } from '@/services/messages';

const iconMap: Record<string, React.ElementType> = { FileCheck, ClipboardList, Award, Briefcase };

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [apps, myTasks, unread, convos] = await Promise.all([
          getMyApplications(),
          getMyTasks(),
          getUnreadCount(),
          getMyConversations()
        ]);
        
        setApplications(apps?.data || []);
        setTasks(myTasks?.data || []);
        setUnreadMessages(unread || 0);
        setConversations(convos?.data || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Assigned');
  const recentApps = applications.slice(0, 4);
  const recentTasks = tasks.slice(0, 3);
  const approvedTasksCount = tasks.filter(t => t.status === 'Approved').length;
  const progressPercent = tasks.length > 0 ? Math.round((approvedTasksCount / tasks.length) * 100) : 0;

  const studentStats = [
    { label: 'Total Applications', value: applications.length, icon: 'FileCheck', change: 0, changeType: 'increase' },
    { label: 'Active Tasks', value: pendingTasks.length, icon: 'ClipboardList', change: 0, changeType: 'increase' },
    { label: 'Completed Tasks', value: approvedTasksCount, icon: 'Award', change: 0, changeType: 'increase' },
    { label: 'Profile Views', value: 0, icon: 'Briefcase', change: 0, changeType: 'increase' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!</h1>
        <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {studentStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Briefcase;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-blue-100' : i === 1 ? 'bg-amber-100' : i === 2 ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                  <Icon className={`w-5 h-5 ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-amber-600' : i === 2 ? 'text-emerald-600' : 'text-purple-600'}`} />
                </div>
                {stat.change !== 0 && (
                  <span className={`text-xs font-medium ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.changeType === 'increase' ? '+' : ''}{stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
                    <img src={app.internships?.companies?.logo_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium">{app.internships?.title}</p>
                      <p className="text-xs text-muted-foreground">{app.internships?.companies?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                    app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{app.status || 'Applied'}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* My Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
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
                        <p className="text-xs text-muted-foreground">{task.internships?.title}</p>
                      </div>
                    </div>
                    {task.priority && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
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
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
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
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {pendingTasks.filter(t => t.due_date).slice(0, 3).length === 0 ? (
                 <div className="text-sm text-muted-foreground">No upcoming deadlines.</div>
              ) : pendingTasks.filter(t => t.due_date).slice(0, 3).map((task) => {
                const daysLeft = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.internships?.title}</p>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${daysLeft <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Messages */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent messages.</div>
              ) : conversations.slice(0, 2).map((conv) => {
                const otherParticipant = conv.participants.find((p: any) => p.profile_id !== user?.id)?.profiles;
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
