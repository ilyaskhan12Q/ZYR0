import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Send, Download, Eye, XCircle, Search, Clock,
  CheckCircle2, AlertTriangle, Loader2, RotateCcw, Building2,
  Calendar, Users, Plus, ExternalLink, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import {
  getCompanyOfferLetters,
  generateOfferLetter,
  revokeOfferLetter,
  getOfferLetterByApplication,
  uploadOfferLetterPdf,
  attachOfferLetterPdf,
} from '@/services/offerLetters';
import { generateOfferLetterPdf } from '@/lib/offerLetterPdf';
import type { OfferLetter, OfferLetterStatus } from '@/lib/database.types';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';
import { supabase } from '@/lib/supabase';

// ── Status config (mirrors student page) ─────────────────────────────────────

const STATUS_CONFIG: Record<OfferLetterStatus, { label: string; color: string; icon: React.ElementType }> = {
  Pending:  { label: 'Pending',  color: 'bg-amber-100  text-amber-700  dark:bg-amber-950/30  dark:text-amber-400',  icon: Clock },
  Sent:     { label: 'Sent',     color: 'bg-blue-100   text-blue-700   dark:bg-blue-950/30   dark:text-blue-400',   icon: Send },
  Accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'bg-red-100    text-red-700    dark:bg-red-950/30    dark:text-red-400',    icon: XCircle },
  Revoked:  { label: 'Revoked',  color: 'bg-slate-100  text-slate-600  dark:bg-slate-800/30  dark:text-slate-400', icon: RotateCcw },
  Expired:  { label: 'Expired',  color: 'bg-slate-100  text-slate-600  dark:bg-slate-800/30  dark:text-slate-400', icon: AlertTriangle },
};

