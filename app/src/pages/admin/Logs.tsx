import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, FileCheck, Award, Settings, LogIn } from 'lucide-react';

const logs = [
  { id: '1', user: 'Alex Johnson', userAvatar: 'https://i.pravatar.cc/150?u=alex', action: 'submitted task', target: 'API Endpoint', targetType: 'task', timestamp: '2025-01-20T10:30:00Z', ip: '192.168.1.45' },
  { id: '2', user: 'Emily Watson', userAvatar: 'https://i.pravatar.cc/150?u=emily', action: 'applied to', target: 'UI/UX Design Intern', targetType: 'internship', timestamp: '2025-01-20T09:15:00Z', ip: '192.168.1.62' },
  { id: '3', user: 'Sarah Chen', userAvatar: 'https://i.pravatar.cc/150?u=sarah', action: 'posted', target: 'Mobile Developer Intern', targetType: 'internship', timestamp: '2025-01-20T08:00:00Z', ip: '192.168.1.10' },
  { id: '4', user: 'Dr. Michael Rodriguez', userAvatar: 'https://i.pravatar.cc/150?u=michael', action: 'approved', target: 'Unit Tests for Auth Module', targetType: 'task', timestamp: '2025-01-19T16:00:00Z', ip: '192.168.1.23' },
  { id: '5', user: 'Alex Johnson', userAvatar: 'https://i.pravatar.cc/150?u=alex', action: 'received certificate', target: 'Software Engineering Internship', targetType: 'certificate', timestamp: '2025-01-15T12:00:00Z', ip: '192.168.1.45' },
  { id: '6', user: 'Admin User', userAvatar: 'https://i.pravatar.cc/150?u=admin', action: 'updated settings', target: 'Email Configuration', targetType: 'settings', timestamp: '2025-01-14T10:00:00Z', ip: '192.168.1.1' },
  { id: '7', user: 'Lisa Wang', userAvatar: 'https://i.pravatar.cc/150?u=lisa', action: 'logged in', target: '', targetType: 'auth', timestamp: '2025-01-13T09:30:00Z', ip: '192.168.1.78' },
  { id: '8', user: 'James Park', userAvatar: 'https://i.pravatar.cc/150?u=james', action: 'completed task', target: 'Data Cleaning Script', targetType: 'task', timestamp: '2025-01-12T14:00:00Z', ip: '192.168.1.91' },
];

const typeIcons: Record<string, React.ElementType> = {
  task: FileCheck,
  internship: Building2,
  certificate: Award,
  settings: Settings,
  auth: LogIn,
};

export default function AdminLogs() {
  const [search, setSearch] = useState('');
  const filtered = logs.filter(l => !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all platform activities</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Target</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">IP</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={log.userAvatar} alt="" className="w-8 h-8 rounded-full" /><span className="text-sm font-medium">{log.user}</span></div></td>
                  <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{log.action}</span></td>
                  <td className="px-4 py-3 text-sm">{log.target || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{log.ip}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
