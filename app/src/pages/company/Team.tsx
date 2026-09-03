import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Shield, X, Trash2, Loader2, Send, RefreshCw, CheckCircle2, Clock, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyAccess } from '@/contexts/CompanyAccessContext';
import { getCompanyTeam, addTeamMember, updateTeamMember, removeTeamMember, resendTeamInvite, COMPANY_TEAM_ROLES, teamRoleLabel } from '@/services/companyTeam';
import { withTimeout } from '@/lib/timeout';
import { toast } from 'sonner';
import type { CompanyTeamMember, CompanyTeamRole } from '@/lib/database.types';

export default function CompanyTeam() {
  const { user } = useAuth();
  const { company, isOwner } = useCompanyAccess();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [members, setMembers] = useState<CompanyTeamMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<CompanyTeamRole>('mentor');
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!company?.id) return;
      setCompanyId(company.id);
      try {
        const teamResult = await withTimeout(getCompanyTeam(company.id), 10000, { data: [] }, 'CompanyTeamList');
        const data = teamResult?.data;
        if (data && !cancelled) setMembers(data);
      } catch (err) {
        console.error('Failed to load team:', err);
        toast.error('Failed to load team data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (company?.id) {
      load();
    } else if (user) {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [company, user]);

  async function handleAdd() {
    if (!companyId || !newEmail.trim()) return;
    setSubmitting(true);
    try {
      await addTeamMember({ company_id: companyId, name: newName, role: newRole, email: newEmail });
      toast.success(`Invitation sent to ${newEmail.trim()}`);
      setShowAdd(false);
      setNewEmail('');
      setNewName('');
      const { data } = await getCompanyTeam(companyId);
      if (data) setMembers(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(member: CompanyTeamMember) {
    if (member.user_id === user?.id) {
      toast.error('You cannot remove yourself from the team');
      return;
    }
    if (!isOwner && member.role === 'admin') {
      toast.error('Only the company owner can remove an administrator');
      return;
    }
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await removeTeamMember(member.id);
      toast.success('Member removed');
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  }

  async function handleRoleChange(member: CompanyTeamMember, role: CompanyTeamRole) {
    if (role === member.role) return;
    if (!isOwner && (member.role === 'admin' || role === 'admin')) {
      toast.error('Only the company owner can modify administrator roles');
      return;
    }
    setUpdatingRole(member.id);
    try {
      const { data, error } = await updateTeamMember(member.id, { role });
      if (error) throw error;
      toast.success(`${member.name} is now ${teamRoleLabel(role)}`);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? data : m)));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  }

  async function handleResend(member: CompanyTeamMember) {
    setResendingId(member.id);
    try {
      await resendTeamInvite(member.id);
      toast.success('Invitation email re-sent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
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
          <p className="text-sm text-muted-foreground mt-1">Invite team members and control what they can access</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPANY_TEAM_ROLES.map((r) => (
          <div key={r.value} className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">{r.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {members.filter((m) => m.role === r.value).length} member{members.filter((m) => m.role === r.value).length === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Invite Team Member</h3>
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
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as CompanyTeamRole)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                {COMPANY_TEAM_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleAdd} disabled={submitting || !newEmail.trim()}
                className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            They'll receive an email with a secure link. After signing in, they can access only the tabs their role allows.
          </p>
        </motion.div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {company && (
                <tr className="bg-muted/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                        {company.owner?.full_name ? company.owner.full_name.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {company.owner?.full_name || 'Company Owner'}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">Owner</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{company.email || company.owner?.department || 'Organization Primary'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs rounded-full font-medium">
                      <Crown className="w-3 h-3" /> Owner
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    Primary Owner
                  </td>
                </tr>
              )}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No invited team members yet. Invite members to manage your internship program.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                          alt="" className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          {member.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                          <Shield className="w-3 h-3" /> {teamRoleLabel(member.role)}
                        </span>
                        <select
                          value={member.role}
                          disabled={updatingRole === member.id || member.user_id === user?.id || (!isOwner && member.role === 'admin')}
                          onChange={(e) => handleRoleChange(member, e.target.value as CompanyTeamRole)}
                          title={member.user_id === user?.id ? 'You cannot change your own role' : !isOwner && member.role === 'admin' ? 'Only the owner can modify administrator roles' : 'Change role'}
                          className="px-2 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-40">
                          {COMPANY_TEAM_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {updatingRole === member.id && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {member.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-full font-medium">
                          <Clock className="w-3 h-3" /> Invited
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {member.status !== 'accepted' && (
                          <button onClick={() => handleResend(member)} disabled={resendingId === member.id}
                            className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-50" title="Resend invitation">
                            {resendingId === member.id ? <Loader2 className="w-4 h-4 text-accent animate-spin" /> : <RefreshCw className="w-4 h-4 text-accent" />}
                          </button>
                        )}
                        <button onClick={() => handleRemove(member)}
                          disabled={member.user_id === user?.id || (!isOwner && member.role === 'admin')}
                          className="p-1.5 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title={member.user_id === user?.id ? 'You cannot remove yourself' : !isOwner && member.role === 'admin' ? 'Only the owner can remove administrators' : 'Remove'}>
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