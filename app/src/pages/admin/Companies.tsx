import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  Lock,
  Loader2,
  Eye,
  Unlock,
  X,
  Globe,
  MapPin,
  Users,
  Building,
  AlertCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { getAllCompanies, updateCompanyStatus } from '@/services/companies';
import type { Company } from '@/lib/database.types';

const tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended'];

export default function AdminCompanies() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected' | 'suspended' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function loadCompanies() {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'All' ? undefined : activeTab.toLowerCase();
      const res = await getAllCompanies({ status: statusFilter });
      if (res.data) {
        setCompanies(res.data as Company[]);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  }

  // Avoid calling setState synchronously in useEffect to satisfy eslint
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        loadCompanies();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeTab]);

  const handleOpenReview = (company: Company) => {
    setSelectedCompany(company);
    setDecision(company.status as 'pending' | 'approved' | 'rejected' | 'suspended');
    setNotes(company.verification_notes || '');
    setSubmitError('');
  };

  const handleCloseReview = () => {
    setSelectedCompany(null);
    setDecision(null);
    setNotes('');
    setSubmitError('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !decision) return;

    if (decision === 'rejected' && notes.trim().length < 10) {
      setSubmitError('Verification notes must be at least 10 characters long when rejecting.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      
      const res = await updateCompanyStatus(selectedCompany.id, decision, notes.trim());
      if (res.error) throw res.error;

      // Update local state
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? {
                ...c,
                status: decision,
                verification_notes: notes.trim(),
                verified_at: new Date().toISOString()
              }
            : c
        )
      );

      handleCloseReview();
      loadCompanies();
    } catch (err) {
      console.error('Error submitting review:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to update company status. Please try again.';
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = companies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Company Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">Review, approve, or suspend registered partner companies</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or industry..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Industry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Created At</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No companies found matching this status filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((company) => (
                    <motion.tr
                      key={company.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name}`}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover bg-muted border border-border"
                          />
                          <div>
                            <p className="text-sm font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.location || 'Location not specified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {company.industry || 'General'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-full font-medium inline-flex items-center gap-1 ${
                            company.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : company.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : company.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {company.status === 'approved' && <ShieldCheck className="w-3 h-3" />}
                          {company.status === 'rejected' && <ShieldAlert className="w-3 h-3" />}
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(company.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenReview(company)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium transition-colors"
                            title="Review Company Details & Verification"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-accent" />
                  <div>
                    <h2 className="text-lg font-bold">Review Company Registration</h2>
                    <p className="text-xs text-muted-foreground">Review details and verify company credentials</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseReview}
                  className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Profile Header Card */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/40 border border-border">
                  <img
                    src={selectedCompany.logo_url || `https://ui-avatars.com/api/?name=${selectedCompany.name}`}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-background border border-border"
                  />
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{selectedCompany.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCompany.description || 'No description provided.'}</p>
                  </div>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="font-medium">{selectedCompany.industry || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company Size</p>
                      <p className="font-medium">{selectedCompany.size || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedCompany.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      {selectedCompany.website ? (
                        <a
                          href={selectedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-accent hover:underline flex items-center gap-0.5"
                        >
                          {selectedCompany.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      ) : (
                        <p className="font-medium">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decision Form Section */}
                <form onSubmit={(e) => { handleSubmitReview(e); }} className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground">Verification Decision</h4>
                  
                  {/* Status Selection Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => { setDecision('approved'); setSubmitError(''); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                        decision === 'approved'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-400'
                          : 'bg-card border-border hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 mb-1" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDecision('rejected'); setSubmitError(''); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                        decision === 'rejected'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-400'
                          : 'bg-card border-border hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5 mb-1" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDecision('suspended'); setSubmitError(''); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                        decision === 'suspended'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:border-amber-500 dark:text-amber-400'
                          : 'bg-card border-border hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Lock className="w-5 h-5 mb-1" />
                      Suspend
                    </button>
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-xs font-semibold text-muted-foreground flex justify-between">
                      <span>Verification Notes</span>
                      {decision === 'rejected' && <span className="text-rose-500">Required (min 10 chars)</span>}
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder={
                        decision === 'approved'
                          ? 'Optional notes detailing criteria met or credentials verified...'
                          : decision === 'rejected'
                          ? 'Provide clear reason for rejection (required, min 10 characters)...'
                          : 'Reason for suspension...'
                      }
                      className="w-full p-3 bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                    />
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 dark:bg-rose-950/15 dark:border-rose-900/30 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{submitError}</p>
                    </div>
                  )}

                  {/* Submit and Close Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseReview}
                      className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting || !decision || (decision === 'rejected' && notes.trim().length < 10)}
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Decision
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
