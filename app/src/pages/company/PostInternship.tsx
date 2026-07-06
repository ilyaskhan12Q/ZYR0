import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';

export default function PostInternship() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['Certificate', 'LOR']);
  const [newBenefit, setNewBenefit] = useState('');

  const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(''); } };
  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));
  const addBenefit = () => { if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) { setBenefits([...benefits, newBenefit.trim()]); setNewBenefit(''); } };
  const removeBenefit = (b: string) => setBenefits(benefits.filter(be => be !== b));

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Internship Title *</label>
            <input type="text" placeholder="e.g., Software Engineering Intern"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <textarea rows={4} placeholder="Describe the internship..."
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Domain *</label>
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Select domain</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Data Science</option>
                <option>Marketing</option>
                <option>Business</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type *</label>
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Project-based</option>
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
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <input type="text" placeholder="e.g., San Francisco, CA"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Duration *</label>
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>1-3 months</option>
                <option>3-6 months</option>
                <option>6+ months</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Application Deadline *</label>
              <input type="date"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold">Compensation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stipend Type *</label>
              <select className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Academic Credit</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stipend Amount</label>
              <input type="text" placeholder="e.g., $3,500/month"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Benefits</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {benefits.map(b => (
                <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                  {b} <button onClick={() => removeBenefit(b)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBenefit()}
                placeholder="Add benefit..." className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
              <button onClick={addBenefit} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-sm rounded-full">
                {s} <button onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add skill..." className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
            <button onClick={addSkill} className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button onClick={() => navigate('/company/internships')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">
            <Send className="w-4 h-4" /> Publish
          </button>
        </div>
      </motion.div>
    </div>
  );
}
