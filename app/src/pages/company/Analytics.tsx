import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, FileCheck, Award, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getInternships } from '@/services/internships';
import { getAllCompanyApplications } from '@/services/applications';
import { supabase } from '@/lib/supabase';

export default function CompanyAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { data: co } = await getMyCompany();
        if (!co) {
          setLoading(false);
          return;
        }

        const [internshipsRes, appsRes] = await Promise.all([
          getInternships({ company_id: co.id }),
          getAllCompanyApplications(co.id),
        ]);

        const myInternships = internshipsRes.data || [];
        const myApps = appsRes.data || [];
        const internshipIds = myInternships.map((i) => i.id);

        // Fetch tasks
        let myTasks: any[] = [];
        if (internshipIds.length > 0) {
          const { data } = await supabase
            .from('tasks')
            .select('*')
            .in('internship_id', internshipIds);
          myTasks = data || [];
        }

        // 1. Calculate Stats
        const totalApps = myApps.length;
        const acceptedApps = myApps.filter((a) => a.status === 'Accepted').length;
        const acceptanceRate = totalApps ? Math.round((acceptedApps / totalApps) * 100) : 0;
        const completedTasks = myTasks.filter((t) => t.status === 'Approved').length;
        const avgCompletion = myTasks.length ? Math.round((completedTasks / myTasks.length) * 100) : 0;
        const activeInterns = acceptedApps;

        const calculatedStats = [
          { label: 'Total Applications', value: totalApps.toString(), change: '+12%', up: true, icon: FileCheck },
          { label: 'Acceptance Rate', value: `${acceptanceRate}%`, change: '+3%', up: true, icon: TrendingUp },
          { label: 'Avg. Completion', value: `${avgCompletion}%`, change: '+5%', up: true, icon: Award },
          { label: 'Active Interns', value: activeInterns.toString(), change: '+2', up: true, icon: Users },
        ];
        setStats(calculatedStats);

        // 2. Applications Over Time (grouped by last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCounts: Record<string, { applications: number; accepted: number }> = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthName = months[d.getMonth()];
          monthlyCounts[monthName] = { applications: 0, accepted: 0 };
        }

        myApps.forEach((app) => {
          const appDate = new Date(app.applied_at);
          const monthName = months[appDate.getMonth()];
          if (monthlyCounts[monthName] !== undefined) {
            monthlyCounts[monthName].applications++;
            if (app.status === 'Accepted') {
              monthlyCounts[monthName].accepted++;
            }
          }
        });

        const overTimeData = Object.entries(monthlyCounts).map(([name, counts]) => ({
          name,
          applications: counts.applications,
          accepted: counts.accepted,
        }));
        
        const hasAppsData = overTimeData.some(d => d.applications > 0);
        setApplicationsData(hasAppsData ? overTimeData : [
          { name: 'Jan', applications: 0, accepted: 0 },
          { name: 'Feb', applications: 0, accepted: 0 },
          { name: 'Mar', applications: 0, accepted: 0 },
          { name: 'Apr', applications: 0, accepted: 0 },
          { name: 'May', applications: 0, accepted: 0 },
          { name: 'Jun', applications: 0, accepted: 0 },
        ]);

        // 3. Applications by Domain
        const domains: Record<string, number> = {};
        myApps.forEach((app) => {
          const internshipId = app.internship_id;
          const internship = myInternships.find((i) => i.id === internshipId);
          const domain = internship?.domain || 'General';
          domains[domain] = (domains[domain] || 0) + 1;
        });

        const totalDomainApps = Object.values(domains).reduce((a, b) => a + b, 0);
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
        const calculatedDomainData = Object.entries(domains).map(([name, count], index) => ({
          name,
          value: totalDomainApps ? Math.round((count / totalDomainApps) * 100) : 0,
          color: colors[index % colors.length],
        }));

        setDomainData(calculatedDomainData.length > 0 ? calculatedDomainData : [
          { name: 'No Data', value: 100, color: 'hsl(var(--muted))' }
        ]);

      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

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
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-accent" />
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
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
        <h3 className="font-semibold mb-4">Internship Performance (Applications)</h3>
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
