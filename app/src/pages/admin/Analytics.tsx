import { motion } from 'framer-motion';
import { Users, FileCheck, Award, ArrowUpRight, ArrowDownRight, Calendar, FolderOpen, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const userGrowthData = [
  { month: 'Aug', students: 8200, companies: 380, mentors: 150 },
  { month: 'Sep', students: 8800, companies: 410, mentors: 165 },
  { month: 'Oct', students: 9400, companies: 440, mentors: 175 },
  { month: 'Nov', students: 10200, companies: 470, mentors: 190 },
  { month: 'Dec', students: 11200, companies: 490, mentors: 200 },
  { month: 'Jan', students: 12500, companies: 520, mentors: 220 },
];

const appData = [
  { month: 'Aug', applications: 180 },
  { month: 'Sep', applications: 220 },
  { month: 'Oct', applications: 195 },
  { month: 'Nov', applications: 280 },
  { month: 'Dec', applications: 310 },
  { month: 'Jan', applications: 342 },
];

const domainData = [
  { name: 'Engineering', value: 40, color: '#3B82F6' },
  { name: 'Design', value: 25, color: '#8B5CF6' },
  { name: 'Data Science', value: 18, color: '#10B981' },
  { name: 'Marketing', value: 10, color: '#F59E0B' },
  { name: 'Business', value: 7, color: '#EF4444' },
];

const stats = [
  { label: 'Total Users', value: '13,240', change: '+12%', up: true, icon: Users },
  { label: 'Active Internships', value: '68', change: '+8%', up: true, icon: FolderOpen },
  { label: 'Applications', value: '1,525', change: '+15%', up: true, icon: FileCheck },
  { label: 'Certificates', value: '189', change: '+22%', up: true, icon: Award },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive platform insights</p>
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
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">User Growth</h3>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Applications by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={appData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Internship Domains</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {domainData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {domainData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span>{d.name}</span></div>
                <span className="text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Top Performing Internships</h3>
          <div className="space-y-4">
            {[
              { title: 'Software Engineering Intern', company: 'TechFlow Inc.', applicants: 45, rating: 4.8 },
              { title: 'Data Science Intern', company: 'DataMinds', applicants: 52, rating: 4.9 },
              { title: 'Product Management Intern', company: 'NexGen Finance', applicants: 41, rating: 4.6 },
              { title: 'DevOps Engineering Intern', company: 'CloudNine Systems', applicants: 34, rating: 4.7 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.applicants} apps</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{item.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