const TABS = ['All', 'Pending', 'Sent', 'Accepted', 'Rejected', 'Revoked'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompanyOfferLetters() {
  const { user } = useAuth();

  const [company, setCompany]           = useState<any>(null);
  const [offers, setOffers]             = useState<OfferLetter[]>([]);
  const [acceptedApps, setAcceptedApps] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<string>('All');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<OfferLetter | null>(null);
  const [generating, setGenerating]     = useState<string | null>(null);
  const [revoking, setRevoking]         = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: co } = await getMyCompany();
      if (!co) return;
      setCompany(co);

      const [offersRes, appsRes] = await Promise.all([
        getCompanyOfferLetters(co.id),
        getAllCompanyApplications(co.id),
      ]);

      if (offersRes.data) setOffers(offersRes.data as OfferLetter[]);

      if (appsRes.data) {
        // Only accepted applications that don't yet have an offer letter
        const existingAppIds = new Set((offersRes.data ?? []).map((o: any) => o.application_id));
        const eligible = (appsRes.data as any[]).filter(
          (a) => a.status === 'Accepted' && !existingAppIds.has(a.id)
        );
        setAcceptedApps(eligible);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) load(); }, [user, load]);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = offers.filter((o) => {
    const matchTab    = activeTab === 'All' || o.status === activeTab;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || (o.student?.full_name   ?? '').toLowerCase().includes(q)
      || (o.internship?.title    ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // ── Generate + PDF ────────────────────────────────────────────────────────────
  async function handleGenerate(application: any) {
    setGenerating(application.id);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Check for duplicates
      const { data: existing } = await getOfferLetterByApplication(application.id);
      if (existing) {
        setError('An offer letter already exists for this application.');
        return;
      }

      const student    = Array.isArray(application.student)    ? application.student[0]    : application.student;
      const internship = Array.isArray(application.internship) ? application.internship[0] : application.internship;
      if (!student || !internship) throw new Error('Missing student or internship data');

      // 2. Insert offer letter record
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data: newOffer, error: insertErr } = await generateOfferLetter({
        internship_id:  internship.id,
        application_id: application.id,
        student_id:     student.id,
        company_id:     company.id,
        expires_at:     expiresAt,
      });
      if (insertErr) throw insertErr;

      // 3. Generate PDF
      const fullOffer: OfferLetter = {
        ...newOffer!,
        student,
        company,
        internship,
      };
      const pdfBlob = await generateOfferLetterPdf({
        offer: fullOffer,
        verificationUrl: `${window.location.origin}/verify-offer/${newOffer!.id}`,
      });

      // 4. Upload to Storage
      const pdfUrl = await uploadOfferLetterPdf(newOffer!.id, student.id, pdfBlob);

      // 5. Update record with PDF URL
      await attachOfferLetterPdf(newOffer!.id, pdfUrl);

      // Send actual offer letter email via custom SMTP (send-email Edge Function)
      try {
        const blobToBase64 = (blob: Blob): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              const base64 = base64data.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        };

        const base64Pdf = await blobToBase64(pdfBlob);
        const emailSubject = `Internship Offer Letter - ${company.name}`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Internship Offer Extended!</h1>
              <p style="color: #6b7280; margin: 4px 0 0 0;">from ${company.name}</p>
            </div>
            <p>Dear <strong>${student.full_name}</strong>,</p>
            <p>Congratulations! We are thrilled to extend you an offer for the <strong>${internship.title}</strong> internship position at <strong>${company.name}</strong>.</p>
            <p>Please find your official offer letter attached to this email. You can also view the details and respond to this offer online on the Zyro Platform.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/student/offer-letters" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Respond to Offer</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
              If you have any questions, please contact ${company.name} directly.
            </p>
          </div>
        `;

        await supabase.functions.invoke('send-email', {
          body: {
            to: student.email,
            subject: emailSubject,
            html: emailHtml,
            attachments: [
              {
                filename: `Offer_Letter_${company.name.replace(/\s+/g, '_')}.png`,
                content: base64Pdf,
              }
            ]
          }
        });
      } catch (emailErr) {
        console.error('Failed to send actual offer letter email:', emailErr);
      }

      // Trigger simulation notification
      try {
        await dispatchNotificationWithSimulation({
          userId: student.id,
          title: 'Offer Letter Received',
          message: `Congratulations! ${company.name} has extended an internship offer: "${internship.title}".`,
          type: 'application',
          actionUrl: '/student/offer-letters',
          studentEmail: student.email,
        });
      } catch (notifErr) {
        console.error('Failed to trigger offer letter notification simulation:', notifErr);
      }

      setSuccessMsg(`Offer letter generated and sent to ${student.full_name}!`);
      await load();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to generate offer letter.');
    } finally {
      setGenerating(null);
    }
  }

  // ── Revoke ────────────────────────────────────────────────────────────────────
  async function handleRevoke(offerId: string) {
    const reason = prompt('Reason for revoking this offer letter (optional):');
    if (reason === null) return; // user cancelled

    setRevoking(offerId);
    setError(null);
    try {
      const { error: err } = await revokeOfferLetter(offerId, reason || undefined);
      if (err) throw err;
      setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: 'Revoked' } : o));
      setSelected((prev) => prev?.id === offerId ? { ...prev, status: 'Revoked' } : prev);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to revoke offer letter.');
    } finally {
      setRevoking(null);
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────────
  function handleDownload(offer: OfferLetter) {
    if (!offer.pdf_url) return;
    const a = document.createElement('a');
    a.href     = offer.pdf_url;
    a.download = `offer-letter-${offer.id.slice(0, 8)}.png`;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Resend email (stub — integrate with Supabase Edge Function / Resend) ──────
  async function handleResend(offer: OfferLetter) {
    alert(`Email resend for ${offer.student?.full_name ?? 'student'} would be triggered here via a Supabase Edge Function / Resend integration.`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Offer Letters</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage official offer letters for accepted interns</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4 text-accent" />
            {acceptedApps.length} eligible
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg">
            <FileText className="w-4 h-4 text-accent" />
            {offers.length} sent
          </div>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border border-red-100 dark:border-red-900"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2 border border-emerald-100 dark:border-emerald-900"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eligible Applications to Generate Offers */}
      {acceptedApps.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">Generate New Offer Letters</h2>
            <span className="ml-auto text-xs text-muted-foreground">{acceptedApps.length} pending</span>
          </div>
          <div className="divide-y divide-border">
            {acceptedApps.slice(0, 5).map((app) => {
              const student    = Array.isArray(app.student)    ? app.student[0]    : app.student;
              const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
              return (
                <div key={app.id} className="flex items-center justify-between px-5 py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.full_name ?? 'S')}&background=3B82F6&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{student?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{internship?.title ?? '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerate(app)}
                    disabled={generating === app.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {generating === app.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {generating === app.id ? 'Generating…' : 'Generate'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Offer Letters List */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or position…"
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
            />
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No offer letters found</p>
              <p className="text-xs text-muted-foreground mt-1">Generate an offer by accepting a student application</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {['Student', 'Position', 'Status', 'Issued', 'Email', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((offer) => {
                    const cfg  = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.Pending;
                    const Icon = cfg.icon;
                    const canRevoke = ['Pending', 'Sent'].includes(offer.status);

                    return (
                      <motion.tr
                        key={offer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={offer.student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.student?.full_name ?? 'S')}&background=3B82F6&color=fff`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{offer.student?.full_name ?? '—'}</p>
                              <p className="text-xs text-muted-foreground">{offer.student?.university ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{offer.internship?.title ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {offer.issued_at ? new Date(offer.issued_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {offer.email_sent ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sent
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelected(offer)}
                              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {offer.pdf_url && (
                              <button
                                onClick={() => handleDownload(offer)}
                                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleResend(offer)}
                              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                              title="Resend Email"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            {canRevoke && (
                              <button
                                onClick={() => handleRevoke(offer.id)}
                                disabled={revoking === offer.id}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md text-red-500 transition-colors disabled:opacity-50"
                                title="Revoke"
                              >
                                {revoking === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selected && (
          <CompanyOfferModal
            offer={selected}
            onClose={() => setSelected(null)}
            onDownload={handleDownload}
            onRevoke={handleRevoke}
            onResend={handleResend}
            revoking={revoking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

interface ModalProps {
  offer: OfferLetter;
  onClose: () => void;
  onDownload: (o: OfferLetter) => void;
  onRevoke: (id: string) => void;
  onResend: (o: OfferLetter) => void;
  revoking: string | null;
}

function CompanyOfferModal({ offer, onClose, onDownload, onRevoke, onResend, revoking }: ModalProps) {
  const cfg     = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.Pending;
  const Icon    = cfg.icon;
  const canRevoke = ['Pending', 'Sent'].includes(offer.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent dark:from-slate-950 dark:to-accent/50 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{offer.student?.full_name ?? '—'}</p>
              <p className="text-white/70 text-sm">{offer.internship?.title ?? '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20">
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </span>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Student',      offer.student?.full_name    ?? '—'],
              ['University',   offer.student?.university   ?? '—'],
              ['Position',     offer.internship?.title     ?? '—'],
              ['Duration',     offer.internship?.duration  ?? '—'],
              ['Start Date',   offer.internship?.start_date ? new Date(offer.internship.start_date).toLocaleDateString() : '—'],
              ['Compensation', offer.internship?.stipend   ?? '—'],
              ['Work Mode',    offer.internship?.location_type ?? '—'],
              ['Issued',       offer.issued_at ? new Date(offer.issued_at).toLocaleDateString() : '—'],
              ['Expires',      offer.expires_at ? new Date(offer.expires_at).toLocaleDateString() : '—'],
              ['Email Sent',   offer.email_sent ? (offer.email_sent_at ? new Date(offer.email_sent_at).toLocaleDateString() : 'Yes') : 'No'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="text-sm font-medium mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {offer.revoke_reason && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
              <strong>Revoke reason:</strong> {offer.revoke_reason}
            </div>
          )}

          <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-2 rounded-lg break-all">
            Offer ID: {offer.id}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {offer.pdf_url && (
              <>
                <button
                  onClick={() => onDownload(offer)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={offer.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </>
            )}
            <button
              onClick={() => onResend(offer)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Email
            </button>
            {canRevoke && (
              <button
                onClick={() => onRevoke(offer.id)}
                disabled={revoking === offer.id}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
              >
                {revoking === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Revoke
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
