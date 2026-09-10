import { m } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface TaskStatsHeaderProps {
  tasks: any[];
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function TaskStatsHeader({ tasks, activeTab, onSelectTab }: TaskStatsHeaderProps) {
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const submittedTasks = tasks.filter(t => t.status === 'Submitted').length;
  const approvedTasks = tasks.filter(t => t.status === 'Approved').length;
  const rejectedTasks = tasks.filter(t => t.status === 'Rejected').length;

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Approved') return false;
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(23, 59, 59, 999);
    return due.getTime() < Date.now();
  }).length;

  const approvalRate = totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      id: 'All',
      title: 'Total Tasks',
      value: totalTasks,
      subtext: `${pendingTasks} in progress`,
      icon: ClipboardList,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      activeBg: 'ring-2 ring-blue-500 bg-blue-500/15',
    },
    {
      id: 'Submitted',
      title: 'Needs Review',
      value: submittedTasks,
      subtext: submittedTasks > 0 ? 'Action required' : 'All clear',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      activeBg: 'ring-2 ring-amber-500 bg-amber-500/15',
      badge: submittedTasks > 0 ? 'Review Ready' : null,
    },
    {
      id: 'Approved',
      title: 'Approval Rate',
      value: `${approvalRate}%`,
      subtext: `${approvedTasks} approved`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      activeBg: 'ring-2 ring-emerald-500 bg-emerald-500/15',
    },
    {
      id: 'Overdue',
      title: 'Overdue Tasks',
      value: overdueTasks,
      subtext: overdueTasks > 0 ? 'Past deadline' : 'On schedule',
      icon: AlertTriangle,
      color: overdueTasks > 0 ? 'text-red-500' : 'text-muted-foreground',
      bg: overdueTasks > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/40 border-border',
      activeBg: 'ring-2 ring-red-500 bg-red-500/15',
      badge: overdueTasks > 0 ? 'Attention' : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isActive = activeTab === stat.id;
        return (
          <m.button
            key={stat.title}
            type="button"
            onClick={() => onSelectTab?.(stat.id)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
              isActive ? stat.activeBg : stat.bg
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
              {stat.badge && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  stat.id === 'Overdue' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stat.subtext}
            </p>
          </m.button>
        );
      })}
    </div>
  );
}
