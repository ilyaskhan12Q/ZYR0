import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Search,
  Shield,
  ShieldAlert,
  CreditCard,
  UserCheck,
  Award,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/common/Loader';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/timeout';

const TABS = ['All', 'Governance', 'Plans', 'Suspensions', 'Certificates'];

const actionBadgeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  user_role_changed: {
    label: 'Role Change',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    icon: Shield,
  },
  plan_tier_changed: {
    label: 'Plan Override',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    icon: CreditCard,
  },
  user_suspended: {
    label: 'Suspended',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
    icon: ShieldAlert,
  },
  user_activated: {
    label: 'Activated',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    icon: CheckCircle2,
  },
  user_status_changed: {
    label: 'Status Change',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    icon: UserCheck,
  },
  certificate_issued: {
    label: 'Certificate',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    icon: Award,
  },
};

export default function AdminLogs() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  function loadLogs() {
    let cancelled = false;
    withTimeout(
      Promise.resolve(
        supabase
          .from('activity_logs')
          .select(`
            id, action, target, target_type, details, reason, metadata, ip_address, created_at,
            actor:profiles!actor_id (id, full_name, avatar_url, role),
            target_user:profiles!user_id (id, full_name, email, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(150)
      ),
      10000,
      { data: [], error: null },
      'AdminLogs'
    )
      .then((result) => {
        if (result.error) throw result.error;
        if (result.data && !cancelled) {
          setLogs(result.data);
        }
      })
      .catch((err) => {
        console.error('Error loading activity logs:', err);
        toast.error('Failed to load audit logs');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    const cleanup = loadLogs();
    return cleanup;
  }, []);

  const filtered = logs.filter((log) => {
    // Tab filter
    if (activeTab === 'Governance') {
      if (!log.action.includes('role')) return false;
    } else if (activeTab === 'Plans') {
      if (!log.action.includes('plan')) return false;
    } else if (activeTab === 'Suspensions') {
      if (!log.action.includes('suspended') && !log.action.includes('activated') && !log.action.includes('status')) return false;
    } else if (activeTab === 'Certificates') {
      if (!log.action.includes('certificate')) return false;
    }

    // Search query filter
    const q = search.toLowerCase();
    const actorName = (log.actor?.full_name || '').toLowerCase();
    const targetName = (log.target_user?.full_name || '').toLowerCase();
    const targetEmail = (log.target_user?.email || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const reason = (log.reason || '').toLowerCase();
    const details = (log.details || '').toLowerCase();

    return (
      !search ||
      actorName.includes(q) ||
      targetName.includes(q) ||
      targetEmail.includes(q) ||
      action.includes(q) ||
      reason.includes(q) ||
      details.includes(q)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Administrative Audit Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable log of role changes, plan overrides, suspensions, and system actions
          </p>
        </div>
        <button
          onClick={() => loadLogs()}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by administrator, target user, action, or reason note..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader variant="page" text="Loading audit log entries..." />
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="w-8"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Admin Actor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Target Subject
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Administrative Reason / Note
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No administrative audit records match your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const badge = actionBadgeConfig[log.action] || {
                      label: log.action.replace(/_/g, ' '),
                      color: 'bg-muted text-muted-foreground border-border',
                      icon: Shield,
                    };
                    const BadgeIcon = badge.icon;
                    const isExpanded = expandedLogId === log.id;
                    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => hasMetadata && toggleExpand(log.id)}
                          className={`hover:bg-muted/30 transition-colors ${
                            hasMetadata ? 'cursor-pointer' : ''
                          }`}
                        >
                          <td className="pl-4 py-3 text-muted-foreground">
                            {hasMetadata ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-accent" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  log.actor?.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    log.actor?.full_name || 'System'
                                  )}`
                                }
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border border-border"
                              />
                              <div>
                                <p className="text-xs font-semibold">
                                  {log.actor?.full_name || 'System / Auto'}
                                </p>
                                {log.actor?.role && (
                                  <p className="text-[10px] text-muted-foreground capitalize">
                                    {log.actor.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border font-medium ${badge.color}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {log.target_user ? (
                              <div>
                                <p className="text-xs font-medium text-foreground">
                                  {log.target_user.full_name || 'Anonymous User'}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {log.target_user.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">
                                {log.target || 'General System'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              {log.reason ? (
                                <p className="text-xs text-foreground font-medium truncate" title={log.reason}>
                                  {log.reason}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground truncate" title={log.details}>
                                  {log.details || '—'}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground/70" />
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Metadata Row */}
                        {isExpanded && hasMetadata && (
                          <tr className="bg-muted/15 border-b border-border">
                            <td colSpan={6} className="px-8 py-3.5">
                              <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Audit Event Context & Diff
                                </p>
                                <pre className="text-[11px] font-mono text-foreground bg-muted/40 p-2.5 rounded-lg overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
