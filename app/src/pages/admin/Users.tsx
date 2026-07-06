import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, GraduationCap, Building2, UserCheck, Eye, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { getAllUsers, updateUserStatus } from '@/services/users';

const tabs = ['All', 'Student', 'Company', 'Mentor', 'Admin'];

const roleConfig: Record<string, { color: string; icon: React.ElementType }> = {
  student: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: GraduationCap },
  company: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Building2 },
  mentor: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: UserCheck },
  admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield },
};

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      const roleFilter = activeTab === 'All' ? undefined : activeTab.toLowerCase();
      const res = await getAllUsers(0, 100, roleFilter);
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(userId, nextStatus as any);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update status');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab}
            </button>
          ))}
        </div>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const config = roleConfig[user.role] || roleConfig.student;
                    const RoleIcon = config.icon;
                    return (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name || 'User'}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-medium">{user.full_name || 'No Name Provided'}</p>
                              <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${config.color}`}>
                            <RoleIcon className="w-3 h-3" /> {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            user.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                          }`}>{user.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleStatus(user.id, user.status)}
                              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                              title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'active' ? (
                                <ToggleRight className="w-5 h-5 text-accent" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
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
