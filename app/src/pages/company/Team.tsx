import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, X, UserCog, Trash2, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getCompanyTeam, addTeamMember, updateTeamMember, removeTeamMember } from '@/services/companyTeam';

export default function CompanyTeam() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Mentor');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompanyId(co.id);
        const { data } = await getCompanyTeam(co.id);
        if (data) setMembers(data);
      }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  async function handleAdd() {
    if (!companyId || !newEmail.trim()) return;
    setSubmitting(true);
    const name = newName.trim() || newEmail.split('@')[0];
    const { data } = await addTeamMember({ company_id: companyId, name, role: newRole, email: newEmail });
    if (data) setMembers((prev) => [...prev, data]);
    setSubmitting(false);
    setShowAdd(false);
    setNewEmail('');
    setNewName('');
  }

  async function handleRemove(id: string) {
    await removeTeamMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team members and their roles</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add Team Member</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="colleague@company.com"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Admin</option>
                <option>HR Manager</option>
                <option>Mentor</option>
                <option>Reviewer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleAdd} disabled={submitting || !newEmail.trim()}
                className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No team members yet. Add members to manage your internship program.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`} alt="" className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                        <Shield className="w-3 h-3" /> {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleRemove(member.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Remove">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
