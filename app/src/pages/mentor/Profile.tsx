import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Building, Save, Upload, Loader2, Link as LinkIcon, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateMyProfile, uploadAvatar } from '@/services/users';
import { getCompanyById } from '@/services/companies';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function MentorProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    title: '',
    department: '',
  });

  // Load profile data when available
  useEffect(() => {
    if (profile && user) {
      const meta = user.user_metadata || {};
      setForm({
        name: profile.full_name || '',
        email: user.email || '',
        phone: meta.phone || '',
        bio: profile.bio || '',
        title: profile.title || '',
        department: profile.department || '',
      });

      // Fetch company if company_id is present
      if (profile.company_id) {
        setLoadingCompany(true);
        getCompanyById(profile.company_id)
          .then(({ data, error }) => {
            if (error) console.error('Error fetching company details:', error);
            else setCompany(data);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingCompany(false));
      }
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // 1. Update Profile in DB
      await updateMyProfile({
        full_name: form.name,
        title: form.title,
        department: form.department,
        bio: form.bio,
      });

      // 2. Update metadata in Auth
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          phone: form.phone,
        }
      });

      if (authErr) throw authErr;

      await refreshProfile();
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      await uploadAvatar(file);
      await refreshProfile();
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentor Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your professional information and bio</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'Mentor')}`} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl object-cover border border-border" 
            />
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 cursor-pointer">
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{form.name || 'Your Name'}</h3>
            <p className="text-sm text-muted-foreground">
              {form.title ? `${form.title}` : 'Mentor' } 
              {form.department ? ` • ${form.department}` : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Professional Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email (Read Only)</label>
            <input type="email" value={form.email} readOnly
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Job Title</label>
            <input type="text" placeholder="e.g. Lead Backend Engineer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Department</label>
            <input type="text" placeholder="e.g. Engineering" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Short Bio</label>
          <textarea rows={4} placeholder="Describe your background and what topics you can mentor in..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
        </div>
      </motion.div>

      {/* Corporate Affiliation (Read-Only) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Building className="w-4 h-4 text-accent" /> Company Association
          </h3>
          <span className="text-xs px-2.5 py-1 bg-muted border border-border rounded-full text-muted-foreground font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Assigned by Admin
          </span>
        </div>
        
        {loadingCompany ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : company ? (
          <div className="flex items-start gap-4 p-4 bg-muted/30 border border-border rounded-xl">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-xl border border-border object-contain bg-white" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-lg flex items-center justify-center">
                {company.name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">{company.name}</h4>
              <p className="text-sm text-muted-foreground">{company.industry || 'No Industry Specified'}</p>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1 font-medium">
                  <LinkIcon className="w-3.5 h-3.5" /> Visit Website
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            You are not currently associated with any company. Please contact an administrator to get assigned.
          </div>
        )}
      </motion.div>
    </div>
  );
}
