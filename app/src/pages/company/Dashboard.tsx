import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Users, GraduationCap, Award, ArrowRight, Plus, FileCheck, Clock, Star, MessageSquare } from 'lucide-react';
import { companyStats, applications, internships, activities } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = { FolderOpen, Users, GraduationCap, Award };

export default function CompanyDashboard() {
  const recentApps = applications.slice(0, 3);
  const activeInternships = internships.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, TechFlow Inc.!</h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your internships</p>
        </div>
        <div className="flex gap-2">
          <Link to="/company/internships/new" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
            <Plus className="w-4 h-4" /> Post Internship
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {companyStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || FolderOpen;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${['bg-blue-100', 'bg-emerald-100', 'bg-purple-100', 'bg-amber-100'][i]}`}>
                  <Icon className={`w-5 h-5 ${['text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-amber-600'][i]}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600">+{stat.change}</span>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applicants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Recent Applicants</h3>
              <Link to="/company/applicants" className="text-sm text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentApps.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={app.studentAvatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground">{app.internshipTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{app.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Internships */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Active Internships</h3>
              <Link to="/company/internships" className="text-sm text-accent hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {activeInternships.map((internship) => (
                <div key={internship.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{internship.title}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{internship.applicants} applicants</span>
                      <span>{internship.views} views</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{internship.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Intern Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Intern Performance</h3>
            <div className="space-y-4">
              {[
                { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', progress: 85, rating: 4.8 },
                { name: 'Emily Watson', avatar: 'https://i.pravatar.cc/150?u=emily', progress: 72, rating: 4.5 },
                { name: 'James Park', avatar: 'https://i.pravatar.cc/150?u=james', progress: 90, rating: 4.9 },
              ].map((intern, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <img src={intern.avatar} alt="" className="w-7 h-7 rounded-full" />
                      <span className="text-sm font-medium">{intern.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {intern.rating}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-9">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${intern.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <img src={activity.userAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-sm"><span className="font-medium">{activity.userName}</span> <span className="text-muted-foreground">{activity.action}</span> <span className="font-medium">{activity.target}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
