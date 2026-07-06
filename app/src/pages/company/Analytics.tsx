import { motion } from 'framer-motion';
import { TrendingUp, Users, FileCheck, Award, BarChart3, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const applicationsData = [
  { name: 'Jan', applications: 45, accepted: 12 },
  { name: 'Feb', applications: 62, accepted: 18 },
  { name: 'Mar', applications: 38, accepted: 10 },
  { name: 'Apr', applications: 78, accepted: 22 },
  { name: 'May', applications: 55, accepted: 15 },
  { name: 'Jun', applications: 92, accepted: 28 },
];

const domainData = [
  { name: 'Engineering', value: 35, color: '#3B82F6' },
  { name: 'Design', value: 25, color: '#8B5CF6' },
  { name: 'Data Science', value: 20, color: '#10B981' },
  { name: 'Marketing', value: 12, color: '#F59E0B' },
  { name: 'Business', value: 8, color: '#EF4444' },
];

const stats = [
  { label: 'Total Applications', value: '370', change: '+12%', up: true, icon: FileCheck },
  { label: 'Acceptance Rate', value: '28%', change: '+3%', up: true, icon: TrendingUp },
  { label: 'Avg. Completion', value: '87%', change: '+5%', up: true, icon: Award },
  { label: 'Active Interns', value: '24', change: '-2', up: false, icon: Users },
];

export default function CompanyAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance insights for your internship program</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>Last 6 months</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-accent" />
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={applicationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="applications" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="accepted" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Applications by Domain</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {domainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {domainData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold mb-4">Internship Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={applicationsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
