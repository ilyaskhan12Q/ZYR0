import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, GraduationCap, Calendar, Save, Plus, X, Upload, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateMyProfile, uploadAvatar, uploadResume } from '@/services/users';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    university: '',
    degree: '',
    graduation: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Load profile data when available
  useEffect(() => {
    if (profile && user) {
      const meta = user.user_metadata || {};
      setForm({
        name: profile.full_name || '',
        email: user.email || '',
        phone: meta.phone || '',
        bio: profile.bio || '',
        university: profile.university || '',
        degree: meta.degree || '',
        graduation: profile.graduation_year ? profile.graduation_year.toString() : '',
        location: meta.location || '',
        linkedin: meta.linkedin || '',
        github: meta.github || '',
        website: profile.portfolio_url || '',
      });
      setSkills(profile.skills || []);
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // 1. Update Profile in DB
      await updateMyProfile({
        full_name: form.name,
        university: form.university,
        graduation_year: form.graduation ? parseInt(form.graduation, 10) : null,
        bio: form.bio,
        skills: skills,
        portfolio_url: form.website,
      });

      // 2. Update metadata in Auth
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          phone: form.phone,
          degree: form.degree,
          location: form.location,
          linkedin: form.linkedin,
          github: form.github,
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

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResume(true);
      await uploadResume(file);
      await refreshProfile();
      toast.success('Resume uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));

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
        <h1 className="text-2xl font-bold">Edit Profile</h1>
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

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}`} 
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
            <h3 className="font-semibold">Profile Photo</h3>
            <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Basic Information</h3>
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
            <label className="text-sm font-medium mb-1.5 block">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Bio</label>
          <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
        </div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Education</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">University</label>
            <input type="text" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Degree</label>
            <input type="text" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Expected Graduation Year</label>
            <input type="number" placeholder="2025" value={form.graduation} onChange={(e) => setForm({ ...form, graduation: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
      </motion.div>

      {/* Resume Upload */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Resume</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
            <div>
              {profile.resume_url ? (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline font-medium block">
                  View Uploaded Resume
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
              )}
              <p className="text-xs text-muted-foreground">PDF or Word documents. Max 5MB.</p>
            </div>
          </div>
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted cursor-pointer transition-colors">
            {uploadingResume ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload New Resume
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" disabled={uploadingResume} />
          </label>
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-full">
              {s} <button onClick={() => removeSkill(s)} className="hover:text-accent-foreground"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
          <button onClick={addSkill} className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">LinkedIn URL</label>
            <input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="linkedin.com/in/username"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">GitHub URL</label>
            <input type="text" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}
              placeholder="github.com/username"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Portfolio / Website</label>
            <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://mywebsite.com"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
