import React, { useMemo } from 'react';
import { FileCheck, ShieldCheck, Printer, Calendar, Building2, User, MapPin, Clock, DollarSign, ExternalLink, AlertCircle } from 'lucide-react';
import type { OfferLetter } from '@/lib/database.types';

interface OfferLetterDocumentProps {
  offer: OfferLetter;
  onPrint?: () => void;
  showActions?: boolean;
}

export default function OfferLetterDocument({ offer, onPrint, showActions = true }: OfferLetterDocumentProps) {
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

  const issueDateStr = offer.issued_at
    ? new Date(offer.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const expiryDateStr = offer.expires_at
    ? new Date(offer.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '30 days from issue';

  const signatoryName = company?.owner?.full_name || 'Authorized Signatory';
  const signatoryTitle = company?.owner?.title || 'Company Representative';

  const verifyUrl = useMemo(() => {
    return `${window.location.origin}/verify-offer/${offer.id}`;
  }, [offer.id]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
  }, [verifyUrl]);

  const handlePrintWindow = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Action Bar */}
      {showActions && (
        <div className="flex items-center justify-between bg-card border border-border p-3 px-4 rounded-xl shadow-sm print:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Official ZYR0 Verified Offer Letter</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintWindow}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Printable Document Sheet */}
      <div 
        id={`offer-letter-sheet-${offer.id}`}
        className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Status Watermark Stamp */}
        {['Accepted', 'Rejected', 'Revoked'].includes(offer.status) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
            <div 
              className={`text-6xl sm:text-8xl font-extrabold uppercase tracking-widest border-8 px-8 py-3 rounded-3xl opacity-15 rotate-[-22deg] select-none ${
                offer.status === 'Accepted'
                  ? 'text-emerald-600 border-emerald-600'
                  : offer.status === 'Rejected'
                  ? 'text-red-600 border-red-600'
                  : 'text-slate-600 border-slate-600'
              }`}
            >
              {offer.status}
            </div>
          </div>
        )}

        {/* Top Header Band */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-slate-200 gap-6">
          <div className="flex items-center gap-4">
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={companyName} 
                className="w-16 h-16 rounded-xl object-contain border border-slate-100 p-1 bg-slate-50"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = "w-16 h-16 rounded-xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center";
                    fallback.innerText = (companyName || 'CO').substring(0, 2).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {(companyName || 'CO').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{companyName}</h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Official Internship Offer Letter
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div><span className="text-slate-400">Offer ID:</span> <strong className="text-slate-900 font-semibold">{offer.id.slice(0, 12).toUpperCase()}</strong></div>
            <div><span className="text-slate-400">Issued:</span> <strong className="text-slate-700">{issueDateStr}</strong></div>
            <div><span className="text-slate-400">Expires:</span> <strong className="text-slate-700">{expiryDateStr}</strong></div>
          </div>
        </header>

        {/* Body Content */}
        <main className="py-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Greeting */}
          <div>
            <p className="text-base font-semibold text-slate-900 mb-3">Dear {studentName},</p>
            <p>
              On behalf of <strong className="text-slate-900 font-semibold">{companyName}</strong>, we are thrilled to extend an official offer of internship for the position of <strong className="text-slate-900 font-semibold">{position}</strong>. After evaluating your background and qualifications, we believe your skills and energy will make a strong contribution to our team.
            </p>
          </div>

          {/* Offer Details Card */}
          <section className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Position & Engagement Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Candidate Name</span>
                <span className="font-semibold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Position Title</span>
                <span className="font-semibold text-slate-900">{position}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Internship Category</span>
                <span className="font-semibold text-slate-900">{internshipType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Work Arrangement</span>
                <span className="font-semibold text-slate-900">{workMode} ({location})</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Duration</span>
                <span className="font-semibold text-slate-900">{duration}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Proposed Start Date</span>
                <span className="font-semibold text-slate-900">{startDate}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Stipend / Compensation</span>
                <span className="font-semibold text-slate-900">{compensation}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Reporting Signatory</span>
                <span className="font-semibold text-slate-900">{signatoryName} ({signatoryTitle})</span>
              </div>
            </div>
          </section>

          {/* Key Responsibilities */}
          {internship?.responsibilities && internship.responsibilities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Key Responsibilities
              </h2>
              <ul className="space-y-2 text-slate-600 pl-4 list-disc marker:text-blue-600">
                {internship.responsibilities.slice(0, 5).map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Terms & Conditions */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Terms & Conditions
            </h2>
            <ol className="space-y-2 text-slate-600 pl-4 list-decimal marker:text-slate-400 text-xs leading-relaxed">
              <li>This offer is contingent upon verification of candidate credentials and completion of required onboarding paperwork.</li>
              <li>You are expected to maintain professional standards, confidentiality, and data safety during the internship.</li>
              <li>This offer remains valid until <strong className="text-slate-800">{expiryDateStr}</strong>, after which it may expire automatically unless extended.</li>
            </ol>
          </section>

          {/* Closing & Signatures */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Sincerely,</p>
              <div className="space-y-1">
                <div className="h-10 flex items-end">
                  <span className="font-serif italic text-lg text-slate-800 font-bold border-b border-slate-300 pb-1 pr-6">
                    {signatoryName}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900">{signatoryName}</p>
                <p className="text-xs text-slate-500">{signatoryTitle}</p>
                <p className="text-xs font-medium text-blue-600">{companyName}</p>
              </div>
            </div>

            {/* Verification QR Box */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
              <img 
                src={qrCodeUrl} 
                alt="Verification QR Code" 
                className="w-20 h-20 rounded-md border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Verified Credential
                </div>
                <p className="text-slate-500 text-[11px] max-w-[140px] leading-tight">
                  Scan to verify authenticity on ZYR0 platform.
                </p>
                <a 
                  href={verifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono text-[10px] inline-flex items-center gap-0.5"
                >
                  Verify URL <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>
            © {new Date().getFullYear()} ZYR0 Platform · {companyName} · Confidential Document
          </div>
          <div className="font-mono">
            ID: {offer.id}
          </div>
        </footer>
      </div>
    </div>
  );
}
