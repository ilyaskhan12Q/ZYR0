import { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Users } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase';

const nf = new Intl.NumberFormat('en-US');
const money = (n: number) => `$${nf.format(Math.round(n))}`;
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : nf.format(n));
const shortDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12,
};

/** A panel: section title over a hairline rule, mono meta on the right. */
function Panel({ title, meta, action, className = '', children }: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="text-[13px] font-medium">{title}</h2>
        {action ?? (meta && <span className="font-mono text-[11px] text-muted-foreground">{meta}</span>)}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

/** Thin neutral bar; the accent is left for the figures that matter. */
function Meter({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-foreground/25" style={{ width: `${width}%` }} />
    </div>
  );
}

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
            // select('*'): an optional column missing in prod (e.g. plan_tier) would fail
            // the whole query and silently zero out every user stat on this page.
            supabase.from('profiles').select('*'),
            supabase.from('companies').select('id, status, created_at'),
            supabase.from('internships').select('id', { count: 'exact' }),
            supabase.from('certificates').select('id', { count: 'exact' }),
            supabase.from('applications').select('id', { count: 'exact' }),
            supabase.from('agent_usage').select('input_tokens, output_tokens, model, latency_ms, created_at').limit(500),
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

        // Supabase resolves with { error } instead of throwing, so allSettled hides
        // failures. Surface a failed profiles read (the source of every user KPI).
        if (profilesRes.status === 'fulfilled' && profilesRes.value.error) {
          console.error('Admin dashboard: profiles query failed:', profilesRes.value.error.message);
        }

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

  // Subscription & revenue telemetry
  const planBreakdown = useMemo(() => {
    const free = profiles.filter((p) => !p.plan_tier || p.plan_tier === 'free').length;
    const go = profiles.filter((p) => p.plan_tier === 'go').length;
    const plus = profiles.filter((p) => p.plan_tier === 'plus').length;
    const enterprise = profiles.filter((p) => p.plan_tier === 'enterprise').length;
    const total = profiles.length;
    const paid = go + plus + enterprise;
    const mrr = go * 4.99 + plus * 9.99;
    const conversion = total > 0 ? Math.round((paid / total) * 1000) / 10 : 0;
    return { free, go, plus, enterprise, paid, mrr, conversion, total };
  }, [profiles]);

  // Role mix
  const roleBreakdown = useMemo(() => {
    const roles = [
      { name: 'Students', value: profiles.filter((p) => p.role === 'student').length },
      { name: 'Mentors', value: profiles.filter((p) => p.role === 'mentor').length },
      { name: 'Companies', value: profiles.filter((p) => p.role === 'company').length },
      { name: 'Admins', value: profiles.filter((p) => p.role === 'admin').length },
    ];
    return { roles, total: profiles.length };
  }, [profiles]);

  // Paid-tier distribution
  const tierData = useMemo(
    () => [
      { tier: 'Free', users: planBreakdown.free, mrr: 0 },
      { tier: 'GO', users: planBreakdown.go, mrr: planBreakdown.go * 4.99 },
      { tier: 'PLUS', users: planBreakdown.plus, mrr: planBreakdown.plus * 9.99 },
      { tier: 'Enterprise', users: planBreakdown.enterprise, mrr: 0 },
    ],
    [planBreakdown]
  );

  // AI usage trend: tokens per day over the last 7 days
  const aiTrend = useMemo(() => {
    const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return {
        key: dayKey(d),
        day: d.toLocaleString('default', { weekday: 'short' }),
        tokens: 0,
      };
    });
    const buckets = new Map(days.map((d) => [d.key, d]));
    agentUsageRows.forEach((row) => {
      if (!row.created_at) return;
      const bucket = buckets.get(dayKey(new Date(row.created_at)));
      if (bucket) bucket.tokens += (row.input_tokens || 0) + (row.output_tokens || 0);
    });
    return days;
  }, [agentUsageRows]);

  // AI compute telemetry
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
      inputTokens: totalInput,
      outputTokens: totalOutput,
      totalTokens,
      avgLatency,
      topModel,
    };
  }, [agentUsageRows]);

  const pendingCompanies = useMemo(
    () => companies.filter((c) => c.status === 'pending').length,
    [companies]
  );

  // New accounts in the last 30 days, for the change line under each figure
  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = (iso?: string) => !!iso && new Date(iso).getTime() >= cutoff;
    return {
      users: profiles.filter((p) => recent(p.created_at)).length,
      students: profiles.filter((p) => p.role === 'student' && recent(p.created_at)).length,
      mentors: profiles.filter((p) => p.role === 'mentor' && recent(p.created_at)).length,
      companies: companies.filter((c) => recent(c.created_at)).length,
    };
  }, [profiles, companies]);

  const vitals = useMemo(() => [
    { label: 'Users', value: nf.format(profiles.length), note: `+${last30.users} in 30 days` },
    {
      label: 'Students',
      value: nf.format(profiles.filter((p) => p.role === 'student').length),
      note: `+${last30.students} in 30 days`,
    },
    {
      label: 'Mentors',
      value: nf.format(profiles.filter((p) => p.role === 'mentor').length),
      note: `+${last30.mentors} in 30 days`,
    },
    {
      label: 'Companies',
      value: nf.format(companies.length),
      note: `${pendingCompanies} pending review`,
    },
    {
      label: 'Est. MRR',
      value: money(planBreakdown.mrr),
      note: `${planBreakdown.paid} paid of ${planBreakdown.total}`,
    },
    {
      label: 'AI tokens',
      value: compact(aiTelemetry.totalTokens),
      note: `${aiTelemetry.requests} calls · ${aiTelemetry.avgLatency}ms avg`,
    },
  ], [profiles, companies, last30, pendingCompanies, planBreakdown, aiTelemetry]);

  // Postings → applications → certificates
  const pipeline = useMemo(() => {
    // Applications can outnumber postings, so a bare % reads wrong above 100
    const ratio = (part: number, whole: number) => {
      if (whole <= 0) return '—';
      const value = part / whole;
      return value > 1 ? `${value.toFixed(1)}× per posting` : `${Math.round(value * 100)}%`;
    };
    return [
      { label: 'Internships', value: internshipsCount, rate: '' },
      { label: 'Applications', value: appsCount, rate: ratio(appsCount, internshipsCount) },
      { label: 'Certificates', value: certsCount, rate: ratio(certsCount, appsCount), seal: true },
    ];
  }, [internshipsCount, appsCount, certsCount]);

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

  const pct = (n: number) => (planBreakdown.total > 0 ? (n / planBreakdown.total) * 100 : 0);
  const peakDayTokens = useMemo(() => Math.max(...aiTrend.map((d) => d.tokens), 0), [aiTrend]);

  if (loading) {
    return <Loader variant="page" text="Loading platform overview..." />;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-[1600px] space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] font-medium leading-[1.15] tracking-[-0.01em]">
            Platform overview
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Users, revenue, compute and review load across ZYR0
          </p>
        </div>
        <Link
          to="/admin/users"
          className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
        >
          <Users className="h-4 w-4" strokeWidth={1.5} />
          Manage users
        </Link>
      </div>

      {/* Vitals */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-col divide-y divide-border xl:flex-row xl:divide-x xl:divide-y-0">
          {vitals.map((vital) => (
            <div key={vital.label} className="flex-1 px-6 py-5">
              <p className="font-mono text-[11px] text-muted-foreground">{vital.label}</p>
              <p className="mt-2 font-mono text-[26px] font-medium leading-none tabular-nums">
                {vital.value}
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground">{vital.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <Panel title="Pipeline" meta="All time">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {pipeline.map((stage, index) => (
            <Fragment key={stage.label}>
              {index > 0 && (
                <div className="flex items-center justify-center gap-2 sm:w-32">
                  <span className="hidden h-px flex-1 bg-border sm:block" />
                  <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
                    {stage.rate}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 rotate-90 text-muted-foreground/50 sm:rotate-0"
                    strokeWidth={1.5}
                  />
                  <span className="hidden h-px flex-1 bg-border sm:block" />
                </div>
              )}
              <div className="flex-1 rounded-lg border border-border px-5 py-4">
                <p className="font-mono text-[11px] text-muted-foreground">{stage.label}</p>
                <div className="mt-2 flex items-center gap-3">
                  <p
                    className={`font-mono text-[26px] font-medium leading-none tabular-nums ${
                      stage.seal ? 'text-accent' : ''
                    }`}
                  >
                    {nf.format(stage.value)}
                  </p>
                  {stage.seal && (
                    <img src="/seal.png" alt="" width={56} height={56} className="h-14 w-14" />
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </Panel>

      {/* Signups + roles */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Signups"
          action={
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Analytics <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-px w-4 bg-accent" /> Students
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-4 bg-foreground/45" /> Companies
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 border-t border-dashed border-foreground/30" /> Mentors
            </span>
            <span className="ml-auto">Cumulative, last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                dy={6}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'JetBrains Mono, monospace' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'JetBrains Mono, monospace' }}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} />
              <Line
                type="monotone"
                dataKey="students"
                name="Students"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="companies"
                name="Companies"
                stroke="hsl(var(--foreground) / 0.45)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="mentors"
                name="Mentors"
                stroke="hsl(var(--foreground) / 0.25)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Roles" meta={`${nf.format(roleBreakdown.total)} users`}>
          <div className="space-y-4">
            {roleBreakdown.roles.map((role) => (
              <div key={role.name} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span>{role.name}</span>
                  <span className="font-mono text-[12px] tabular-nums">
                    {nf.format(role.value)}
                    <span className="ml-2 text-muted-foreground">{pct(role.value).toFixed(0)}%</span>
                  </span>
                </div>
                <Meter value={role.value} max={roleBreakdown.total} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Subscriptions + review queues */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Subscriptions"
          meta={`${planBreakdown.conversion}% conversion`}
        >
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="font-mono text-[11px] text-muted-foreground">Est. MRR</p>
              <p className="mt-1 font-mono text-[26px] font-medium leading-none tabular-nums">
                {money(planBreakdown.mrr)}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground">
              {money(planBreakdown.mrr * 12)} annual run-rate
            </p>
          </div>
          <div className="divide-y divide-border">
            {tierData.map((tier) => (
              <div key={tier.tier} className="flex h-11 items-center gap-4">
                <span className="w-16 shrink-0 text-[13px] sm:w-24">{tier.tier}</span>
                <Meter value={tier.users} max={planBreakdown.total} />
                <span className="w-8 shrink-0 text-right font-mono text-[12px] tabular-nums sm:w-10">
                  {nf.format(tier.users)}
                </span>
                <span className="hidden w-20 shrink-0 text-right font-mono text-[12px] tabular-nums text-muted-foreground sm:block">
                  {tier.mrr > 0 ? money(tier.mrr) : '—'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Needs review" meta="Open queues">
          <div className="divide-y divide-border">
            {[
              { label: 'Pending companies', value: pendingCompanies, href: '/admin/companies', alert: true },
              { label: 'ToolHub submissions', value: pendingToolsCount, href: '/admin/tools', alert: true },
              { label: 'Applications', value: appsCount, href: '/admin/applications', alert: false },
            ].map((row) => (
              <Link
                key={row.label}
                to={row.href}
                className="group flex h-12 items-center justify-between gap-4 text-[13px]"
              >
                <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                  {row.label}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[13px] tabular-nums ${
                      row.alert && row.value > 0 ? 'text-amber-600 dark:text-amber-400' : ''
                    }`}
                  >
                    {nf.format(row.value)}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-foreground"
                    strokeWidth={1.5}
                  />
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      {/* Activity + AI usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Recent activity"
          action={
            <Link
              to="/admin/logs"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Audit logs <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          }
        >
          {activities.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">No activity recorded yet</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] text-muted-foreground">
                  <th className="hidden w-32 pb-2 font-normal sm:table-cell">Time</th>
                  <th className="pb-2 font-normal">Actor</th>
                  <th className="pb-2 font-normal">Action</th>
                  <th className="hidden pb-2 font-normal md:table-cell">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.map((activity) => {
                  const detail = [activity.details, activity.reason].filter(Boolean).join(' · ');
                  return (
                    <tr key={activity.id}>
                      <td className="hidden py-2.5 pr-4 font-mono text-[11px] tabular-nums text-muted-foreground sm:table-cell">
                        {shortDate(activity.created_at)}
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-4">{activity.user?.full_name || 'System'}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{activity.action}</td>
                      <td
                        className="hidden max-w-[280px] truncate py-2.5 text-muted-foreground md:table-cell"
                        title={detail || undefined}
                      >
                        {detail || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="AI usage" meta="Last 7 days">
          <div className="divide-y divide-border text-[13px]">
            {[
              { label: 'Calls', value: nf.format(aiTelemetry.requests) },
              {
                label: 'Tokens',
                value: `${compact(aiTelemetry.totalTokens)} · ${compact(aiTelemetry.inputTokens)} in / ${compact(aiTelemetry.outputTokens)} out`,
              },
              { label: 'Latency', value: `${nf.format(aiTelemetry.avgLatency)}ms avg` },
              { label: 'Top model', value: aiTelemetry.topModel },
            ].map((row) => (
              <div key={row.label} className="flex h-10 items-center justify-between gap-4">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="truncate font-mono text-[12px] tabular-nums" title={row.value}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex h-16 items-end gap-1.5">
              {aiTrend.map((day) => {
                const height = peakDayTokens > 0 ? Math.max(2, Math.round((day.tokens / peakDayTokens) * 64)) : 2;
                return (
                  <div
                    key={day.key}
                    className={`flex-1 rounded-sm ${day.tokens > 0 && day.tokens === peakDayTokens ? 'bg-accent' : 'bg-foreground/15'}`}
                    style={{ height }}
                    title={`${nf.format(day.tokens)} tokens`}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 flex gap-1.5 font-mono text-[10px] text-muted-foreground">
              {aiTrend.map((day) => (
                <span key={day.key} className="flex-1 text-center">
                  {day.day.slice(0, 1)}
                </span>
              ))}
            </div>
            {aiTelemetry.totalTokens === 0 && (
              <p className="mt-3 text-[12px] text-muted-foreground">No usage in the last 7 days</p>
            )}
          </div>
        </Panel>
      </div>
    </m.div>
  );
}
