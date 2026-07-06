import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, X, UserCog, Trash2 } from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@techflow.io', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=sarah', status: 'Active' },
  { id: '2', name: 'John Smith', email: 'john@techflow.io', role: 'HR Manager', avatar: 'https://i.pravatar.cc/150?u=john', status: 'Active' },
  { id: '3', name: 'Lisa Wang', email: 'lisa@techflow.io', role: 'Mentor', avatar: 'https://i.pravatar.cc/150?u=lisa', status: 'Active' },
  { id: '4', name: 'Robert Lee', email: 'robert@techflow.io', role: 'Reviewer', avatar: 'https://i.pravatar.cc/150?u=robert', status: 'Invited' },
];

export default function CompanyTeam() {
  const [showAdd, setShowAdd] = useState(false);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" placeholder="colleague@company.com"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Role</label>
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Admin</option>
                <option>HR Manager</option>
                <option>Mentor</option>
                <option>Reviewer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">Send Invite</button>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamMembers.map((member) => (
                <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                      <Shield className="w-3 h-3" /> {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{member.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-muted rounded-lg" title="Edit role"><UserCog className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Remove"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
