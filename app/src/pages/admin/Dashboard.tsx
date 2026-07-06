import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FolderOpen, FileCheck, Award, Shield, Zap, TrendingUp, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminStats, activities } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = { Users, FolderOpen, FileCheck, Award, Shield, Zap };

const userGrowthData = [
  { month: 'Aug', students: 8200, companies: 380, mentors: 150 },
  { month: 'Sep', students: 8800, companies: 410, mentors: 165 },
  { month: 'Oct', students: 9400, companies: 440, mentors: 175 },
  { month: 'Nov', students: 10200, companies: 470, mentors: 190 },
  { month: 'Dec', students: 11200, companies: 490, mentors: 200 },
  { month: 'Jan', students: 12500, companies: 520, mentors: 220 },
];

const systemHealth = [
  { name: 'Database', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Authentication', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Storage', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Email Service', status: 'Degraded', icon: AlertCircle, color: 'text-amber-500' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and system status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {adminStats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="stat-card">
              <Icon className="w-5 h-5 text-accent mb-2" />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.change !== 0 && <span className={`text-[10px] font-medium ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>{stat.changeType === 'increase' ? '+' : ''}{stat.change}</span>}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">User Growth</h3>
              <Link to="/admin/analytics" className="text-sm text-accent hover:underline flex items-center gap-1">Details <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="companies" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="mentors" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Recent Activity</h3>
              <Link to="/admin/logs" className="text-sm text-accent hover:underline flex items-center gap-1">View Logs <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="divide-y divide-border">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <img src={activity.userAvatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-sm"><span className="font-medium">{activity.userName}</span> <span className="text-muted-foreground">{activity.action}</span> <span className="font-medium">{activity.target}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.timestamp).toLocaleDateString()} &middot; {activity.targetType}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* System Health */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              {systemHealth.map((service, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <service.icon className={`w-4 h-4 ${service.color}`} />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${service.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'}`}>{service.status}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Users', icon: Users, href: '/admin/users' },
                { label: 'Companies', icon: FolderOpen, href: '/admin/companies' },
                { label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
                { label: 'Settings', icon: Shield, href: '/admin/settings' },
              ].map((action, i) => (
                <Link key={i} to={action.href} className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl hover:bg-accent/10 transition-colors">
                  <action.icon className="w-5 h-5 text-accent" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
