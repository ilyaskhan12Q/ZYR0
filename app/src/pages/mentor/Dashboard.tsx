import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, CheckSquare, Star, ArrowRight, Clock, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import { mentorStats, tasks, conversations, evaluations } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = { Users, ClipboardList, CheckSquare, Star };

export default function MentorDashboard() {
  const pendingReviews = tasks.filter(t => t.status === 'Submitted');
  const recentEvals = evaluations.slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, Dr. Rodriguez!</h1>
        <p className="text-sm text-muted-foreground mt-1">You have {pendingReviews.length} tasks to review today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mentorStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${['bg-blue-100', 'bg-amber-100', 'bg-emerald-100', 'bg-purple-100'][i]}`}>
                  <Icon className={`w-5 h-5 ${['text-blue-600', 'text-amber-600', 'text-emerald-600', 'text-purple-600'][i]}`} />
                </div>
                {stat.change !== 0 && <span className={`text-xs font-medium ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>{stat.changeType === 'increase' ? '+' : ''}{stat.change}</span>}
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Reviews */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Pending Reviews</h3>
              <Link to="/mentor/tasks" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {pendingReviews.length > 0 ? pendingReviews.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.internshipTitle}</p>
                      <p className="text-xs text-muted-foreground">Submitted by {task.assignedToName} on {new Date(task.submissions[0]?.submittedDate || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90">Review</button>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">No pending reviews</div>
              )}
            </div>
          </motion.div>

          {/* My Interns */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">My Interns</h3>
              <Link to="/mentor/interns" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {[
                { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Software Engineering Intern', progress: 85, status: 'On Track' },
                { name: 'Emily Watson', avatar: 'https://i.pravatar.cc/150?u=emily', role: 'UI/UX Design Intern', progress: 72, status: 'On Track' },
                { name: 'James Park', avatar: 'https://i.pravatar.cc/150?u=james', role: 'Data Science Intern', progress: 90, status: 'Exceeding' },
              ].map((intern, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={intern.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{intern.name}</p>
                      <p className="text-xs text-muted-foreground">{intern.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${intern.progress}%` }} />
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${intern.status === 'Exceeding' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{intern.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Recent Evaluations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Recent Evaluations</h3>
            <div className="space-y-3">
              {recentEvals.map((evalItem) => (
                <div key={evalItem.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={evalItem.internAvatar} alt="" className="w-7 h-7 rounded-full" />
                    <span className="text-sm font-medium">{evalItem.internName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{evalItem.internshipTitle}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(evalItem.overallRating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{evalItem.overallRating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Start Evaluation', icon: CheckSquare, href: '/mentor/evaluations' },
                { label: 'Review Tasks', icon: ClipboardList, href: '/mentor/tasks' },
                { label: 'Messages', icon: MessageSquare, href: '/mentor/messages' },
              ].map((action, i) => (
                <Link key={i} to={action.href} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent/10 transition-colors">
                  <action.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
