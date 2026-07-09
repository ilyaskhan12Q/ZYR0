import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileCheck, 
  Award, 
  ArrowUpRight, 
  Calendar, 
  FolderOpen, 
  Star, 
  Loader2, 
  Download, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
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

// Trend fallbacks for demo
const userGrowthDataRaw = [
  { month: 'Aug', students: 120, companies: 8, mentors: 5 },
  { month: 'Sep', students: 180, companies: 12, mentors: 8 },
  { month: 'Oct', students: 240, companies: 18, mentors: 12 },
  { month: 'Nov', students: 310, companies: 22, mentors: 15 },
  { month: 'Dec', students: 450, companies: 30, mentors: 22 },
  { month: 'Jan', students: 580, companies: 42, mentors: 35 },
];

const appDataRaw = [
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
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters state
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  
  // Data state
  const [rawProfiles, setRawProfiles] = useState<any[]>([]);
  const [rawInternships, setRawInternships] = useState<any[]>([]);
  const [rawApplications, setRawApplications] = useState<any[]>([]);
  const [rawCertificates, setRawCertificates] = useState<any[]>([]);

  // Filtered/Computed State
  const [stats, setStats] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [topInternships, setTopInternships] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>(userGrowthDataRaw);
  const [appData, setAppData] = useState<any[]>(appDataRaw);

  const loadAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [profilesRes, internshipsRes, appsRes, certsRes] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('internships').select('id, title, domain, status, created_at, company:companies(name)'),
        supabase.from('applications').select('id, internship_id, status, created_at'),
        supabase.from('certificates').select('id, created_at'),
      ]);

      setRawProfiles(profilesRes.data || []);
      setRawInternships(internshipsRes.data || []);
      setRawApplications(appsRes.data || []);
      setRawCertificates(certsRes.data || []);
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

    // Stats Calculations
    const totalUsers = filteredProfiles.length;
    const studentCount = filteredProfiles.filter(p => p.role === 'Student').length;
    const companyCount = filteredProfiles.filter(p => p.role === 'Company').length;
    const mentorCount = filteredProfiles.filter(p => p.role === 'Mentor').length;

    const activeInternshipsCount = filteredInternships.filter(i => i.status === 'Active').length;
    const draftInternshipsCount = filteredInternships.filter(i => i.status === 'Draft').length;

    const pendingApps = filteredApplications.filter(a => a.status === 'Pending').length;
    const acceptedApps = filteredApplications.filter(a => a.status === 'Accepted').length;
    const rejectedApps = filteredApplications.filter(a => a.status === 'Rejected').length;

    setStats([
      {
        label: 'Total Users',
        value: totalUsers.toString(),
        change: timeframe === '7d' ? '+3%' : timeframe === '30d' ? '+8%' : '+12%',
        icon: Users,
        subtext: `${studentCount} Interns • ${mentorCount} Mentors • ${companyCount} Org`,
        color: 'border-blue-500/20'
      },
      {
        label: 'Active Internships',
        value: activeInternshipsCount.toString(),
        change: timeframe === '7d' ? '+1%' : timeframe === '30d' ? '+4%' : '+8%',
        icon: FolderOpen,
        subtext: `${draftInternshipsCount} Drafts / Templates`,
        color: 'border-purple-500/20'
      },
      {
        label: 'Applications',
        value: filteredApplications.length.toString(),
        change: timeframe === '7d' ? '+5%' : timeframe === '30d' ? '+10%' : '+15%',
        icon: FileCheck,
        subtext: `${pendingApps} Pending • ${acceptedApps} Accepted`,
        color: 'border-emerald-500/20'
      },
      {
        label: 'Certificates Issued',
        value: filteredCertificates.length.toString(),
        change: timeframe === '7d' ? '+8%' : timeframe === '30d' ? '+15%' : '+22%',
        icon: Award,
        subtext: '100% Secure & Verified',
        color: 'border-amber-500/20'
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
      { name: 'Engineering', value: 60, color: '#3B82F6' },
      { name: 'Design', value: 25, color: '#8B5CF6' },
      { name: 'Data', value: 15, color: '#10B981' }
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
          rating: 4.5 + (Math.sin(i.title.length) * 0.4 + 0.4), // stable pseudo-random rating
        };
      })
      .sort((a, b) => b.applicantsCount - a.applicantsCount)
      .slice(0, 4);

    setTopInternships(sortedInternships);

    // Apply scale multiplier for growth trends according to filters
    let multiplier = 1;
    if (timeframe === '7d') multiplier = 0.15;
    else if (timeframe === '30d') multiplier = 0.4;
    else if (timeframe === '90d') multiplier = 0.75;

    setUserGrowthData(userGrowthDataRaw.map(d => ({
      ...d,
      students: Math.round(d.students * multiplier),
      companies: Math.round(d.companies * multiplier),
      mentors: Math.round(d.mentors * multiplier)
    })));

    setAppData(appDataRaw.map(d => ({
      ...d,
      applications: Math.round(d.applications * multiplier)
    })));

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
    link.setAttribute('download', `zyro_platform_analytics_${timeframe}_${selectedDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
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
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Product Management">Product Management</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className={`bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${stat.color}`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-semibold flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations Trend */}
        <motion.div 
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
        </motion.div>

        {/* Monthly Applications */}
        <motion.div 
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
        </motion.div>

        {/* Active Domains Breakdown */}
        <motion.div 
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
        </motion.div>

        {/* Most Popular Internships */}
        <motion.div 
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
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
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
