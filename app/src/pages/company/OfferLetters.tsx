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
  markOfferSent,
} from '@/services/offerLetters';
import { generateOfferLetterPdf } from '@/lib/offerLetterPdf';
import OfferLetterDocument from '@/components/OfferLetterDocument';
import type { OfferLetter, OfferLetterStatus } from '@/lib/database.types';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';
import { supabase } from '@/lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a Blob to a base64 string (data-URI content portion). */
function blobToBase64(blob: Blob): Promise<string> {
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
}

/** Build and send the offer letter email via the send-email Edge Function. */
async function sendOfferLetterEmail(opts: {
  student: { id?: string; email?: string | null; full_name?: string | null };
  company: { name?: string | null };
  internship: { title?: string | null };
  pdfBlob: Blob;
  offerId: string;
  offerCode?: string | null;
  expiresAt?: string | null;
}): Promise<void> {
  const { student, company, internship, pdfBlob, offerId, offerCode, expiresAt } = opts;
  let studentEmail = student.email;

  if (!studentEmail && student.id) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', student.id)
      .single();
    if (prof?.email) {
      studentEmail = prof.email;
    }
  }

  const studentName = student.full_name ?? 'Candidate';
  const companyName = company.name ?? 'Company';
  const internshipTitle = internship.title ?? 'Internship';

  if (!studentEmail) {
    throw new Error('Student email is missing for this application.');
  }

  const base64Pdf = await blobToBase64(pdfBlob);
  const emailSubject = `Internship Offer: ${internshipTitle} - ${companyName}`;
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const expiryDateStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '30 days from issuance';
  const offerCodeStr = offerCode ?? offerId.slice(0, 8).toUpperCase();
  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Offer</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1ece0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1ece0;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fffdf5; border: 1px solid #b89c56; box-shadow: 0 10px 30px rgba(25, 21, 18, 0.08);">
          <tr>
            <td style="padding: 36px 40px 22px; text-align: center; border-bottom: 1px solid #e8dcc0;">
              <p style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 5px; color: #1e3a8a;">ZYR0</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #b89c56;">Internship Offer Extended</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #13100d;">Dear ${studentName},</p>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.8; color: #3d372e;">
                On behalf of <strong style="color: #1e3a8a;">${companyName}</strong>, we are pleased to confirm that an
                official internship offer has been extended to you for the
                <strong style="color: #1e3a8a;">${internshipTitle}</strong> position. Your application demonstrated genuine
                potential, and we are confident in the contributions you will bring to the team.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0; border: 1px solid #b89c56; background-color: #faf6ea;">
                <tr>
                  <td style="padding: 18px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Offer Recipient</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 700; color: #1e3a8a;">${companyName} — ${internshipTitle}</p>
                    <p style="margin: 10px 0 0; font-size: 11px; letter-spacing: 1.5px; color: #8a7f6c;">Offer Code: <strong style="color: #1e3a8a;">${offerCodeStr}</strong> &nbsp;·&nbsp; Verify at <a href="${siteUrl}/verify?type=offer&id=${offerId}" style="color: #1e3a8a;">${siteUrl}/verify</a></p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.8; color: #3d372e;">The official offer letter is attached to this email. Please review the full terms and conditions, then confirm your decision through the ZYR0 platform at your earliest convenience.</p>
              <p style="margin: 22px 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #b89c56;">Your Next Step: Respond Before It Expires</p>
              <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.7; color: #3d372e;">This offer remains open until <strong style="color: #1e3a8a;">${expiryDateStr}</strong>. We encourage you to accept or decline before the deadline so your internship can be finalized without delay.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #1e3a8a;">
                    <a href="${siteUrl}/student/offer-letters" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #fffdf5; text-decoration: none; border: 1px solid #b89c56; border-radius: 4px;">Review &amp; Respond to Offer</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 13.5px; line-height: 1.8; color: #3d372e; text-align: center;">Having trouble signing in or need assistance? Our support team is ready to help.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: transparent; border: 1.5px solid #b89c56;">
                    <a href="${siteUrl}/contact" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; letter-spacing: 1px; color: #1e3a8a; text-decoration: none; border-radius: 4px;">Contact Support</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #13100d;">
                We look forward to welcoming you on board.<br>
                <strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px;">The ZYR0 Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center; border-top: 1px solid #e8dcc0;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #8a7f6c;">This email was sent on behalf of ${companyName} via ZYR0.</p>
              <p style="margin: 0; font-size: 11px; color: #8a7f6c;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const emailText = `Dear ${studentName},\n\n` +
    `On behalf of ${companyName}, we are pleased to confirm that an official internship offer has been extended to you for the ${internshipTitle} position.\n\n` +
    `The official offer letter is attached to this email as a PDF. Please review the full terms and conditions, then confirm your decision through the ZYR0 platform:\n` +
    `${siteUrl}/student/offer-letters\n\n` +
    `Offer Code: ${offerCodeStr}\n` +
    `Verify this offer: ${siteUrl}/verify?type=offer&id=${offerId}\n\n` +
    `This offer remains open until ${expiryDateStr}. We encourage you to accept or decline before the deadline so your internship can be finalized without delay.\n\n` +
    `If you encounter any issues or have questions, contact our support team (your message goes straight to the platform team):\n` +
    `${siteUrl}/contact\n\n` +
    `We look forward to welcoming you on board.\n\n` +
    `With warm regards,\n` +
    `The ZYR0 Team\n` +
    `team@zyroo.org`;

  const { data: resData, error: invokeErr } = await supabase.functions.invoke('send-email', {
    body: {
      to: studentEmail,
      from: 'ZYR0 Team <team@zyroo.org>',
      replyTo: 'team@zyroo.org',
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: `Offer_Letter_${companyName.replace(/\s+/g, '_')}.png`,
          content: base64Pdf,
        }
      ]
    }
  });
  if (invokeErr) {
    throw invokeErr;
  }
  if (resData?.error) {
    throw new Error(resData.error);
  }

  // Update database status and email flags only after email provider confirmation
  const { error: markErr } = await markOfferSent(offerId);
  if (markErr) {
    throw markErr;
  }
}

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
        await sendOfferLetterEmail({
          student,
          company,
          internship,
          pdfBlob,
          offerId: newOffer!.id,
          offerCode: newOffer!.offer_code,
          expiresAt: newOffer!.expires_at,
        });
        console.log('Offer letter email sent successfully');
      } catch (emailErr) {
        console.error('Failed to send actual offer letter email:', emailErr);
        throw new Error(`Offer letter generated, but email delivery failed: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`);
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

  // ── Resend email ─────────────────────────────────────────────────────────────
  async function handleResend(offer: OfferLetter) {
    setError(null);
    setSuccessMsg(null);
    try {
      const student = offer.student;
      const internship = offer.internship;
      const company = offer.company || { name: 'ZYR0' }; // Fallback

      if (!student || !internship) {
        throw new Error('Missing student or internship data for resending');
      }

      // 1. Regenerate PDF locally
      const verificationUrl = `${window.location.origin}/verify-offer/${offer.id}`;
      const pdfBlob = await generateOfferLetterPdf({
        offer,
        verificationUrl,
      });

      // 2. Send email via shared function
      await sendOfferLetterEmail({
        student,
        company,
        internship,
        pdfBlob,
        offerId: offer.id,
        offerCode: offer.offer_code,
        expiresAt: offer.expires_at,
      });
      console.log('Offer letter email resent successfully');

      setSuccessMsg(`Offer letter email resent to ${student.full_name}!`);
      await load();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to resend email.';
      console.error('Failed to resend email:', err);
      setError(errMsg);
    }
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
  const [viewTab, setViewTab] = useState<'document' | 'details'>('document');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent dark:from-slate-950 dark:to-accent/50 p-5 px-6 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-lg">{offer.student?.full_name ?? '—'}</p>
            <p className="text-white/70 text-sm">{offer.internship?.title ?? '—'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-black/20 p-1 rounded-lg text-xs font-medium border border-white/10">
              <button
                onClick={() => setViewTab('document')}
                className={`px-3 py-1 rounded-md transition-colors ${viewTab === 'document' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                Document View
              </button>
              <button
                onClick={() => setViewTab('details')}
                className={`px-3 py-1 rounded-md transition-colors ${viewTab === 'details' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                Details & Audit
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20">
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-muted/20">
          {viewTab === 'document' ? (
            <OfferLetterDocument offer={offer} showActions={true} />
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-lg break-all">
                {offer.offer_code ? `Offer Code: ${offer.offer_code}` : 'Offer Code: —'}{' '}
                <span className="opacity-60">· Offer ID: {offer.id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-border bg-card flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {offer.pdf_url && (
              <>
                <button
                  onClick={() => onDownload(offer)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <a
                  href={offer.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </a>
              </>
            )}
            <button
              onClick={() => onResend(offer)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Email
            </button>
          </div>

          {canRevoke && (
            <button
              onClick={() => onRevoke(offer.id)}
              disabled={revoking === offer.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 font-medium"
            >
              {revoking === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Revoke Offer
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
