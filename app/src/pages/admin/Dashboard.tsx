import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Users,
  FolderOpen,
  FileCheck,
  Award,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Cpu,
  Sparkles,
  Clock,
  Wrench,
  Building2,
  Activity,
} from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const systemHealth = [
  { name: 'Database & RLS', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Authentication', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'AI Gateway Engine', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'Storage Vault', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
];

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [internshipsCount, setInternshipsCount] = useState(0);
  const [certsCount, setCertsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [pendingToolsCount, setPendingToolsCount] = useState(0);
  const [agentUsageRows, setAgentUsageRows] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buffers for batch updates
  const profileQueueRef = useRef<{ eventType: string; record: any }[]>([]);
  const companyQueueRef = useRef<{ eventType: string; record: any }[]>([]);
  const updateTimeoutRef = useRef<any>(null);

  const processQueues = () => {
    if (profileQueueRef.current.length > 0) {
      const queue = [...profileQueueRef.current];
      profileQueueRef.current = [];

      setProfiles((prev) => {
        let updated = [...prev];
        queue.forEach(({ eventType, record }) => {
          if (eventType === 'INSERT') {
            if (!updated.some((p) => p.id === record.id)) {
              updated.push(record);
            }
          } else if (eventType === 'UPDATE') {
            updated = updated.map((p) => (p.id === record.id ? record : p));
          } else if (eventType === 'DELETE') {
            updated = updated.filter((p) => p.id !== record.id);
          }
        });
        return updated;
      });
    }

    if (companyQueueRef.current.length > 0) {
      const queue = [...companyQueueRef.current];
      companyQueueRef.current = [];

      setCompanies((prev) => {
        let updated = [...prev];
        queue.forEach(({ eventType, record }) => {
          if (eventType === 'INSERT') {
            if (!updated.some((c) => c.id === record.id)) {
              updated.push(record);
            }
          } else if (eventType === 'UPDATE') {
            updated = updated.map((c) => (c.id === record.id ? record : c));
          } else if (eventType === 'DELETE') {
            updated = updated.filter((c) => c.id !== record.id);
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
    let cancelled = false;
    let profileChannel: any;
    let companyChannel: any;

    async function loadAdminStats() {
      try {
        const settled = await Promise.race([
          Promise.allSettled([
            supabase.from('profiles').select('id, role, plan_tier, status, created_at'),
            supabase.from('companies').select('id, status, created_at'),
            supabase.from('internships').select('id', { count: 'exact' }),
            supabase.from('certificates').select('id', { count: 'exact' }),
            supabase.from('applications').select('id', { count: 'exact' }),
            supabase.from('agent_usage').select('input_tokens, output_tokens, model, latency_ms').limit(500),
            supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Admin dashboard timeout')), 10000)
          ),
        ]);

        if (cancelled) return;

        const [
          profilesRes,
          companiesRes,
          internshipsRes,
          certsRes,
          appsRes,
          usageRes,
          pendingToolsRes,
        ] = settled;

        const fetchedProfiles = profilesRes.status === 'fulfilled' ? profilesRes.value.data || [] : [];
        const fetchedCompanies = companiesRes.status === 'fulfilled' ? companiesRes.value.data || [] : [];

        setProfiles(fetchedProfiles);
        setCompanies(fetchedCompanies);
        setInternshipsCount(internshipsRes.status === 'fulfilled' ? internshipsRes.value.count || 0 : 0);
        setCertsCount(certsRes.status === 'fulfilled' ? certsRes.value.count || 0 : 0);
        setAppsCount(appsRes.status === 'fulfilled' ? appsRes.value.count || 0 : 0);
        setAgentUsageRows(usageRes.status === 'fulfilled' ? usageRes.value.data || [] : []);
        setPendingToolsCount(pendingToolsRes.status === 'fulfilled' ? pendingToolsRes.value.count || 0 : 0);

        // Fetch recent activity / audit logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select(`
            id, action, details, reason, created_at,
            user:profiles!user_id (full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (logs) setActivities(logs);

        // Realtime sync
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
        if (!cancelled) setLoading(false);
      }
    }
    loadAdminStats();

    return () => {
      cancelled = true;
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (companyChannel) supabase.removeChannel(companyChannel);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  // Compute Subscription & Revenue Telemetry
  const planBreakdown = useMemo(() => {
    const free = profiles.filter((p) => !p.plan_tier || p.plan_tier === 'free').length;
    const go = profiles.filter((p) => p.plan_tier === 'go').length;
    const plus = profiles.filter((p) => p.plan_tier === 'plus').length;
    const enterprise = profiles.filter((p) => p.plan_tier === 'enterprise').length;
    const total = profiles.length || 1;
    const paid = go + plus + enterprise;
    const mrr = go * 4.99 + plus * 9.99;
    const conversion = Math.round((paid / total) * 1000) / 10;
    return { free, go, plus, enterprise, paid, mrr, conversion, total: profiles.length };
  }, [profiles]);

  // Compute AI Compute & Gateway Telemetry
  const aiTelemetry = useMemo(() => {
    let totalInput = 0;
    let totalOutput = 0;
    let totalLatency = 0;
    const modelFreq: Record<string, number> = {};

    agentUsageRows.forEach((row) => {
      totalInput += row.input_tokens || 0;
      totalOutput += row.output_tokens || 0;
      totalLatency += row.latency_ms || 0;
      if (row.model) {
        modelFreq[row.model] = (modelFreq[row.model] || 0) + 1;
      }
    });

    const topModel =
      Object.entries(modelFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Zen / Gemini';
    const totalTokens = totalInput + totalOutput;
    const avgLatency = agentUsageRows.length > 0 ? Math.round(totalLatency / agentUsageRows.length) : 0;

    return {
      requests: agentUsageRows.length,
      totalTokens,
      avgLatency,
      topModel,
    };
  }, [agentUsageRows]);

  const pendingCompanies = useMemo(
    () => companies.filter((c) => c.status === 'pending').length,
    [companies]
  );

  const stats = useMemo(() => {
    const studentsCount = profiles.filter((p) => p.role === 'student').length;
    const mentorsCount = profiles.filter((p) => p.role === 'mentor').length;

    return [
      { label: 'Students', value: studentsCount.toString(), icon: Users },
      { label: 'Mentors', value: mentorsCount.toString(), icon: Shield },
      { label: 'Companies', value: companies.length.toString(), icon: FolderOpen },
      { label: 'Internships', value: internshipsCount.toString(), icon: Zap },
      {
        label: 'Est. MRR',
        value: `$${planBreakdown.mrr.toFixed(2)}`,
        icon: CreditCard,
        color: 'text-amber-500',
      },
      {
        label: 'AI Tokens',
        value: `${(aiTelemetry.totalTokens / 1000).toFixed(1)}k`,
        icon: Cpu,
        color: 'text-cyan-500',
      },
    ];
  }, [profiles, companies, internshipsCount, planBreakdown, aiTelemetry]);

  const userGrowthData = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      result.push({
        month: monthName,
        endDateTime: lastDay.getTime(),
        students: 0,
        companies: 0,
        mentors: 0,
      });
    }

    result.forEach((item) => {
      item.students = profiles.filter(
        (p) => p.role === 'student' && new Date(p.created_at).getTime() <= item.endDateTime
      ).length;
      item.mentors = profiles.filter(
        (p) => p.role === 'mentor' && new Date(p.created_at).getTime() <= item.endDateTime
      ).length;
      item.companies = companies.filter(
        (c) => new Date(c.created_at).getTime() <= item.endDateTime
      ).length;
    });

    return result;
  }, [profiles, companies]);

  if (loading) {
    return <Loader variant="page" text="Loading admin control center..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ecosystem telemetry, subscriptions, compute metrics, and platform health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Deep Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((stat, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`w-4 h-4 ${stat.color || 'text-accent'}`} />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </m.div>
        ))}
      </div>

      {/* Monetization & AI Compute Telemetry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subscription & Monetization Card */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Subscription & Plan Health</h3>
                <p className="text-xs text-muted-foreground">Monetization breakdown across user base</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {planBreakdown.conversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Free</p>
              <p className="text-lg font-bold mt-0.5">{planBreakdown.free}</p>
              <p className="text-[10px] text-muted-foreground">Standard</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/25 text-center">
              <p className="text-[10px] uppercase font-semibold text-cyan-600 dark:text-cyan-400">GO</p>
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {planBreakdown.go}
              </p>
              <p className="text-[10px] text-muted-foreground">$4.99/mo</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/25 text-center">
              <p className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> PLUS
              </p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {planBreakdown.plus}
              </p>
              <p className="text-[10px] text-muted-foreground">$9.99/mo</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25 text-center">
              <p className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                Custom
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {planBreakdown.enterprise}
              </p>
              <p className="text-[10px] text-muted-foreground">Org/School</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Total Paid Accounts: <strong className="text-foreground">{planBreakdown.paid}</strong>
            </span>
            <span className="text-muted-foreground">
              Estimated Run-Rate: <strong className="text-accent">${(planBreakdown.mrr * 12).toFixed(2)}/yr</strong>
            </span>
          </div>
        </m.div>

        {/* AI Research & Compute Telemetry Card */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Research & Compute Meter</h3>
                <p className="text-xs text-muted-foreground">Gateway invocation volumes & token burn</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Live Gateway
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Invocations</p>
              <p className="text-lg font-bold mt-0.5">{aiTelemetry.requests}</p>
              <p className="text-[10px] text-muted-foreground">Queries</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Tokens</p>
              <p className="text-lg font-bold mt-0.5">
                {(aiTelemetry.totalTokens / 1000).toFixed(1)}k
              </p>
              <p className="text-[10px] text-muted-foreground">In + Out</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Avg Latency</p>
              <p className="text-lg font-bold mt-0.5">{aiTelemetry.avgLatency}ms</p>
              <p className="text-[10px] text-muted-foreground">Round-trip</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Top Model</p>
              <p className="text-xs font-bold truncate mt-1.5" title={aiTelemetry.topModel}>
                {aiTelemetry.topModel.replace('gemini-', '').replace('llama-', '')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Primary engine</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Rate Limit: 20 req/min/user</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" /> Compute healthy
            </span>
          </div>
        </m.div>
      </div>

      {/* Main Grid: Trends & Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border shadow-xs p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">User Registration Growth</h3>
                <p className="text-xs text-muted-foreground">Cumulative signups over the last 6 months</p>
              </div>
              <Link
                to="/admin/analytics"
                className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
              >
                Analytics Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="companies" stroke="#10B981" fill="#10B981" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="mentors" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </m.div>

          {/* Recent Activity / Audit Feed */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-semibold text-sm">Live Platform & Governance Feed</h3>
                <p className="text-xs text-muted-foreground">Recent actions, approvals, and credential events</p>
              </div>
              <Link
                to="/admin/logs"
                className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
              >
                Full Audit Logs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                    <img
                      src={
                        activity.user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user?.full_name || 'System')}`
                      }
                      alt=""
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-semibold">{activity.user?.full_name || 'System / Admin'}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      {activity.details && (
                        <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                          {activity.details}
                        </p>
                      )}
                      {activity.reason && (
                        <p className="text-[11px] text-accent/90 italic mt-0.5">
                          Note: {activity.reason}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No recent activities recorded in the audit ledger.
                </div>
              )}
            </div>
          </m.div>
        </div>

        {/* Right Sidebar: Moderation Backlogs & Health */}
        <div className="space-y-6">
          {/* Operational Moderation Queues */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-4"
          >
            <h3 className="font-semibold text-sm">Moderation Queues</h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/companies"
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">Pending Companies</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    pendingCompanies > 0
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {pendingCompanies}
                </span>
              </Link>

              <Link
                to="/admin/tools"
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-medium">ToolHub Submissions</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    pendingToolsCount > 0
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {pendingToolsCount}
                </span>
              </Link>

              <Link
                to="/admin/applications"
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium">Total Applications</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {appsCount}
                </span>
              </Link>
            </div>
          </m.div>

          {/* System Health */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl border border-border shadow-xs p-5"
          >
            <h3 className="font-semibold text-sm mb-3.5">Infrastructure Status</h3>
            <div className="space-y-2.5">
              {systemHealth.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-2">
                    <service.icon className={`w-3.5 h-3.5 ${service.color}`} />
                    <span className="text-xs">{service.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </m.div>

          {/* Quick Shortcuts */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border shadow-xs p-5"
          >
            <h3 className="font-semibold text-sm mb-3">Governance Portals</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Users & Plans', icon: Users, href: '/admin/users' },
                { label: 'Partners', icon: FolderOpen, href: '/admin/companies' },
                { label: 'Audit Logs', icon: Shield, href: '/admin/logs' },
                { label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.href}
                  className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl hover:bg-accent/10 transition-colors border border-border text-center"
                >
                  <action.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
