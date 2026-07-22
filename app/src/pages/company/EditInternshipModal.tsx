import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, AlertCircle, Loader2, Info, Calendar, DollarSign, MapPin, Users, CheckCircle2 } from 'lucide-react';
import type { Internship, LocationType, InternshipType, StipendType, ExperienceLevel, InternshipStatus } from '@/lib/database.types';
import { updateInternship, getAcceptedCountForInternship } from '@/services/internships';
import { toast } from 'sonner';

interface EditInternshipModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Internship) => void;
}

export default function EditInternshipModal({
  internship,
  isOpen,
  onClose,
  onSuccess,
}: EditInternshipModalProps) {
  if (!isOpen || !internship) return null;

  // Accepted interns count
  const [acceptedCount, setAcceptedCount] = useState<number>(0);
  const [loadingAccepted, setLoadingAccepted] = useState(true);

  // Form State
  const [title, setTitle] = useState(internship.title || '');
  const [description, setDescription] = useState(internship.description || '');
  const [domain, setDomain] = useState(internship.domain || 'Engineering');
  const [type, setType] = useState<InternshipType>(internship.type || 'Full-time');
  const [locationType, setLocationType] = useState<LocationType>(internship.location_type || 'Remote');
  const [location, setLocation] = useState(internship.location || '');
  const [duration, setDuration] = useState(internship.duration || '3-6 months');
  const [deadline, setDeadline] = useState(
    internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : ''
  );
  const [startDate, setStartDate] = useState(
    internship.start_date ? new Date(internship.start_date).toISOString().split('T')[0] : ''
  );
  const [stipendType, setStipendType] = useState<StipendType>(internship.stipend_type || 'Paid');
  const [stipend, setStipend] = useState(internship.stipend || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(internship.experience_level || 'Beginner');
  const [educationLevel, setEducationLevel] = useState(internship.education_level || '');
  const [openings, setOpenings] = useState<number>(internship.openings || 1);
  const [status, setStatus] = useState<InternshipStatus>(internship.status || 'Active');

  // Arrays
  const [skills, setSkills] = useState<string[]>(internship.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [benefits, setBenefits] = useState<string[]>(internship.benefits || []);
  const [newBenefit, setNewBenefit] = useState('');

  const [responsibilities, setResponsibilities] = useState<string[]>(internship.responsibilities || []);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>(internship.requirements || []);
  const [newReq, setNewReq] = useState('');

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Load accepted intern count for minimum openings constraint
  useEffect(() => {
    let isMounted = true;
    async function loadAccepted() {
      setLoadingAccepted(true);
      try {
        const count = await getAcceptedCountForInternship(internship!.id);
        if (isMounted) setAcceptedCount(count);
      } catch {
        if (isMounted) setAcceptedCount(0);
      } finally {
        if (isMounted) setLoadingAccepted(false);
      }
    }
    loadAccepted();
    return () => { isMounted = false; };
  }, [internship.id]);

  // Dirty check helper
  const isDirty =
    title !== (internship.title || '') ||
    description !== (internship.description || '') ||
    domain !== (internship.domain || 'Engineering') ||
    type !== (internship.type || 'Full-time') ||
    locationType !== (internship.location_type || 'Remote') ||
    location !== (internship.location || '') ||
    duration !== (internship.duration || '3-6 months') ||
    deadline !== (internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : '') ||
    startDate !== (internship.start_date ? new Date(internship.start_date).toISOString().split('T')[0] : '') ||
    stipendType !== (internship.stipend_type || 'Paid') ||
    stipend !== (internship.stipend || '') ||
    experienceLevel !== (internship.experience_level || 'Beginner') ||
    educationLevel !== (internship.education_level || '') ||
    openings !== (internship.openings || 1) ||
    status !== (internship.status || 'Active') ||
    JSON.stringify(skills) !== JSON.stringify(internship.skills || []) ||
    JSON.stringify(benefits) !== JSON.stringify(internship.benefits || []) ||
    JSON.stringify(responsibilities) !== JSON.stringify(internship.responsibilities || []) ||
    JSON.stringify(requirements) !== JSON.stringify(internship.requirements || []);

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Add / remove array items
  const addSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (item: string) => setSkills(skills.filter(s => s !== item));

  const addBenefit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };
  const removeBenefit = (item: string) => setBenefits(benefits.filter(b => b !== item));

  const addResp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newResp.trim() && !responsibilities.includes(newResp.trim())) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };
  const removeResp = (item: string) => setResponsibilities(responsibilities.filter(r => r !== item));

  const addReq = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newReq.trim() && !requirements.includes(newReq.trim())) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };
  const removeReq = (item: string) => setRequirements(requirements.filter(r => r !== item));

  // Form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (locationType !== 'Remote' && !location.trim()) {
      setError('Location is required for On-site or Hybrid internships.');
      return;
    }
    if (stipendType === 'Paid' && !stipend.trim()) {
      setError('Stipend amount is required when Stipend Type is Paid.');
      return;
    }
    const minOpenings = Math.max(1, acceptedCount);
    if (openings < minOpenings) {
      setError(`Cannot set openings to ${openings}. ${acceptedCount} intern(s) have already accepted offer letters for this internship.`);
      return;
    }

    setSubmitting(true);
    try {
      const updates: Partial<Internship> = {
        title: title.trim(),
        description: description.trim(),
        domain,
        type,
        location_type: locationType,
        location: locationType === 'Remote' ? 'Remote' : location.trim(),
        duration,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        stipend_type: stipendType,
        stipend: stipendType === 'Unpaid' ? 'Unpaid' : stipend.trim(),
        experience_level: experienceLevel,
        education_level: educationLevel.trim() || null,
        openings: Number(openings),
        status,
        skills,
        benefits,
        responsibilities,
        requirements,
      };

      const { data: updatedData, error: err } = await updateInternship(internship!.id, updates, internship!.company_id);
      if (err) throw err;

      toast.success('Internship updated successfully!');
      onSuccess(updatedData as Internship);
      onClose();
    } catch (err: any) {
      console.error('Failed to update internship:', err);
      setError(err.message || 'Failed to update internship.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div>
              <h2 className="text-xl font-bold">Edit Internship</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update details for <span className="font-semibold text-foreground">{internship.title}</span>
              </p>
            </div>
            <button
              onClick={handleAttemptClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Accepted Interns Info Banner */}
            <div className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{acceptedCount}</strong> accepted intern{acceptedCount !== 1 ? 's' : ''} enrolled. Minimum openings allowed: <strong>{Math.max(1, acceptedCount)}</strong>.
                </span>
              </div>
              <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full font-medium">
                ID: {internship.id.slice(0, 8)}
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Information</h3>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Domain *</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Data Science</option>
                    <option>Marketing</option>
                    <option>Business</option>
                    <option>Research</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InternshipType)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Project-based">Project-based</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InternshipStatus)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 font-medium"
                  >
                    <option value="Active">Active (Published)</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Dates */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Location &amp; Schedule</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Location Type *</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as LocationType)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={locationType === 'Remote'}
                    placeholder={locationType === 'Remote' ? 'Remote' : 'e.g., San Francisco, CA'}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Duration *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>6+ months</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Capacity */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Capacity &amp; Compensation</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Openings *</label>
                  <input
                    type="number"
                    min={Math.max(1, acceptedCount)}
                    value={openings}
                    onChange={(e) => setOpenings(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 font-bold text-accent"
                    required
                  />
                  {acceptedCount > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Min: {acceptedCount} (accepted count)
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Stipend Type *</label>
                  <select
                    value={stipendType}
                    onChange={(e) => setStipendType(e.target.value as StipendType)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Academic Credit">Academic Credit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Stipend Amount</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    disabled={stipendType === 'Unpaid'}
                    placeholder={stipendType === 'Unpaid' ? 'Unpaid' : 'e.g., $3,500/month'}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Education Level</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="e.g., Bachelor's in CS / IT"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Lists: Responsibilities, Requirements, Skills, Benefits */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Responsibilities &amp; Requirements</h3>

              {/* Responsibilities */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Responsibilities</label>
                <div className="space-y-2 mb-2">
                  {responsibilities.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                      <span className="truncate pr-2">• {r}</span>
                      <button type="button" onClick={() => removeResp(r)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addResp(e)}
                    placeholder="Add key responsibility..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button type="button" onClick={() => addResp()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Requirements</label>
                <div className="space-y-2 mb-2">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                      <span className="truncate pr-2">• {req}</span>
                      <button type="button" onClick={() => removeReq(req)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addReq(e)}
                    placeholder="Add requirement..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button type="button" onClick={() => addReq()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent text-sm rounded-full font-medium">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                    placeholder="Add skill (e.g. React, Python)..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button type="button" onClick={() => addSkill()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Benefits &amp; Perks</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {benefits.map(b => (
                    <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-full font-medium">
                      {b}
                      <button type="button" onClick={() => removeBenefit(b)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addBenefit(e)}
                    placeholder="Add benefit (e.g. Certificate, LOR)..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button type="button" onClick={() => addBenefit()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleAttemptClose}
                disabled={submitting}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </form>

          {/* Discard Confirmation Modal Overlay */}
          {showDiscardConfirm && (
            <div className="absolute inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full space-y-4 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div>
                  <h4 className="font-bold">Discard Unsaved Changes?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    You have modified this internship. Closing now will discard your changes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDiscardConfirm(false)}
                    className="flex-1 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscardConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
