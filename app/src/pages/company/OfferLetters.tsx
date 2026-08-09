import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Send, Download, Eye, XCircle, Search, Clock,
  CheckCircle2, AlertTriangle, Loader2, RotateCcw, Building2,
  Calendar, Users, Plus, ExternalLink, RefreshCw, FileCode
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
import { SITE_CONFIG } from '@/config/site';

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
  const siteUrl = (SITE_CONFIG.url || import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');
  const linkedInUrl = SITE_CONFIG.social.linkedinCompany;
  const whatsAppCommunityUrl = SITE_CONFIG.social.whatsappSupportGroup;
  const whatsAppChannelUrl = SITE_CONFIG.social.whatsappChannel;
  const expiryDateStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '30 days from issuance';
  const offerCodeStr = offerCode ?? offerId.slice(0, 8).toUpperCase();
  const offerLettersDashboardUrl = `${siteUrl}/student/offer-letters`;

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Offer — ZYR0</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background-color: #1e3a8a; border-bottom: 3px solid #b89c56;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #ffffff;">ZYR0</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #f1c40f;">Official Internship Offer</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #0f172a;">Dear <strong>${studentName}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #334155;">
                On behalf of <strong style="color: #1e3a8a;">${companyName}</strong>, we are pleased to extend an official internship offer to you for the position of <strong style="color: #1e3a8a;">${internshipTitle}</strong>. Following a careful evaluation of your qualifications and experience, we were thoroughly impressed by your technical potential and dedication, and we are confident in the valuable contributions you will bring to our team.
              </p>

              <!-- Offer Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Offer Summary</p>
                    <p style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 700; color: #0f172a;">${companyName} — ${internshipTitle}</p>
                    <p style="margin: 0 0 6px; font-size: 13px; color: #334155;">
                      <strong>Offer Code:</strong> <span style="color: #1e3a8a; font-family: monospace; font-size: 13px; font-weight: 700;">${offerCodeStr}</span>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #334155;">
                      <strong>Online Verification Link:</strong><br>
                      <a href="${siteUrl}/verify?type=offer&id=${offerId}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600; word-break: break-all;">${siteUrl}/verify?type=offer&id=${offerId}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #334155;">
                Your official, printable Offer Letter document is attached to this email as a PDF file. Please review the attached document for complete details regarding duration, stipends, and engagement terms.
              </p>

              <!-- Expiry Alert -->
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; margin: 24px 0; border-radius: 6px;">
                <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #854d0e;">
                  <strong>Action Required — Offer Expiration Notice:</strong><br>
                  This internship offer remains valid until <strong>${expiryDateStr}</strong>. To accept or decline this offer, please access your offer details directly on your ZYR0 Student Dashboard using the following link:
                </p>
                <p style="margin: 0; font-size: 14px; word-break: break-all;">
                  <a href="${offerLettersDashboardUrl}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 700;">${offerLettersDashboardUrl}</a>
                </p>
              </div>

              <!-- Direct Platform Links -->
              <div style="border-top: 1px solid #e2e8f0; margin: 28px 0 24px; padding-top: 24px;">
                <p style="margin: 0 0 14px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">Direct Links & Verification</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #334155;">
                  <li style="margin-bottom: 8px;">
                    <strong>Review & Respond to Offer:</strong><br>
                    <a href="${offerLettersDashboardUrl}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600; word-break: break-all;">${offerLettersDashboardUrl}</a>
                  </li>
                  <li style="margin-bottom: 8px;">
                    <strong>Verify Credential:</strong><br>
                    <a href="${siteUrl}/verify?type=offer&id=${offerId}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600; word-break: break-all;">${siteUrl}/verify?type=offer&id=${offerId}</a>
                  </li>
                  <li style="margin-bottom: 8px;">
                    <strong>ZYR0 Career Hub:</strong><br>
                    <a href="${siteUrl}/careers" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600; word-break: break-all;">${siteUrl}/careers</a>
                  </li>
                  <li style="margin-bottom: 0;">
                    <strong>Contact Support:</strong><br>
                    <a href="${siteUrl}/contact" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600; word-break: break-all;">${siteUrl}/contact</a>
                  </li>
                </ul>
              </div>

              <p style="margin: 28px 0 0; font-size: 15px; line-height: 1.8; color: #0f172a;">
                We look forward to welcoming you to the team and supporting your professional growth.<br><br>
                Sincerely,<br>
                <strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #1e3a8a;">The ZYR0 Team & ${companyName}</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Stay Connected</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #475569;">
                <a href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600;">LinkedIn</a>
                <span style="color: #cbd5e1; padding: 0 8px;">·</span>
                <a href="${whatsAppCommunityUrl}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600;">WhatsApp Community</a>
                <span style="color: #cbd5e1; padding: 0 8px;">·</span>
                <a href="${whatsAppChannelUrl}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: underline; font-weight: 600;">WhatsApp Channel</a>
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8;">This email was sent on behalf of ${companyName} via ZYR0.</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: underline;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const emailText = [
    `Dear ${studentName},`,
    '',
    `On behalf of ${companyName}, we are pleased to extend an official internship offer to you for the position of ${internshipTitle}.`,
    '',
    `Your official Offer Letter document is attached to this email as a PDF file.`,
    '',
    `Offer Summary:`,
    `- Company: ${companyName}`,
    `- Position: ${internshipTitle}`,
    `- Offer Code: ${offerCodeStr}`,
    `- Online Verification: ${siteUrl}/verify?type=offer&id=${offerId}`,
    '',
    `Action Required: This offer remains valid until ${expiryDateStr}. Please review and respond to your offer on the platform using the following link:`,
    `${offerLettersDashboardUrl}`,
    '',
    `Direct Links:`,
    `- Review Offer: ${offerLettersDashboardUrl}`,
    `- Verify Credential: ${siteUrl}/verify?type=offer&id=${offerId}`,
    `- ZYR0 Career Hub: ${siteUrl}/careers`,
    `- Contact Support: ${siteUrl}/contact`,
    '',
    `Stay Connected:`,
    `- LinkedIn: ${linkedInUrl}`,
    `- WhatsApp Community: ${whatsAppCommunityUrl}`,
    `- WhatsApp Channel: ${whatsAppChannelUrl}`,
    '',
    'Sincerely,',
    `The ZYR0 Team & ${companyName}`,
    'team@zyroo.org',
  ].join('\n');

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
          filename: `Offer_Letter_${companyName.replace(/\s+/g, '_')}.pdf`,
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
  const [resending, setResending]       = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState<{ offerId: string; ok: boolean; message: string } | null>(null);
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
    a.download = `offer-letter-${offer.id.slice(0, 8)}.pdf`;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Preview Canvas PDF (debug & instant verification) ────────────────────────
  async function handlePreviewCanvasPdf(offer: OfferLetter) {
    try {
      const verificationUrl = `${window.location.origin}/verify-offer/${offer.id}`;
      const pdfBlob = await generateOfferLetterPdf({
        offer,
        verificationUrl,
      });
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF canvas preview:', err);
      setError('Could not generate PDF canvas preview.');
    }
  }

  // ── Resend email ─────────────────────────────────────────────────────────────
  async function handleResend(offer: OfferLetter) {
    if (resending === offer.id) return; // block double-clicks / duplicate emails
    setResending(offer.id);
    setResendFeedback(null);
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

      const okMsg = `Offer letter email resent to ${student.full_name}!`;
      setSuccessMsg(okMsg);
      setResendFeedback({ offerId: offer.id, ok: true, message: okMsg });
      await load();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to resend email.';
      console.error('Failed to resend email:', err);
      setError(errMsg);
      setResendFeedback({ offerId: offer.id, ok: false, message: errMsg });
    } finally {
      setResending(null);
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
                              disabled={resending === offer.id}
                              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
                              title={resending === offer.id ? 'Sending…' : 'Resend Email'}
                            >
                              {resending === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
            onPreviewCanvas={handlePreviewCanvasPdf}
            onRevoke={handleRevoke}
            onResend={handleResend}
            revoking={revoking}
            resending={resending}
            resendFeedback={resendFeedback}
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
  onPreviewCanvas: (o: OfferLetter) => void;
  onRevoke: (id: string) => void;
  onResend: (o: OfferLetter) => void;
  revoking: string | null;
  resending: string | null;
  resendFeedback: { offerId: string; ok: boolean; message: string } | null;
}

function CompanyOfferModal({ offer, onClose, onDownload, onPreviewCanvas, onRevoke, onResend, revoking, resending, resendFeedback }: ModalProps) {
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
            <button
              onClick={() => onPreviewCanvas(offer)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium"
              title="Preview raw canvas PDF attachment"
            >
              <FileCode className="w-4 h-4 text-[#b89c56]" />
              Preview Canvas PDF
            </button>
            {offer.pdf_url && (
              <>
                <button
                  onClick={() => onDownload(offer)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
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
              disabled={resending === offer.id}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {resending === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {resending === offer.id ? 'Sending…' : 'Resend Email'}
            </button>
          </div>

          {resendFeedback?.offerId === offer.id && (
            <div className={`w-full flex items-center gap-2 text-sm font-medium ${resendFeedback.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {resendFeedback.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              {resendFeedback.message}
            </div>
          )}

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
