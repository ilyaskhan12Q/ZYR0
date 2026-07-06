import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogs() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id, action, target, target_type, details, ip_address, created_at,
          user:profiles!user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error loading activity logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      !search ||
      (l.user?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all platform activities</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={log.user?.avatar_url || `https://ui-avatars.com/api/?name=${log.user?.full_name || 'System'}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm font-medium">{log.user?.full_name || 'System / Guest'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground font-medium">{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{log.details || log.target || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{log.ip_address || 'n/a'}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
