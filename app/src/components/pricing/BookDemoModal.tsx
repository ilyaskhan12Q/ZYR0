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

const PRODUCT_OPTIONS = [
  'ZYR0 SchoolOS',
  'ZYR0 Studio',
  'ZYR0 Work',
  'ZYR0 Research',
];

export default function BookDemoModal({ open, onOpenChange }: BookDemoModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    size: '20-100 members',
    selectedProducts: ['ZYR0 SchoolOS', 'ZYR0 Work'],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleProduct = (prod: string) => {
    setFormData((prev) => {
      const exists = prev.selectedProducts.includes(prod);
      const updated = exists
        ? prev.selectedProducts.filter((p) => p !== prod)
        : [...prev.selectedProducts, prod];
      return { ...prev, selectedProducts: updated.length ? updated : [prod] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid work or official institution email.');
      return;
    }

    setSubmitting(true);
    const result = await submitProductLead({
      email: formData.email,
      name: formData.name,
      institutionName: formData.organization,
      role: 'Enterprise / Institutional Inquirer',
      estimatedUsers: formData.size,
      notes: `Products: ${formData.selectedProducts.join(', ')} | Notes: ${formData.notes}`,
      product: formData.selectedProducts.includes('ZYR0 SchoolOS') ? 'school_os' : 'work',
    });
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      toast.success('Your enterprise request has been received. Our team will reach out within 24 hours.');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      organization: '',
      size: '20-100 members',
      selectedProducts: ['ZYR0 SchoolOS', 'ZYR0 Work'],
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border border-border bg-muted text-muted-foreground w-fit">
            <Sparkles className="w-3 h-3 text-accent" />
            Custom Solutions
          </div>
          <DialogTitle className="text-xl font-serif font-normal text-foreground">
            Contact Sales
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Tell us about your organization to explore custom institutional deployments, team features, and tailored SLAs.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center mx-auto text-foreground">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Request Received</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We received your inquiry. A ZYR0 representative will contact you at{' '}
              <span className="font-mono text-foreground">{formData.email}</span> with customized institutional terms.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Mercer"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@organization.org"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Organization / School *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Acme Inc. or Beaconhouse"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Team / Campus Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                >
                  <option value="1-20 members">1-20 members</option>
                  <option value="20-100 members">20-100 members</option>
                  <option value="100-500 members">100-500 members</option>
                  <option value="500+ / Campus-wide">500+ / Campus-wide</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                Target Products (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_OPTIONS.map((prod) => {
                  const selected = formData.selectedProducts.includes(prod);
                  return (
                    <button
                      key={prod}
                      type="button"
                      onClick={() => toggleProduct(prod)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-accent/15 border-accent text-foreground font-semibold'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {selected ? '✓ ' : ''}{prod}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Custom Requirements or Timeline (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Fall semester campus deployment or custom hiring guild..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent text-foreground resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" /> Submit Request
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
