import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { submitProductLead } from '@/services/leadService';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface BookDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookDemoModal({ open, onOpenChange }: BookDemoModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'Hiring Manager / Founder',
    interest: 'ZYR0 Work (Company Internships & Hiring)',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid official or work email address.');
      return;
    }

    setSubmitting(true);
    const result = await submitProductLead({
      email: formData.email,
      name: formData.name,
      institutionName: formData.organization,
      role: formData.role,
      notes: `Interest: ${formData.interest} | Notes: ${formData.notes}`,
      product: formData.interest.includes('SchoolOS') ? 'school_os' : 'work',
    });
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      toast.success('Demonstration request received! Our partnership team will contact you within 24 hours.');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      organization: '',
      role: 'Hiring Manager / Founder',
      interest: 'ZYR0 Work (Company Internships & Hiring)',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 w-fit">
            <Sparkles className="w-3 h-3" />
            Enterprise & Institutional
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-serif font-normal text-foreground">
            Book an Organizational Walkthrough
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Schedule a personalized 30-minute demonstration of ZYR0 Work intern management or SchoolOS institutional deployments.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Request Received</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out. A ZYR0 platform specialist will contact you at{' '}
              <span className="font-mono text-foreground font-medium">{formData.email}</span> to confirm your session.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Work / Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@company.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Company / School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Acme Corp or Oxford Academy"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Your Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
                >
                  <option value="Hiring Manager / Founder">Hiring Manager / Founder</option>
                  <option value="Engineering / Tech Lead">Engineering / Tech Lead</option>
                  <option value="School Principal / Administrator">School Principal / Administrator</option>
                  <option value="University Career Dean">University Career Dean</option>
                  <option value="Enterprise Executive">Enterprise Executive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Primary Product Interest
              </label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
              >
                <option value="ZYR0 Work (Company Internships & Hiring)">
                  ZYR0 Work — Intern Hiring & Task Management (Live)
                </option>
                <option value="ZYR0 SchoolOS (Institution Management)">
                  ZYR0 SchoolOS — School / College Management (Preview)
                </option>
                <option value="Full ZYR0 Ecosystem (All Products)">
                  Full Platform Deployment (Work, SchoolOS, Research, Studio)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Estimated Users / Interns / Students (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. 5-10 interns per quarter or 1,200 students"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" /> Request Walkthrough
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
