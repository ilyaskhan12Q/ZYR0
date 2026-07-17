import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FolderOpen, FileCheck, Award, Shield, Zap, TrendingUp, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const systemHealth = [
  { name: 'Database', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Authentication', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Storage', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Email Service', status: 'Degraded', icon: AlertCircle, color: 'text-amber-500' },
];

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [internshipsCount, setInternshipsCount] = useState(0);
  const [certsCount, setCertsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buffers for batch updates
  const profileQueueRef = useRef<{ eventType: string; record: any }[]>([]);
  const companyQueueRef = useRef<{ eventType: string; record: any }[]>([]);
  const updateTimeoutRef = useRef<any>(null);

  const processQueues = () => {
    // Process profile updates in one batch
    if (profileQueueRef.current.length > 0) {
      const queue = [...profileQueueRef.current];
      profileQueueRef.current = [];

      setProfiles(prev => {
        let updated = [...prev];
        queue.forEach(({ eventType, record }) => {
          if (eventType === 'INSERT') {
            if (!updated.some(p => p.id === record.id)) {
              updated.push(record);
            }
          } else if (eventType === 'UPDATE') {
            updated = updated.map(p => p.id === record.id ? record : p);
          } else if (eventType === 'DELETE') {
            updated = updated.filter(p => p.id !== record.id);
          }
        });
        return updated;
      });
    }

    // Process company updates in one batch
    if (companyQueueRef.current.length > 0) {
      const queue = [...companyQueueRef.current];
      companyQueueRef.current = [];

      setCompanies(prev => {
        let updated = [...prev];
        queue.forEach(({ eventType, record }) => {
          if (eventType === 'INSERT') {
            if (!updated.some(c => c.id === record.id)) {
              updated.push(record);
            }
          } else if (eventType === 'UPDATE') {
            updated = updated.map(c => c.id === record.id ? record : c);
          } else if (eventType === 'DELETE') {
            updated = updated.filter(c => c.id !== record.id);
          }
        });
        return updated;
      });
    }
  };

  const queueProfileUpdate = (eventType: string, record: any) => {
    profileQueueRef.current.push({ eventType, record });
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(processQueues, 50);
  };

  const queueCompanyUpdate = (eventType: string, record: any) => {
    companyQueueRef.current.push({ eventType, record });
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(processQueues, 50);
  };

  useEffect(() => {
    let profileChannel: any;
    let companyChannel: any;

    async function loadAdminStats() {
      try {
        const [profilesRes, companiesRes, internshipsRes, certsRes, appsRes] = await Promise.all([
          supabase.from('profiles').select('id, role, created_at'),
          supabase.from('companies').select('id, created_at'),
          supabase.from('internships').select('id', { count: 'exact' }),
          supabase.from('certificates').select('id', { count: 'exact' }),
          supabase.from('applications').select('id', { count: 'exact' }),
        ]);

        const fetchedProfiles = profilesRes.data || [];
        const fetchedCompanies = companiesRes.data || [];

        setProfiles(fetchedProfiles);
        setCompanies(fetchedCompanies);
        setInternshipsCount(internshipsRes.count || 0);
        setCertsCount(certsRes.count || 0);
        setAppsCount(appsRes.count || 0);

        // Fetch recent activity logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select(`
            id, action, details, created_at,
            user:profiles!user_id (full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (logs) setActivities(logs);

        // Set up realtime subscriptions after initial fetch
        profileChannel = supabase
          .channel('realtime-profiles')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;
              if (eventType === 'INSERT') {
                queueProfileUpdate('INSERT', newRecord);
              } else if (eventType === 'UPDATE') {
                queueProfileUpdate('UPDATE', newRecord);
              } else if (eventType === 'DELETE') {
                queueProfileUpdate('DELETE', oldRecord);
              }
            }
          )
          .subscribe();

        companyChannel = supabase
          .channel('realtime-companies')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'companies' },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;
              if (eventType === 'INSERT') {
                queueCompanyUpdate('INSERT', newRecord);
              } else if (eventType === 'UPDATE') {
                queueCompanyUpdate('UPDATE', newRecord);
              } else if (eventType === 'DELETE') {
                queueCompanyUpdate('DELETE', oldRecord);
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();

    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (companyChannel) supabase.removeChannel(companyChannel);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  const stats = useMemo(() => {
    const studentsCount = profiles.filter((p) => p.role === 'student').length;
    const mentorsCount = profiles.filter((p) => p.role === 'mentor').length;

    return [
      { label: 'Students', value: studentsCount.toString(), icon: Users },
      { label: 'Mentors', value: mentorsCount.toString(), icon: Shield },
      { label: 'Companies', value: companies.length.toString(), icon: FolderOpen },
      { label: 'Internships', value: internshipsCount.toString(), icon: Zap },
      { label: 'Applications', value: appsCount.toString(), icon: FileCheck },
      { label: 'Certificates', value: certsCount.toString(), icon: Award },
    ];
  }, [profiles, companies, internshipsCount, appsCount, certsCount]);

  const userGrowthData = useMemo(() => {
    const result = [];
    const now = new Date();

    // Create the last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      result.push({
        month: monthName,
        endDateTime: lastDay.getTime(),
        students: 0,
        companies: 0,
        mentors: 0
      });
    }

    // Populate each month with cumulative counts
    result.forEach(item => {
      item.students = profiles.filter(
        p => p.role === 'student' && new Date(p.created_at).getTime() <= item.endDateTime
      ).length;
      item.mentors = profiles.filter(
        p => p.role === 'mentor' && new Date(p.created_at).getTime() <= item.endDateTime
      ).length;
      item.companies = companies.filter(
        c => new Date(c.created_at).getTime() <= item.endDateTime
      ).length;
    });

    return result;
  }, [profiles, companies]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and system status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="stat-card border border-border">
            <stat.icon className="w-5 h-5 text-accent mb-2" />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">User Registration Trends</h3>
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
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <img src={activity.user?.avatar_url || `https://ui-avatars.com/api/?name=${activity.user?.full_name || 'System'}`} alt="" className="w-9 h-9 rounded-full flex-shrink-0 object-cover" />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user?.full_name || 'System'}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.details}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">No recent system activities logged</div>
              )}
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
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <service.icon className={`w-4 h-4 ${service.color}`} />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${service.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'}`}>{service.status}</span>
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
                <Link key={i} to={action.href} className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl hover:bg-accent/10 transition-colors border border-border">
                  <action.icon className="w-5 h-5 text-accent" />
                  <span className="text-xs font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
