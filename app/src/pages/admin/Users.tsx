import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import {
  Search,
  Shield,
  GraduationCap,
  Building2,
  UserCheck,
  UserCog,
  Sparkles,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/common/Loader';
import { getAllUsers, updateUserStatus } from '@/services/users';
import { withTimeout } from '@/lib/timeout';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/lib/database.types';
import ManageUserModal from '@/components/admin/ManageUserModal';

const tabs = ['All', 'Student', 'Company', 'Mentor', 'Admin'];

const roleConfig: Record<string, { color: string; icon: React.ElementType }> = {
  student: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: GraduationCap },
  company: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Building2 },
  mentor: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: UserCheck },
  admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield },
};

const planConfig: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-muted/70 text-muted-foreground border-border' },
  go: { label: 'GO', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-semibold' },
  plus: { label: 'PLUS', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold' },
  enterprise: { label: 'Enterprise', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-500/20' },
  inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/20' },
};

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Manage User Modal State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  function loadUsers() {
    let cancelled = false;
    const roleFilter = activeTab === 'All' ? undefined : activeTab.toLowerCase();
    withTimeout(
      getAllUsers(0, 100, roleFilter),
      10000,
      { data: [], error: null },
      'AdminUsers'
    )
      .then((result) => {
        if (result.error) throw result.error;
        if (result.data && !cancelled) {
          setUsers(result.data as Profile[]);
        }
      })
      .catch((err) => {
        console.error('Error loading users:', err);
        toast.error('Failed to load users');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }

  useEffect(() => {
    const cleanup = loadUsers();
    return cleanup;
  }, [activeTab]);

  const handleOpenManage = (targetUser: Profile) => {
    setSelectedUser(targetUser);
    setManageModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: Profile) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  const handleQuickToggleStatus = async (user: Profile) => {
    // If currently active, opening the modal ensures a required suspension reason is given
    if (user.status === 'active') {
      handleOpenManage(user);
      return;
    }

    // If currently suspended or inactive, reactivate directly
    try {
      await updateUserStatus(user.id, 'active', {
        reason: 'Admin quick reactivation',
        actorId: currentAdmin?.id,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: 'active', status_reason: null } : u))
      );
      toast.success(`Reactivated ${user.full_name || user.email || 'user'}`);
    } catch (err: any) {
      console.error('Failed to reactivate user:', err);
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      !search ||
      (u.full_name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.id || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Governance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage roles, manual plan tiers, and account security
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map((tab) => (
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
        <Loader variant="page" text="Loading user governance data..." />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Plan Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No users match the active search or role filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const rConfig = roleConfig[user.role] || roleConfig.student;
                    const RoleIcon = rConfig.icon;
                    const pConfig = planConfig[user.plan_tier || 'free'] || planConfig.free;
                    const sConfig = statusConfig[user.status] || statusConfig.active;

                    return (
                      <m.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}`}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-border"
                            />
                            <div>
                              <p className="text-sm font-medium">{user.full_name || 'No Name Provided'}</p>
                              <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${rConfig.color}`}>
                            <RoleIcon className="w-3 h-3" /> {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border ${pConfig.color}`}>
                            {user.plan_tier === 'plus' && <Sparkles className="w-3 h-3 text-amber-500" />}
                            {pConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border font-medium ${sConfig.color}`}
                            title={user.status_reason || undefined}
                          >
                            {user.status === 'suspended' && <ShieldAlert className="w-3 h-3" />}
                            {sConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenManage(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                              title="Manage roles, plan overrides, and account status"
                            >
                              <UserCog className="w-3.5 h-3.5 text-accent" />
                              <span>Manage</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickToggleStatus(user)}
                              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title={user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                            >
                              {user.status === 'active' ? (
                                <ToggleRight className="w-5 h-5 text-accent" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </td>
                      </m.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Governance Modal */}
      <ManageUserModal
        user={selectedUser}
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
