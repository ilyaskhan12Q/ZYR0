import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  GraduationCap,
  Building2,
  UserCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, UserRole, UserStatus, PlanTier } from '@/lib/database.types';
import { updateUserRole, updateUserStatus, updateUserPlanTier } from '@/services/users';

interface ManageUserModalProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (updatedUser: Profile) => void;
}

const ROLES: { id: UserRole; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-blue-500' },
  { id: 'mentor', label: 'Mentor', icon: UserCheck, color: 'text-purple-500' },
  { id: 'company', label: 'Company', icon: Building2, color: 'text-emerald-500' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'text-red-500' },
];

const PLANS: { id: PlanTier; label: string; desc: string; badge: string; color: string }[] = [
  { id: 'free', label: 'Free', desc: 'Standard access (20 req/min)', badge: 'Default', color: 'border-border' },
  { id: 'go', label: 'ZYR0 GO', desc: '5× faster synthesis, verified exports', badge: '$4.99/mo', color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400' },
  { id: 'plus', label: 'ZYR0 PLUS', desc: 'Deep reasoning, priority compute queue', badge: '$9.99/mo', color: 'border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
  { id: 'enterprise', label: 'Enterprise', desc: 'Custom institutional access & SchoolOS', badge: 'Custom', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
];

const STATUSES: { id: UserStatus; label: string; desc: string; color: string }[] = [
  { id: 'active', label: 'Active', desc: 'Full account access', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'suspended', label: 'Suspended', desc: 'Restricted from all routes', color: 'text-red-600 dark:text-red-400 border-red-500/30' },
  { id: 'inactive', label: 'Inactive', desc: 'Deactivated account', color: 'text-muted-foreground border-border' },
];

export default function ManageUserModal({
  user: targetUser,
  open,
  onOpenChange,
  onUserUpdated,
}: ManageUserModalProps) {
  const { user: currentAdmin } = useAuth();
  const isSelf = currentAdmin?.id === targetUser?.id;

  const [role, setRole] = useState<UserRole>('student');
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [status, setStatus] = useState<UserStatus>('active');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state when modal opens or target changes
  useEffect(() => {
    if (targetUser) {
      setRole(targetUser.role || 'student');
      setPlanTier(targetUser.plan_tier || 'free');
      setStatus(targetUser.status || 'active');
      setReason(targetUser.status_reason || '');
    }
  }, [targetUser, open]);

  if (!targetUser) return null;

  const hasChanges =
    role !== targetUser.role ||
    planTier !== (targetUser.plan_tier || 'free') ||
    status !== targetUser.status ||
    (status === 'suspended' && reason !== (targetUser.status_reason || ''));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    // Require reason if suspending
    if (status === 'suspended' && !reason.trim()) {
      toast.error('A reason is required when suspending an account.');
      return;
    }

    setLoading(true);
    let updated = { ...targetUser };

    try {
      // 1. Role Update
      if (role !== targetUser.role) {
        if (isSelf) {
          throw new Error('You cannot modify your own administrative role.');
        }
        await updateUserRole(targetUser.id, role, {
          reason: reason.trim() || `Admin role change to ${role}`,
          actorId: currentAdmin?.id,
        });
        updated.role = role;
      }

      // 2. Plan Tier Update
      if (planTier !== (targetUser.plan_tier || 'free')) {
        await updateUserPlanTier(targetUser.id, planTier, {
          reason: reason.trim() || `Admin plan grant to ${planTier}`,
          actorId: currentAdmin?.id,
        });
        updated.plan_tier = planTier;
      }

      // 3. Status Update
      if (status !== targetUser.status || (status === 'suspended' && reason !== targetUser.status_reason)) {
        if (isSelf && (status === 'suspended' || status === 'inactive')) {
          throw new Error('You cannot suspend or deactivate your own administrator account.');
        }
        await updateUserStatus(targetUser.id, status, {
          reason: reason.trim() || undefined,
          actorId: currentAdmin?.id,
        });
        updated.status = status;
        updated.status_reason = status === 'suspended' ? reason.trim() : null;
      }

      toast.success(`Updated governance for ${targetUser.full_name || targetUser.email || 'User'}`);
      onUserUpdated(updated);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update user governance:', err);
      toast.error(err.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 border border-border bg-card text-foreground rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={targetUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.full_name || 'User')}`}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-border shadow-xs"
                />
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {targetUser.full_name || 'No Name Provided'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{targetUser.email || 'No email attached'}</span>
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {isSelf && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You are viewing your own administrator account. Self-demotion and self-suspension are blocked.</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Section 1: Role Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Platform Role</span>
              {isSelf && <span className="text-[10px] text-muted-foreground font-normal">(Locked for self)</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={isSelf}
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border hover:bg-muted/40'
                    } ${isSelf ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${r.color}`} />
                    <div>
                      <p className="text-xs font-semibold">{r.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Plan Tier Override */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Subscription & Plan Tier</span>
              {targetUser.plan_granted_by && (
                <span className="text-[10px] text-accent font-normal">Manually granted</span>
              )}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PLANS.map((p) => {
                const isSelected = planTier === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanTier(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{p.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Account Status */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => {
                const isSelected = status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isSelf && s.id !== 'active'}
                    onClick={() => setStatus(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border hover:bg-muted/40'
                    } ${isSelf && s.id !== 'active' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{s.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Audit & Suspension Reason */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Audit Note / Reason</span>
              {status === 'suspended' && (
                <span className="text-[10px] text-destructive font-semibold">Required for suspension</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder={
                status === 'suspended'
                  ? 'Mandatory: Provide clear reason for suspending this account...'
                  : 'Optional: Document reason for this administrative change (saved to audit logs)...'
              }
              className="w-full px-3.5 py-2.5 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="px-5 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Governance Changes</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
