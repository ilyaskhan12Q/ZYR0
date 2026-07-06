import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Plus, X, Loader2 } from 'lucide-react';
import { getMyCompany } from '@/services/companies';
import { createInternship } from '@/services/internships';
import { useAuth } from '@/contexts/AuthContext';

export default function PostInternship() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Engineering');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Project-based'>('Full-time');
  const [locationType, setLocationType] = useState<'Remote' | 'On-site' | 'Hybrid'>('Remote');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('3-6 months');
  const [deadline, setDeadline] = useState('');
  const [stipendType, setStipendType] = useState<'Paid' | 'Unpaid' | 'Academic Credit'>('Paid');
  const [stipend, setStipend] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['Certificate', 'LOR']);
  const [newBenefit, setNewBenefit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data } = await getMyCompany();
        if (data) {
          setCompany(data);
        } else {
          setError('Please complete your company profile first.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load company profile.');
      } finally {
        setLoadingCompany(false);
      }
    }
    if (user) {
      loadCompany();
    }
  }, [user]);

  const addSkill = (e?: React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));
  
  const addBenefit = (e?: React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };
  
  const removeBenefit = (b: string) => setBenefits(benefits.filter(be => be !== b));

  async function handleSubmit(status: 'Active' | 'Draft') {
    if (!company) {
      setError('No company associated with your account.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields (*).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: err } = await createInternship({
        company_id: company.id,
        title: title.trim(),
        description: description.trim(),
        domain,
        type,
        location_type: locationType,
        location: locationType === 'Remote' ? 'Remote' : location.trim(),
        duration,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        stipend_type: stipendType,
        stipend: stipendType === 'Unpaid' ? 'Unpaid' : stipend.trim(),
        benefits,
        skills,
        status,
        posted_date: new Date().toISOString(),
        created_by: user?.id || null,
        responsibilities: [],
        requirements: [],
        openings: 1,
      });

      if (err) throw err;
      navigate('/company/internships');
    } catch (err: any) {
      setError(err.message || 'Failed to submit internship.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/company/internships')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Post New Internship</h1>
          <p className="text-sm text-muted-foreground">Create a new internship opportunity</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {!company ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-4">
          <p className="text-muted-foreground">You must create a company profile first before posting internships.</p>
          <button onClick={() => navigate('/company/profile')} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">
            Create Company Profile
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Internship Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineering Intern"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the internship duties, requirements, and projects..."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Domain *</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
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
                <label className="text-sm font-medium mb-1.5 block">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Project-based">Project-based</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Location Type *</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={locationType === 'Remote'}
                  placeholder={locationType === 'Remote' ? 'Remote' : 'e.g., San Francisco, CA'}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-55"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option>1-3 months</option>
                  <option>3-6 months</option>
                  <option>6+ months</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Application Deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Compensation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stipend Type *</label>
                <select
                  value={stipendType}
                  onChange={(e) => setStipendType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Academic Credit">Academic Credit</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stipend Amount</label>
                <input
                  type="text"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  disabled={stipendType === 'Unpaid'}
                  placeholder={stipendType === 'Unpaid' ? 'Unpaid' : 'e.g., $3,500/month'}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-55"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Benefits</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {benefits.map(b => (
                  <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                    {b} <button type="button" onClick={() => removeBenefit(b)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBenefit(e)}
                  placeholder="Add benefit..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button type="button" onClick={() => addBenefit()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-sm rounded-full">
                  {s} <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                placeholder="Add skill..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button type="button" onClick={() => addSkill()} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('Active')}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
