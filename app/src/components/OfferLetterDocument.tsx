import React, { useEffect, useMemo, useState } from 'react';
import { Printer, Building2, FileCheck, FileCode, Loader2 } from 'lucide-react';
import type { OfferLetter } from '@/lib/database.types';
import { noiseSvg, mottleSvg, fiberSvg, filigreeSvg, guillocheSvg } from '@/components/certificateTemplate';
import {
  OFFER_LETTER_COLORS,
  FONT_CINZEL,
  FONT_SANS,
  FONT_SCRIPT,
  OFFER_LETTER_FONTS_CSS_URL,
  DEFAULT_OFFER_TERMS,
  buildOfferDetails,
} from '@/lib/offerLetterConfig';
import { generateOfferLetterPdf } from '@/lib/offerLetterPdf';
import PrintErrorDialog from './PrintErrorDialog';

interface OfferLetterDocumentProps {
  offer: OfferLetter;
  showActions?: boolean;
}

const {
  GOLD,
  NAVY,
  INK,
  TEXT_MUTED,
  TEXT_SOFT,
} = OFFER_LETTER_COLORS;

export default function OfferLetterDocument({ offer, showActions = true }: OfferLetterDocumentProps) {
  const [previewingPdf, setPreviewingPdf] = useState(false);
  const [printError, setPrintError] = useState<{ title: string; description: string } | null>(null);
  const student = offer.student;
  const company = offer.company;
  const internship = offer.internship;

  const studentName = student?.full_name || 'Candidate';
  const companyName = company?.name || 'Partner Company';
  const position = internship?.title || 'Intern';
  const internshipType = internship?.type || 'Internship';
  const workMode = internship?.location_type || 'Remote';
  const location = internship?.location || company?.location || 'Remote';
  const duration = internship?.duration || 'Flexible';
  const compensation = internship?.stipend
    ? `${internship.stipend} (${internship.stipend_type || 'Monthly'})`
    : 'Unpaid / Experience-Based';

  const startDate = internship?.start_date
    ? new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be agreed upon';

  const signatoryInfo = 'Program Coordinator';


  // ── Preload the premium font families once ───────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('zyro-premium-fonts')) return;
    const link = document.createElement('link');
    link.id = 'zyro-premium-fonts';
    link.rel = 'stylesheet';
    link.href = OFFER_LETTER_FONTS_CSS_URL;
    document.head.appendChild(link);
  }, []);

  const paperLayers = useMemo(() => {
    const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    return {
      noise: uri(noiseSvg()),
      mottle: uri(mottleSvg()),
      fiber: uri(fiberSvg()),
    };
  }, []);

  const handlePrintWindow = () => {
    window.print();
  };

  /** Temporary Debug / Validation Tool: Generate PDF from Canvas & Preview */
  const handlePreviewPdfCanvas = async () => {
    try {
      setPreviewingPdf(true);
      const pdfBlob = await generateOfferLetterPdf({ offer });
      const blobUrl = URL.createObjectURL(pdfBlob);
      if (!window.open(blobUrl, '_blank')) {
        setPrintError({
          title: "Couldn't open the PDF",
          description: 'Your browser blocked the pop-up. Allow pop-ups for this site, then try again.',
        });
      }
    } catch (err) {
      console.error('Failed to render PDF preview canvas:', err);
      setPrintError({
        title: "Couldn't generate the PDF",
        description: 'The offer letter PDF could not be created. Try again, or use Print / Save PDF instead.',
      });
    } finally {
      setPreviewingPdf(false);
    }
  };

  const workArrangement = location && location !== workMode
    ? `${workMode} (${location})`
    : workMode;

  const details = buildOfferDetails({
    studentName,
    position,
    internshipType,
    workArrangement,
    duration,
    startDate,
    compensation,
    signatoryInfo,
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Action Bar */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-3 px-4 rounded-xl shadow-sm print:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCheck className="w-4 h-4 text-[#b89c56]" />
            <span>Official ZYR0 Verified Offer Letter</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviewPdfCanvas}
              disabled={previewingPdf}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
              title="Generate & preview raw canvas PDF attachment"
            >
              {previewingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4 text-[#b89c56]" />}
              {previewingPdf ? 'Rendering PDF…' : 'Preview as PDF Canvas'}
            </button>
            <button
              onClick={handlePrintWindow}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm text-white"
              style={{ background: NAVY }}
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Printable Document Sheet — classical paper, gold framing, watermark */}
      <div
        id={`offer-letter-sheet-${offer.id}`}
        className="offer-letter-print-root relative overflow-hidden shadow-xl print:shadow-none print:rounded-none print:m-0"
        style={{
          backgroundImage: `${paperLayers.noise}, ${paperLayers.fiber}, ${paperLayers.mottle}, radial-gradient(ellipse at 50% 32%, #fffdf5 0%, #f7f0dd 68%, #efe5ca 100%)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          border: `9px double ${GOLD}`,
          outline: `1px solid ${GOLD}`,
          outlineOffset: '-13px',
          borderRadius: 0,
          color: INK,
          fontFamily: FONT_SANS,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Thin inner rule — just inside the double border */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: 9, border: '1px solid rgba(184, 156, 86, .8)' }}
        />

        {/* Filigree corner ornaments */}
        <div className="absolute top-[17px] left-[17px] w-[118px] h-[118px] pointer-events-none" style={{ opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: filigreeSvg() }} />
        <div className="absolute top-[17px] right-[17px] w-[118px] h-[118px] pointer-events-none" style={{ opacity: 0.9, transform: 'scaleX(-1)' }} dangerouslySetInnerHTML={{ __html: filigreeSvg() }} />
        <div className="absolute bottom-[17px] left-[17px] w-[118px] h-[118px] pointer-events-none" style={{ opacity: 0.9, transform: 'scaleY(-1)' }} dangerouslySetInnerHTML={{ __html: filigreeSvg() }} />
        <div className="absolute bottom-[17px] right-[17px] w-[118px] h-[118px] pointer-events-none" style={{ opacity: 0.9, transform: 'scale(-1)' }} dangerouslySetInnerHTML={{ __html: filigreeSvg() }} />

        {/* Soft purple glow behind the guilloché watermark */}
        <div
          className="offer-letter-glow absolute pointer-events-none"
          style={{
            left: '50%', top: '46%', width: 720, height: 540,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(140,115,255,.13) 0%, rgba(140,115,255,.05) 45%, transparent 70%)',
          }}
        />

        {/* Guilloché watermark */}
        <div
          className="absolute pointer-events-none"
          style={{ left: '50%', top: '47%', width: 620, height: 420, transform: 'translate(-50%, -50%)', opacity: 0.6 }}
          dangerouslySetInnerHTML={{ __html: guillocheSvg() }}
        />

        {/* Official ZYR0 logo watermark */}
        <img
          src="/zyro-logo.png"
          alt=""
          className="absolute pointer-events-none select-none"
          style={{ left: '50%', top: '46%', width: 330, height: 330, transform: 'translate(-50%, -50%)', opacity: 0.1 }}
        />

        {/* Status Watermark Stamp */}
        {['Accepted', 'Rejected', 'Revoked'].includes(offer.status) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
            <div
              className={`text-6xl sm:text-8xl font-extrabold uppercase tracking-widest border-8 px-8 py-3 rounded-3xl opacity-15 rotate-[-22deg] select-none ${
                offer.status === 'Accepted'
                  ? 'text-emerald-600 border-emerald-600'
                  : offer.status === 'Rejected'
                  ? 'text-red-600 border-red-600'
                  : 'text-slate-600 border-slate-600'
              }`}
              style={{ fontFamily: FONT_CINZEL, fontWeight: 700 }}
            >
              {offer.status}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-14 py-10">

          {/* ── Letterhead ── */}
          <header className="offer-letter-header flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b gap-6" style={{ borderColor: 'rgba(184,156,86,.55)' }}>
            <div className="flex items-center gap-4">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={companyName}
                  className="w-16 h-16 rounded-xl object-contain p-1"
                  style={{ background: '#fffdf5', border: `1.5px solid ${GOLD}` }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-16 h-16 rounded-xl flex items-center justify-center';
                      fallback.style.background = NAVY;
                      fallback.style.color = '#f6efdf';
                      fallback.style.fontWeight = '700';
                      fallback.style.fontSize = '20px';
                      fallback.style.fontFamily = FONT_CINZEL;
                      fallback.innerText = (companyName || 'CO').substring(0, 2).toUpperCase();
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md text-white font-bold"
                  style={{ background: NAVY, color: '#f6efdf', fontFamily: FONT_CINZEL, fontSize: 20 }}
                >
                  {(companyName || 'CO').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1
                  className="text-2xl font-bold tracking-wide"
                  style={{ fontFamily: FONT_CINZEL, color: INK, fontWeight: 700 }}
                >
                  {companyName}
                </h1>
                <p className="text-sm font-medium mt-1 flex items-center gap-1.5" style={{ color: NAVY, letterSpacing: '1.2px' }}>
                  <Building2 className="w-4 h-4" style={{ color: GOLD }} />
                  GENERAL OFFICE OF THE BOARD &nbsp;·&nbsp; OFFICIAL INTERNSHIP OFFER LETTER
                </p>
              </div>
            </div>

            {/* Document metadata */}
            <div
              className="text-left sm:text-right text-xs space-y-1.5 p-3.5 rounded-xl border"
              style={{
                fontFamily: FONT_SANS,
                background: 'rgba(255,253,245,.6)',
                borderColor: 'rgba(184,156,86,.55)',
                color: TEXT_MUTED,
              }}
            >
              <div>
                <span style={{ letterSpacing: '1px', textTransform: 'uppercase', color: '#a99a78' }}>Offer Code</span>{' '}
                <strong style={{ color: NAVY, fontFamily: FONT_CINZEL, fontWeight: 700, letterSpacing: '.5px' }}>
                  {offer.offer_code || offer.id.slice(0, 12).toUpperCase()}
                </strong>
              </div>
            </div>
          </header>

          {/* ── Body ── */}
          <main className="py-8 space-y-9 text-sm leading-relaxed">

            {/* Greeting */}
            <div className="space-y-4">
              <p className="text-base font-bold" style={{ fontFamily: FONT_CINZEL, color: NAVY }}>
                Dear {studentName},
              </p>
              <p style={{ color: '#26221e', fontFamily: FONT_SANS }}>
                On behalf of <strong style={{ color: INK }}>{companyName}</strong>, we are delighted to extend an
                official offer of internship for the position of{' '}
                <strong style={{ color: INK }}>{position}</strong>. Having reviewed your qualifications, academic
                background, and prior experience, we believe your talent and commitment will be a valuable addition to our
                organization. Please find the terms of engagement and offer details below.
              </p>
            </div>

            {/* Position & Engagement Details Card */}
            <section
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: 'rgba(255,253,245,.65)',
                border: '1.5px solid rgba(184,156,86,.65)',
                boxShadow: 'inset 0 0 0 1px rgba(255,253,245,.9), 0 1px 0 rgba(184,156,86,.2)',
              }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-5"
                style={{ color: NAVY, fontFamily: FONT_SANS }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
                Position &amp; Engagement Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {details.map((field) => (
                  <div key={field.label}>
                    <span
                      className="block mb-1 uppercase tracking-wider"
                      style={{ color: TEXT_MUTED, fontSize: 10, fontWeight: 600, letterSpacing: '1.4px' }}
                    >
                      {field.label}
                    </span>
                    <span className="font-semibold" style={{ color: INK, fontFamily: FONT_SANS }}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Responsibilities */}
            {internship?.responsibilities && internship.responsibilities.length > 0 && (
              <section className="space-y-3">
                <h2
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: NAVY, fontFamily: FONT_SANS }}
                >
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5 pl-1" style={{ color: '#3a342c' }}>
                  {internship.responsibilities.slice(0, 5).map((resp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Terms & Conditions */}
            <section className="space-y-3">
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: NAVY, fontFamily: FONT_SANS }}
              >
                Terms &amp; Conditions
              </h2>
              <ol className="space-y-2.5 pl-1 text-xs leading-relaxed" style={{ color: '#3a342c' }}>
                {DEFAULT_OFFER_TERMS.map((term, i) => (
                  <li key={i} className="flex gap-3">
                    <span style={{ color: GOLD, fontFamily: FONT_CINZEL, fontWeight: 700 }}>{i + 1}.</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Closing & Signatures */}
            <div className="pt-8 flex flex-col sm:flex-row justify-between items-end gap-8" style={{ borderTop: '1px solid rgba(184,156,86,.55)' }}>
              <div className="space-y-5">
                <p className="text-sm" style={{ color: TEXT_SOFT, fontFamily: FONT_SCRIPT, fontStyle: 'italic' }}>
                  Sincerely,
                </p>
                <div className="space-y-1">
                  <div
                    className="inline-block pb-1 pr-8"
                    style={{ borderBottom: `2px solid ${GOLD}` }}
                  >
                    <img
                      src="/signatures/program-coordinator.png"
                      alt="Program Coordinator signature"
                      className="h-14 w-auto object-contain object-left"
                      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                  </div>
                  <p className="text-xs pt-2" style={{ color: '#6b645a' }}>Program Coordinator</p>
                  <p className="text-xs font-semibold" style={{ color: NAVY }}>{companyName}</p>
                </div>
              </div>
            </div>
          </main>

          {/* ── Footer ── */}
          <footer
            className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-widest"
            style={{ borderTop: '1px solid rgba(184,156,86,.55)', color: TEXT_MUTED, letterSpacing: '1.2px' }}
          >
            <div>
              © {new Date().getFullYear()} ZYR0 Platform&nbsp;&nbsp;·&nbsp;&nbsp;{companyName}&nbsp;&nbsp;·&nbsp;&nbsp;Confidential
            </div>
            <div className="font-mono normal-case tracking-normal text-[9.5px]">
              Offer ID <strong style={{ color: NAVY }}>·</strong> <span style={{ wordBreak: 'break-all' }}>{offer.id}</span>
            </div>
          </footer>
        </div>
      </div>

      <PrintErrorDialog
        open={printError !== null}
        onOpenChange={(open) => !open && setPrintError(null)}
        title={printError?.title}
        description={printError?.description ?? ''}
      />
    </div>
  );
}