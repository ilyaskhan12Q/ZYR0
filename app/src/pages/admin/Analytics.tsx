import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { 
  Users, 
  FileCheck, 
  Award, 
  Calendar, 
  FolderOpen, 
  Star, 
  Download, 
  Filter, 
  RefreshCw,
  CreditCard,
  Cpu,
  Sparkles
} from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { INTERNSHIP_DOMAINS } from '@/lib/internshipDomains';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters state
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  
  // Data state
  const [rawProfiles, setRawProfiles] = useState<any[]>([]);
  const [rawInternships, setRawInternships] = useState<any[]>([]);
  const [rawApplications, setRawApplications] = useState<any[]>([]);
  const [rawCertificates, setRawCertificates] = useState<any[]>([]);
  const [rawAgentUsage, setRawAgentUsage] = useState<any[]>([]);

  // Filtered/Computed State
  const [stats, setStats] = useState<any[]>([]);
  const [planBreakdown, setPlanBreakdown] = useState<any>({ free: 0, go: 0, plus: 0, enterprise: 0, mrr: 0, conversion: 0 });
  const [aiMetrics, setAiMetrics] = useState<any>({ tokens: 0, inputTokens: 0, outputTokens: 0, invocations: 0, avgLatency: 0, topModel: 'Zen / Gemini' });
  const [domainData, setDomainData] = useState<any[]>([]);
  const [topInternships, setTopInternships] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [appData, setAppData] = useState<any[]>([]);

  const loadAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const settled = await Promise.race([
        Promise.allSettled([
          supabase.from('profiles').select('id, role, plan_tier, created_at'),
          supabase.from('internships').select('id, title, domain, status, created_at, company:companies(name)'),
          supabase.from('applications').select('id, internship_id, status, created_at'),
          supabase.from('certificates').select('id, created_at'),
          supabase.from('agent_usage').select('id, input_tokens, output_tokens, model, latency_ms, created_at').limit(1000),
        ]),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Analytics timeout')), 10000))
      ]);

      const [profilesRes, internshipsRes, appsRes, certsRes, usageRes] = settled;

      setRawProfiles(profilesRes.status === 'fulfilled' ? (profilesRes.value.data || []) : []);
      setRawInternships(internshipsRes.status === 'fulfilled' ? (internshipsRes.value.data || []) : []);
      setRawApplications(appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : []);
      setRawCertificates(certsRes.status === 'fulfilled' ? (certsRes.value.data || []) : []);
      setRawAgentUsage(usageRes.status === 'fulfilled' ? (usageRes.value.data || []) : []);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Compute analytics whenever raw data or filters change
  useEffect(() => {
    if (loading) return;

    // Filter by Timeframe Helper
    const filterByTimeframe = (createdAtStr: string) => {
      if (timeframe === 'all' || !createdAtStr) return true;
      const createdDate = new Date(createdAtStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeframe === '7d') return diffDays <= 7;
      if (timeframe === '30d') return diffDays <= 30;
      if (timeframe === '90d') return diffDays <= 90;
      return true;
    };

    // Filter Raw Data
    const filteredProfiles = rawProfiles.filter(p => filterByTimeframe(p.created_at));
    const filteredInternships = rawInternships.filter(i => {
      const timeMatch = filterByTimeframe(i.created_at);
      const domainMatch = selectedDomain === 'All' || i.domain === selectedDomain;
      return timeMatch && domainMatch;
    });

    const activeInternshipIds = new Set(filteredInternships.map(i => i.id));
    const filteredApplications = rawApplications.filter(a => {
      const timeMatch = filterByTimeframe(a.created_at);
      const internshipMatch = selectedDomain === 'All' || activeInternshipIds.has(a.internship_id);
      return timeMatch && internshipMatch;
    });

    const filteredCertificates = rawCertificates.filter(c => filterByTimeframe(c.created_at));
    const filteredUsage = rawAgentUsage.filter(u => filterByTimeframe(u.created_at));

    // Stats Calculations
    const totalUsers = filteredProfiles.length;
    const studentCount = filteredProfiles.filter(p => p.role === 'Student' || p.role === 'student').length;
    const companyCount = filteredProfiles.filter(p => p.role === 'Company' || p.role === 'company').length;
    const mentorCount = filteredProfiles.filter(p => p.role === 'Mentor' || p.role === 'mentor').length;

    // Plan & Monetization breakdown
    const freeUsers = filteredProfiles.filter(p => !p.plan_tier || p.plan_tier === 'free').length;
    const goUsers = filteredProfiles.filter(p => p.plan_tier === 'go').length;
    const plusUsers = filteredProfiles.filter(p => p.plan_tier === 'plus').length;
    const enterpriseUsers = filteredProfiles.filter(p => p.plan_tier === 'enterprise').length;
    const paidUsers = goUsers + plusUsers + enterpriseUsers;
    const mrr = (goUsers * 4.99) + (plusUsers * 9.99);
    const conversion = Math.round((paidUsers / (totalUsers || 1)) * 1000) / 10;
    setPlanBreakdown({ free: freeUsers, go: goUsers, plus: plusUsers, enterprise: enterpriseUsers, paid: paidUsers, mrr, conversion });

    // AI Compute & Gateway Telemetry
    let totalInput = 0;
    let totalOutput = 0;
    let totalLatency = 0;
    const modelFreq: Record<string, number> = {};
    filteredUsage.forEach(u => {
      totalInput += u.input_tokens || 0;
      totalOutput += u.output_tokens || 0;
      totalLatency += u.latency_ms || 0;
      if (u.model) modelFreq[u.model] = (modelFreq[u.model] || 0) + 1;
    });
    const topModel = Object.entries(modelFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Zen / Gemini';
    const totalTokens = totalInput + totalOutput;
    const avgLatency = filteredUsage.length > 0 ? Math.round(totalLatency / filteredUsage.length) : 0;
    setAiMetrics({ tokens: totalTokens, inputTokens: totalInput, outputTokens: totalOutput, invocations: filteredUsage.length, avgLatency, topModel });

    const activeInternshipsCount = filteredInternships.filter(i => i.status === 'Active').length;
    const draftInternshipsCount = filteredInternships.filter(i => i.status === 'Draft').length;

    const pendingApps = filteredApplications.filter(a => a.status === 'Pending').length;
    const acceptedApps = filteredApplications.filter(a => a.status === 'Accepted').length;

    setStats([
      {
        label: 'Total Users',
        value: totalUsers.toString(),
        icon: Users,
        subtext: `${studentCount} Interns · ${mentorCount} Mentors · ${companyCount} Org`,
      },
      {
        label: 'Est. Monthly Revenue',
        value: `$${mrr.toFixed(2)}`,
        icon: CreditCard,
        subtext: `${paidUsers} Paid · ${conversion}% Conv.`,
      },
      {
        label: 'AI Tokens Burned',
        value: `${(totalTokens / 1000).toFixed(1)}k`,
        icon: Cpu,
        subtext: `${filteredUsage.length} Invocations · ${avgLatency}ms`,
      },
      {
        label: 'Active Internships',
        value: activeInternshipsCount.toString(),
        icon: FolderOpen,
        subtext: `${draftInternshipsCount} Drafts / Templates`,
      },
      {
        label: 'Applications',
        value: filteredApplications.length.toString(),
        icon: FileCheck,
        subtext: `${pendingApps} Pending · ${acceptedApps} Accepted`,
      },
      {
        label: 'Certificates Issued',
        value: filteredCertificates.length.toString(),
        icon: Award,
        subtext: 'Verified Credentials',
      },
    ]);

    // Setup domain breakdown pie chart
    const domainsMap: Record<string, number> = {};
    let totalActiveDomains = 0;
    filteredInternships.forEach((i) => {
      if (i.domain) {
        domainsMap[i.domain] = (domainsMap[i.domain] || 0) + 1;
        totalActiveDomains++;
      }
    });

    const chartDomains = Object.entries(domainsMap).map(([name, count], index) => ({
      name,
      value: totalActiveDomains > 0 ? Math.round((count / totalActiveDomains) * 100) : 0,
      color: COLORS[index % COLORS.length],
    }));

    setDomainData(chartDomains.length > 0 ? chartDomains : [
      { name: 'No Data Available', value: 100, color: 'hsl(var(--muted-foreground))' }
    ]);

    // Top performing internships (by application count)
    const appCounts: Record<string, number> = {};
    filteredApplications.forEach((a) => {
      if (a.internship_id) {
        appCounts[a.internship_id] = (appCounts[a.internship_id] || 0) + 1;
      }
    });

    const sortedInternships = filteredInternships
      .map((i) => {
        const companyObj = Array.isArray(i.company) ? i.company[0] : i.company;
        return {
          title: i.title,
          companyName: companyObj?.name || 'Partner Company',
          applicantsCount: appCounts[i.id] || 0,
          domain: i.domain || 'General',
        };
      })
      .sort((a, b) => b.applicantsCount - a.applicantsCount)
      .slice(0, 4);

    setTopInternships(sortedInternships);

    // Compute dynamic registration timeline and application volume for last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const computedUserGrowth = [];
    const computedAppData = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[monthDate.getMonth()];
      const startMs = monthDate.getTime();
      const endMs = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

      const students = rawProfiles.filter(p => 
        (p.role === 'Student' || p.role === 'student') && 
        new Date(p.created_at).getTime() <= endMs
      ).length;

      const companies = rawProfiles.filter(p => 
        (p.role === 'Company' || p.role === 'company') && 
        new Date(p.created_at).getTime() <= endMs
      ).length;

      const mentors = rawProfiles.filter(p => 
        (p.role === 'Mentor' || p.role === 'mentor') && 
        new Date(p.created_at).getTime() <= endMs
      ).length;

      computedUserGrowth.push({ month: label, students, companies, mentors });

      const monthlyApplications = rawApplications.filter(a => {
        const t = new Date(a.created_at).getTime();
        return t >= startMs && t <= endMs;
      }).length;

      computedAppData.push({ month: label, applications: monthlyApplications });
    }

    setUserGrowthData(computedUserGrowth);
    setAppData(computedAppData);

  }, [timeframe, selectedDomain, rawProfiles, rawInternships, rawApplications, rawCertificates, loading]);

  // Export current dashboard metrics as CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header section
    csvContent += 'Platform Analytics Export Summary\n';
    csvContent += `Generated at,${new Date().toLocaleString()}\n`;
    csvContent += `Filters,Timeframe: ${timeframe.toUpperCase()} | Domain: ${selectedDomain}\n\n`;

    // KPIs section
    csvContent += 'KEY PERFORMANCE INDICATORS\n';
    csvContent += 'Indicator,Value,Trend\n';
    stats.forEach(stat => {
      csvContent += `"${stat.label}","${stat.value}","${stat.change}"\n`;
    });
    csvContent += '\n';

    // Domain breakdown section
    csvContent += 'ACTIVE INTERNSHIP DOMAINS BREAKDOWN\n';
    csvContent += 'Domain,Percentage (%)\n';
    domainData.forEach(d => {
      csvContent += `"${d.name}","${d.value}%"\n`;
    });
    csvContent += '\n';

    // Popular internships section
    csvContent += 'MOST POPULAR INTERNSHIPS\n';
    csvContent += 'Title,Company,Applicants Count,Rating\n';
    topInternships.forEach(item => {
      csvContent += `"${item.title}","${item.companyName}","${item.applicantsCount}","${item.rating.toFixed(1)}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zyr0_platform_analytics_${timeframe}_${selectedDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loader variant="page" text="Loading platform analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive platform-wide metrics & telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="p-2 border border-border bg-card rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Filter Dashboard</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted">
            {(['7d', '30d', '90d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  timeframe === t 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'All Time' : `${t.toUpperCase()}`}
              </button>
            ))}
          </div>

          {/* Domain selector */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="All">All Domains</option>
            {INTERNSHIP_DOMAINS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((stat, i) => (
          <m.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.03 }} 
            className="bg-card rounded-xl p-4 border border-border shadow-2xs hover:bg-muted/30 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon className="w-3.5 h-3.5 text-muted-foreground/70" />
            </div>
            
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{stat.subtext}</p>
            </div>
          </m.div>
        ))}
      </div>

      {/* Subscription Breakdown & AI Telemetry Overview (Linear/Datadog Operational Command Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Plan Breakdown Card */}
        <m.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }}
          className="p-5 rounded-xl bg-card border border-border shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground tracking-tight">Monetization & Plan Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active subscriptions within selected timeframe</p>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground">
              {planBreakdown.conversion}% Conversion
            </span>
          </div>

          {/* Segmented Proportional Visual Distribution Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Tier Distribution</span>
              <span>{planBreakdown.free + planBreakdown.paid} Filtered Users</span>
            </div>
            <div className="h-2.5 w-full rounded-md bg-muted overflow-hidden flex border border-border/60">
              <div
                style={{ width: `${((planBreakdown.free) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100}%` }}
                className="bg-muted-foreground/30 hover:opacity-90 transition-all"
                title={`Free: ${planBreakdown.free}`}
              />
              <div
                style={{ width: `${((planBreakdown.go) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100}%` }}
                className="bg-cyan-500/70 hover:opacity-90 transition-all"
                title={`GO: ${planBreakdown.go}`}
              />
              <div
                style={{ width: `${((planBreakdown.plus) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100}%` }}
                className="bg-foreground hover:opacity-90 transition-all"
                title={`PLUS: ${planBreakdown.plus}`}
              />
              <div
                style={{ width: `${((planBreakdown.enterprise) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100}%` }}
                className="bg-emerald-500 hover:opacity-90 transition-all"
                title={`Enterprise: ${planBreakdown.enterprise}`}
              />
            </div>
          </div>

          {/* Descriptive Breakdown Table */}
          <div className="divide-y divide-border rounded-lg border border-border bg-muted/20">
            <div className="grid grid-cols-4 p-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span>Tier</span>
              <span className="text-right">Users</span>
              <span className="text-right">Share</span>
              <span className="text-right">MRR Yield</span>
            </div>
            <div className="grid grid-cols-4 p-2.5 text-xs items-center">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                Free
              </span>
              <span className="text-right font-mono tabular-nums">{planBreakdown.free}</span>
              <span className="text-right font-mono text-muted-foreground">
                {(((planBreakdown.free) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-right font-mono text-muted-foreground">$0.00</span>
            </div>
            <div className="grid grid-cols-4 p-2.5 text-xs items-center">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                ZYR0 GO
              </span>
              <span className="text-right font-mono tabular-nums">{planBreakdown.go}</span>
              <span className="text-right font-mono text-muted-foreground">
                {(((planBreakdown.go) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-right font-mono font-medium text-foreground">${(planBreakdown.go * 4.99).toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-4 p-2.5 text-xs items-center">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                ZYR0 PLUS
              </span>
              <span className="text-right font-mono tabular-nums">{planBreakdown.plus}</span>
              <span className="text-right font-mono text-muted-foreground">
                {(((planBreakdown.plus) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-right font-mono font-medium text-foreground">${(planBreakdown.plus * 9.99).toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-4 p-2.5 text-xs items-center">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Enterprise
              </span>
              <span className="text-right font-mono tabular-nums">{planBreakdown.enterprise}</span>
              <span className="text-right font-mono text-muted-foreground">
                {(((planBreakdown.enterprise) / ((planBreakdown.free + planBreakdown.paid) || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-right font-mono text-muted-foreground">Custom SLA</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Total Paid Accounts: <strong className="text-foreground font-mono">{planBreakdown.paid}</strong>
            </span>
            <span>
              Annualized Run-Rate: <strong className="text-foreground font-mono">${(planBreakdown.mrr * 12).toFixed(2)}/yr</strong>
            </span>
          </div>
        </m.div>

        {/* AI Compute Telemetry Card */}
        <m.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-card border border-border shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground tracking-tight">AI Compute & Gateway Telemetry</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time compute volume & token consumption</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Live</span>
            </span>
          </div>

          {/* Contextual Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Invocations</p>
              <p className="text-lg font-bold font-mono tabular-nums mt-1 text-foreground">{aiMetrics.invocations}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Agent queries</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Tokens</p>
              <p className="text-lg font-bold font-mono tabular-nums mt-1 text-foreground">{(aiMetrics.tokens / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {aiMetrics.invocations > 0 ? Math.round(aiMetrics.tokens / aiMetrics.invocations) : 0} tok/req avg
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Avg Latency</p>
              <p className="text-lg font-bold font-mono tabular-nums mt-1 text-foreground">{aiMetrics.avgLatency}ms</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {aiMetrics.avgLatency < 500 ? 'Optimal response' : 'Standard lane'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Top Engine</p>
              <p className="text-xs font-bold font-mono truncate mt-2 text-foreground" title={aiMetrics.topModel}>
                {aiMetrics.topModel.replace('gemini-', '').replace('llama-', '')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Primary model</p>
            </div>
          </div>

          {/* Token Breakdown Bar */}
          <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Prompt vs Completion Tokens</span>
              <span className="text-foreground">
                In: {((aiMetrics.inputTokens || 0) / 1000).toFixed(1)}k · Out: {((aiMetrics.outputTokens || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="h-2 w-full rounded bg-muted overflow-hidden flex border border-border/50">
              <div
                style={{
                  width: `${aiMetrics.tokens > 0 ? ((aiMetrics.inputTokens || 0) / aiMetrics.tokens) * 100 : 50}%`,
                }}
                className="bg-muted-foreground/60 transition-all"
                title="Input/Prompt tokens"
              />
              <div
                style={{
                  width: `${aiMetrics.tokens > 0 ? ((aiMetrics.outputTokens || 0) / aiMetrics.tokens) * 100 : 50}%`,
                }}
                className="bg-foreground transition-all"
                title="Output/Completion tokens"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Gateway Policy: Max 20 req/min/user</span>
            <span className="text-foreground font-mono">Queue Delay: 0ms (Dedicated)</span>
          </div>
        </m.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations Trend */}
        <m.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-base">User Registration Telemetry</h3>
            <p className="text-xs text-muted-foreground mb-4">Cumulative registration growth over active cycles</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" name="Students" dataKey="students" stroke="#3B82F6" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={2} />
              <Area type="monotone" name="Companies" dataKey="companies" stroke="#10B981" fillOpacity={1} fill="url(#colorCompanies)" strokeWidth={2} />
              <Area type="monotone" name="Mentors" dataKey="mentors" stroke="#8B5CF6" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </m.div>

        {/* Monthly Applications */}
        <m.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-base">Monthly Submissions & Applications</h3>
            <p className="text-xs text-muted-foreground mb-4">Total candidate application volume per month</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={appData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '8px' 
                }} 
              />
              <Bar name="Applications" dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {appData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === appData.length - 1 ? '#8B5CF6' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </m.div>

        {/* Active Domains Breakdown */}
        <m.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6"
        >
          <h3 className="font-bold text-base">Active Domains Allocation</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution of programs across functional business areas</p>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
            <ResponsiveContainer width="100%" height={200} className="max-w-[200px]">
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {domainData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1 w-full max-w-[240px]">
              {domainData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-medium text-muted-foreground text-xs">{d.name}</span>
                  </div>
                  <span className="text-foreground font-semibold text-xs">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </m.div>

        {/* Most Popular Internships */}
        <m.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-base">Top Performing Internships</h3>
            <p className="text-xs text-muted-foreground mb-4">Ranked by overall application rates and engagement ratings</p>
          </div>
          <div className="space-y-3.5">
            {topInternships.length > 0 ? (
              topInternships.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-muted/50 hover:bg-muted border border-border rounded-xl transition-colors">
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{item.applicantsCount} apps</p>
                    <p className="text-xs text-muted-foreground font-medium justify-end mt-0.5">
                      {item.domain}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">No internship applications yet</div>
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
}
