import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, GraduationCap, Calendar, Save, Plus, X, Upload, FileText, AlertCircle, CheckCircle2, RotateCcw, Sparkles, BookOpen, Briefcase, Phone } from 'lucide-react';
import { Loader, ButtonLoader } from '@/components/common/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { updateMyProfile, uploadAvatar, uploadResume } from '@/services/users';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FormState {
  name: string;
  email: string;
  phone: string;
  bio: string;
  university: string;
  degree: string;
  major: string;
  academic_year: string;
  graduation: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  role_interest: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  university?: string;
  degree?: string;
  graduation?: string;
  location?: string;
}

const MANDATORY_FIELDS: (keyof FormErrors)[] = ['name', 'phone', 'university', 'degree', 'graduation', 'location'];

export default function StudentProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    university: '',
    degree: '',
    major: '',
    academic_year: '',
    graduation: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    role_interest: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const draftKey = user ? `zyro_student_profile_draft_${user.id}` : null;

  // Compute server initial form data
  const getServerFormData = useCallback((): { form: FormState; skills: string[] } => {
    if (!profile || !user) {
      return {
        form: {
          name: '', email: '', phone: '', bio: '', university: '', degree: '',
          major: '', academic_year: '', graduation: '', location: '', linkedin: '',
          github: '', website: '', role_interest: ''
        },
        skills: []
      };
    }
    const meta = user.user_metadata || {};
    return {
      form: {
        name: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || meta.phone || '',
        bio: profile.bio || '',
        university: profile.university || '',
        degree: profile.degree || meta.degree || '',
        major: profile.major || meta.major || '',
        academic_year: profile.academic_year || meta.academic_year || '',
        graduation: profile.graduation_year ? profile.graduation_year.toString() : '',
        location: profile.location || meta.location || '',
        linkedin: profile.linkedin || meta.linkedin || '',
        github: profile.github || meta.github || '',
        website: profile.portfolio_url || '',
        role_interest: profile.role_interest || meta.role_interest || '',
      },
      skills: profile.skills || []
    };
  }, [profile, user]);

  // Load initial data and restore local draft if available
  useEffect(() => {
    if (!profile || !user || !draftKey) return;

    const serverData = getServerFormData();
    const savedDraftRaw = localStorage.getItem(draftKey);

    if (savedDraftRaw) {
      try {
        const parsed = JSON.parse(savedDraftRaw);
        if (parsed && parsed.form) {
          setForm({ ...serverData.form, ...parsed.form, email: user.email || '' });
          setSkills(parsed.skills || serverData.skills);
          setHasDraft(true);
          setIsDraftRestored(true);
          toast.info('Restored unsaved profile draft from previous session.', {
            description: 'You can keep editing or discard draft to restore saved values.'
          });
          return;
        }
      } catch (err) {
        console.error('Failed to parse profile draft:', err);
      }
    }

    setForm(serverData.form);
    setSkills(serverData.skills);
  }, [profile, user, draftKey, getServerFormData]);

  // Auto-save form draft to localStorage whenever user modifies values
  const saveDraft = (updatedForm: FormState, updatedSkills: string[]) => {
    if (!draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        form: updatedForm,
        skills: updatedSkills,
        updatedAt: new Date().toISOString(),
      }));
      setHasDraft(true);
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      validateForm(updated);
    }
    saveDraft(updated, skills);
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm(form);
  };

  // Validate required fields
  const validateForm = (currentForm: FormState): boolean => {
    const newErrors: FormErrors = {};

    if (!currentForm.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!currentForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!currentForm.university.trim()) {
      newErrors.university = 'University is required';
    }
    if (!currentForm.degree.trim()) {
      newErrors.degree = 'Degree / Major is required';
    }
    if (!currentForm.graduation.trim()) {
      newErrors.graduation = 'Expected graduation year is required';
    } else if (parseInt(currentForm.graduation, 10) < 2020 || parseInt(currentForm.graduation, 10) > 2035) {
      newErrors.graduation = 'Please enter a valid graduation year (2020 - 2035)';
    }
    if (!currentForm.location.trim()) {
      newErrors.location = 'Location (City, Country) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const discardDraft = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
    const serverData = getServerFormData();
    setForm(serverData.form);
    setSkills(serverData.skills);
    setHasDraft(false);
    setIsDraftRestored(false);
    setErrors({});
    setTouched({});
    toast.success('Draft discarded. Restored saved profile data.');
  };

  const handleSave = async () => {
    // Touch all fields to show red error outlines if mandatory fields are missing
    const allTouched: Record<string, boolean> = {};
    MANDATORY_FIELDS.forEach(f => { allTouched[f] = true; });
    setTouched(allTouched);

    const isValid = validateForm(form);

    if (!isValid) {
      toast.error('Please fill in all mandatory fields highlighted in red.', {
        description: 'Required: Full Name, Phone, University, Degree, Graduation Year, and Location.'
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Update Profile in Supabase DB
      const { error: dbErr } = await updateMyProfile({
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        university: form.university.trim(),
        degree: form.degree.trim(),
        major: form.major.trim(),
        academic_year: form.academic_year.trim(),
        graduation_year: form.graduation ? parseInt(form.graduation, 10) : null,
        location: form.location.trim(),
        linkedin: form.linkedin.trim(),
        github: form.github.trim(),
        bio: form.bio.trim(),
        skills: skills,
        portfolio_url: form.website.trim(),
        role_interest: form.role_interest.trim(),
      });

      if (dbErr) throw dbErr;

      // 2. Update Auth User Metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: form.name.trim(),
          phone: form.phone.trim(),
          degree: form.degree.trim(),
          major: form.major.trim(),
          academic_year: form.academic_year.trim(),
          location: form.location.trim(),
          linkedin: form.linkedin.trim(),
          github: form.github.trim(),
          role_interest: form.role_interest.trim(),
        }
      });

      if (authErr) throw authErr;

      // Clean draft upon successful save
      if (draftKey) {
        localStorage.removeItem(draftKey);
      }
      setHasDraft(false);
      setIsDraftRestored(false);

      await refreshProfile();
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile. Unsaved changes kept in draft.');
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
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updatedSkills = [...skills, trimmed];
      setSkills(updatedSkills);
      setNewSkill('');
      saveDraft(form, updatedSkills);
    }
  };

  const removeSkill = (s: string) => {
    const updatedSkills = skills.filter(sk => sk !== s);
    setSkills(updatedSkills);
    saveDraft(form, updatedSkills);
  };

  // Calculate live profile completion score
  const calculateCompletion = () => {
    let score = 0;
    const missing: string[] = [];

    if (form.name.trim()) score += 15; else missing.push('Full Name');
    if (profile?.avatar_url) score += 10; else missing.push('Profile Photo');
    if (form.phone.trim()) score += 10; else missing.push('Phone Number');
    if (form.university.trim()) score += 15; else missing.push('University');
    if (form.degree.trim()) score += 10; else missing.push('Degree / Major');
    if (form.graduation.trim()) score += 10; else missing.push('Graduation Year');
    if (form.location.trim()) score += 10; else missing.push('Location');
    if (form.bio.trim()) score += 5; else missing.push('Bio');
    if (skills.length > 0) score += 10; else missing.push('Skills');
    if (profile?.resume_url) score += 5; else missing.push('Resume');

    return { percentage: Math.min(100, score), missing };
  };

  if (!profile || !user) {
    return <Loader variant="page" text="Loading profile..." />;
  }

  const { percentage, missing } = calculateCompletion();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Student Profile</h1>
          <p className="text-sm text-muted-foreground">Keep your student profile updated for internship applications and mentor reviews.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasDraft && (
            <button
              type="button"
              onClick={discardDraft}
              className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors"
              title="Discard unsaved changes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard Draft
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <ButtonLoader loading={true} loadingText="Saving..." />
            ) : (
              <><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}</>
            )}
          </button>
        </div>
      </div>

      {/* Restored Draft Alert Banner */}
      {isDraftRestored && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-semibold">Unsaved Draft Restored:</span> Your previous in-progress entries were automatically preserved.
            </div>
          </div>
          <button onClick={discardDraft} className="text-xs underline hover:no-underline font-medium flex-shrink-0">
            Discard Draft
          </button>
        </motion.div>
      )}

      {/* Profile Completion Meter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${percentage === 100 ? 'text-emerald-500' : 'text-accent'}`} />
            <span className="font-semibold text-sm">Profile Completeness</span>
          </div>
          <span className="text-sm font-bold text-accent">{percentage}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Missing items:</span> {missing.join(', ')}
          </p>
        )}
      </motion.div>

      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}`} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl object-cover border border-border shadow-sm" 
            />
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 cursor-pointer transition-transform hover:scale-105">
              {uploadingAvatar ? (
                <Loader variant="inline" size={16} />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-base">Profile Photo</h3>
            <p className="text-sm text-muted-foreground">Upload a professional photo for companies and mentors. JPG, PNG, or GIF. Max 2MB.</p>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <User className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-base">Basic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center justify-between">
              <span>Full Name <span className="text-red-500">*</span></span>
            </label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Alex Johnson"
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.name && errors.name 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.name && errors.name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email (Verified Account)</label>
            <input 
              type="email" 
              value={form.email} 
              readOnly
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed" 
            />
          </div>

          {/* Phone (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              value={form.phone} 
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.phone && errors.phone 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.phone && errors.phone && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Location (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Location (City, Country) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={form.location} 
              onChange={(e) => handleFieldChange('location', e.target.value)}
              onBlur={() => handleBlur('location')}
              placeholder="e.g. San Francisco, CA"
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.location && errors.location 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.location && errors.location && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.location}
              </p>
            )}
          </div>
        </div>

        {/* Primary Role / Internship Interest */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Primary Role Interest</label>
          <input 
            type="text" 
            value={form.role_interest} 
            onChange={(e) => handleFieldChange('role_interest', e.target.value)}
            placeholder="e.g. Full-Stack Engineer, Frontend Developer, Data Analyst"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" 
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Professional Summary / Bio</label>
          <textarea 
            rows={3} 
            value={form.bio} 
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            placeholder="Briefly describe your background, career interests, and academic focus..."
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm" 
          />
        </div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <GraduationCap className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-base">Education & Academic Background</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* University (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              University / Institute <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={form.university} 
              onChange={(e) => handleFieldChange('university', e.target.value)}
              onBlur={() => handleBlur('university')}
              placeholder="e.g. Stanford University"
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.university && errors.university 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.university && errors.university && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.university}
              </p>
            )}
          </div>

          {/* Degree / Program (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Degree / Program <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={form.degree} 
              onChange={(e) => handleFieldChange('degree', e.target.value)}
              onBlur={() => handleBlur('degree')}
              placeholder="e.g. B.S. Computer Science"
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.degree && errors.degree 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.degree && errors.degree && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.degree}
              </p>
            )}
          </div>

          {/* Major / Specialization */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Major / Specialization</label>
            <input 
              type="text" 
              value={form.major} 
              onChange={(e) => handleFieldChange('major', e.target.value)}
              placeholder="e.g. Software Engineering, AI & ML"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" 
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Academic Year / Semester</label>
            <select
              value={form.academic_year}
              onChange={(e) => handleFieldChange('academic_year', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
            >
              <option value="">Select current status...</option>
              <option value="1st Year">1st Year / Freshman</option>
              <option value="2nd Year">2nd Year / Sophomore</option>
              <option value="3rd Year">3rd Year / Junior</option>
              <option value="4th Year">4th Year / Senior</option>
              <option value="Postgraduate">Postgraduate / Masters</option>
              <option value="Recent Graduate">Recent Graduate</option>
            </select>
          </div>

          {/* Expected Graduation Year (Mandatory) */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Expected Graduation Year <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              placeholder="2026" 
              value={form.graduation} 
              onChange={(e) => handleFieldChange('graduation', e.target.value)}
              onBlur={() => handleBlur('graduation')}
              className={`w-full px-3 py-2.5 bg-background border rounded-lg focus:outline-none transition-colors ${
                touched.graduation && errors.graduation 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-border focus:ring-2 focus:ring-accent/20'
              }`} 
            />
            {touched.graduation && errors.graduation && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.graduation}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Resume Upload */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-base">Resume / CV</h3>
          </div>
          {profile.resume_url && (
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-semibold rounded-full">
              Uploaded
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              {profile.resume_url ? (
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-accent hover:underline font-medium block"
                >
                  View Active Resume
                </a>
              ) : (
                <p className="text-sm font-medium text-foreground">No resume uploaded yet.</p>
              )}
              <p className="text-xs text-muted-foreground">Supported: PDF or Word documents. Max file size: 5MB.</p>
            </div>
          </div>
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted cursor-pointer transition-colors shadow-sm">
            {uploadingResume ? (
              <ButtonLoader loading={true} loadingText="Uploading..." />
            ) : (
              <><Upload className="w-4 h-4" /> Upload New Resume</>
            )}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" disabled={uploadingResume} />
          </label>
        </div>
      </motion.div>

      {/* Technical Skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <BookOpen className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-base">Skills & Competencies</h3>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-3 bg-muted/30 border border-border rounded-xl">
          {skills.length === 0 ? (
            <span className="text-xs text-muted-foreground">No skills added yet. Type below and click Add or press Enter.</span>
          ) : (
            skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-medium text-sm rounded-full">
                {s} 
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-accent-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={newSkill} 
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill (e.g. React, TypeScript, Python, Node.js)..."
            className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" 
          />
          <button 
            type="button" 
            onClick={addSkill} 
            className="px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </motion.div>

      {/* Online Profiles & Portfolios */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Briefcase className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-base">Online Profiles & Social Links</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">LinkedIn Profile</label>
            <input 
              type="text" 
              value={form.linkedin} 
              onChange={(e) => handleFieldChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" 
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">GitHub Profile</label>
            <input 
              type="text" 
              value={form.github} 
              onChange={(e) => handleFieldChange('github', e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" 
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Portfolio / Personal Website</label>
            <input 
              type="text" 
              value={form.website} 
              onChange={(e) => handleFieldChange('website', e.target.value)}
              placeholder="https://mywebsite.dev"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

