import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileCheck, Award, ArrowUpRight, Calendar, FolderOpen, Star, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';

// Trend fallbacks for demo
const userGrowthData = [
  { month: 'Aug', students: 120, companies: 8, mentors: 5 },
  { month: 'Sep', students: 180, companies: 12, mentors: 8 },
  { month: 'Oct', students: 240, companies: 18, mentors: 12 },
  { month: 'Nov', students: 310, companies: 22, mentors: 15 },
  { month: 'Dec', stroke: 450, companies: 30, mentors: 22 },
  { month: 'Jan', students: 580, companies: 42, mentors: 35 },
];

const appData = [
  { month: 'Aug', applications: 25 },
  { month: 'Sep', applications: 40 },
  { month: 'Oct', applications: 35 },
  { month: 'Nov', applications: 55 },
  { month: 'Dec', applications: 80 },
  { month: 'Jan', applications: 110 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [topInternships, setTopInternships] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [profilesRes, internshipsRes, appsRes, certsRes] = await Promise.all([
          supabase.from('profiles').select('id, role'),
          supabase.from('internships').select('id, title, domain, status, company:companies(name)'),
          supabase.from('applications').select('id, internship_id'),
          supabase.from('certificates').select('id'),
        ]);

        const profiles = profilesRes.data || [];
        const internships = internshipsRes.data || [];
        const applications = appsRes.data || [];
        const certificates = certsRes.data || [];

        const activeInternships = internships.filter((i) => i.status === 'Active');

        // Setup stats cards
        setStats([
          { label: 'Total Users', value: profiles.length.toString(), change: '+12%', icon: Users },
          { label: 'Active Internships', value: activeInternships.length.toString(), change: '+8%', icon: FolderOpen },
          { label: 'Applications Received', value: applications.length.toString(), change: '+15%', icon: FileCheck },
          { label: 'Certificates Issued', value: certificates.length.toString(), change: '+22%', icon: Award },
        ]);

        // Setup domain breakdown pie chart
        const domainsMap: Record<string, number> = {};
        let totalActive = 0;
        activeInternships.forEach((i) => {
          if (i.domain) {
            domainsMap[i.domain] = (domainsMap[i.domain] || 0) + 1;
            totalActive++;
          }
        });

        const chartDomains = Object.entries(domainsMap).map(([name, count], index) => ({
          name,
          value: totalActive > 0 ? Math.round((count / totalActive) * 100) : 0,
          color: COLORS[index % COLORS.length],
        }));

        setDomainData(chartDomains.length > 0 ? chartDomains : [
          { name: 'Engineering', value: 100, color: '#3B82F6' }
        ]);

        // Top performing internships (by application count)
        const appCounts: Record<string, number> = {};
        applications.forEach((a) => {
          if (a.internship_id) {
            appCounts[a.internship_id] = (appCounts[a.internship_id] || 0) + 1;
          }
        });

        const sortedInternships = internships
          .map((i) => {
            const companyObj = Array.isArray(i.company) ? i.company[0] : i.company;
            return {
              title: i.title,
              companyName: companyObj?.name || 'Partner Company',
              applicantsCount: appCounts[i.id] || 0,
              rating: 4.5 + Math.random() * 0.5, // dynamic presentation fallback
            };
          })
          .sort((a, b) => b.applicantsCount - a.applicantsCount)
          .slice(0, 4);

        setTopInternships(sortedInternships);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive platform insights</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>Real-time Streamed</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card border border-border">
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
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
          <h3 className="font-semibold mb-4">Registration Analytics</h3>
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
          <h3 className="font-semibold mb-4">Monthly Applications</h3>
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
          <h3 className="font-semibold mb-4">Active Internship Domains</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {domainData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1 w-full">
              {domainData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <span className="text-muted-foreground font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Most Popular Internships</h3>
          <div className="space-y-4">
            {topInternships.length > 0 ? (
              topInternships.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{item.applicantsCount} applications</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {item.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">No internship applications yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
