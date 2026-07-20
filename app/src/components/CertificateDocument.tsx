import React from 'react';
import { Award, ShieldCheck, Download, Printer } from 'lucide-react';

interface CertificateDocumentProps {
  certificate: {
    title: string;
    credential_id: string;
    issue_date: string;
    blockchain_hash?: string;
    skills?: string[];
    recipient?: {
      full_name: string;
    } | any;
    recipientName?: string;
    company?: {
      name: string;
      logo_url?: string;
    } | any;
    internship?: {
      title: string;
    } | any;
    issuer?: {
      full_name: string;
      title?: string;
      role?: string;
      department?: string;
    } | any;
  };
}

export default function CertificateDocument({ certificate }: CertificateDocumentProps) {
  const recipientName = certificate.recipient?.full_name || certificate.recipientName || 'Intern';
  const companyName = certificate.company?.name || 'Partner Company';
  const internshipTitle = certificate.internship?.title || certificate.title || 'Internship';
  const issueDateStr = new Date(certificate.issue_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const supervisorName = certificate.issuer?.full_name || 'Program Supervisor';
  const supervisorTitle = certificate.issuer?.title || 'Program Coordinator';

  const verifyUrl = `${window.location.origin}/verify/${certificate.credential_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Write the document first so the parser can start fetching fonts,
    // then wait for document.fonts.ready before calling window.print().
    // Without this guard the browser may print before Playfair Display
    // has loaded, causing a fallback font with different character metrics
    // that changes text width and breaks the centred-name layout.
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${recipientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@1,600&display=swap');
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              font-family: 'Montserrat', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cert-container {
              width: 100%;
              max-width: 1120px;
              height: 792px;
              margin: 0 auto;
              position: relative;
              background: #fff;
              box-sizing: border-box;
              padding: 40px;
            }
            .cert-border {
              width: 100%;
              height: 100%;
              border: 12px double #b89c56;
              box-sizing: border-box;
              position: relative;
              padding: 40px;
              background: radial-gradient(circle, rgba(255,255,255,1) 60%, rgba(250,248,242,1) 100%);
            }
            .cert-corner-t-l { position: absolute; top: 15px; left: 15px; width: 40px; height: 40px; border-top: 4px solid #b89c56; border-left: 4px solid #b89c56; }
            .cert-corner-t-r { position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; border-top: 4px solid #b89c56; border-right: 4px solid #b89c56; }
            .cert-corner-b-l { position: absolute; bottom: 15px; left: 15px; width: 40px; height: 40px; border-bottom: 4px solid #b89c56; border-left: 4px solid #b89c56; }
            .cert-corner-b-r { position: absolute; bottom: 15px; right: 15px; width: 40px; height: 40px; border-bottom: 4px solid #b89c56; border-right: 4px solid #b89c56; }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo {
              font-family: 'Cinzel', serif;
              font-size: 28px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: 4px;
            }
            .logo span {
              color: #b89c56;
            }
            .title {
              font-family: 'Cinzel', serif;
              font-size: 36px;
              color: #1e293b;
              text-align: center;
              margin: 20px 0 10px 0;
              letter-spacing: 2px;
              font-weight: 700;
            }
            .subtitle {
              text-align: center;
              font-size: 14px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 3px;
              margin-bottom: 40px;
            }
            .present {
              text-align: center;
              font-size: 16px;
              color: #64748b;
              margin-bottom: 10px;
            }
            .recipient {
              /* Use display:block + width:100% so text-align:center correctly
                 centres the element itself within its parent in both the
                 screen renderer and the browser print layout engine.
                 display:inline-block only centres text *within* the box,
                 not the box within its parent, causing the name to shift
                 to the left when printed / exported as PDF. */
              display: block;
              width: 100%;
              text-align: center;
              font-family: 'Playfair Display', serif;
              font-size: 44px;
              color: #b89c56;
              font-style: italic;
              margin: 10px 0 20px 0;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
              box-sizing: border-box;
            }
            .description {
              text-align: center;
              font-size: 15px;
              line-height: 1.8;
              color: #334155;
              max-width: 750px;
              margin: 0 auto 40px auto;
            }
            .highlight {
              font-weight: 600;
              color: #0f172a;
            }
            .footer-sections {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 60px;
              padding: 0 40px;
            }
            .sig-block {
              text-align: center;
              width: 200px;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              margin-top: 50px;
              padding-top: 8px;
            }
            .sig-name {
              font-size: 12px;
              font-weight: 600;
              color: #1e293b;
            }
            .sig-title {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .seal-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .seal-gold {
              width: 80px;
              height: 80px;
              background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
              border-radius: 50%;
              border: 4px dashed #fff;
              box-shadow: 0 0 0 4px #d97706, 0 4px 10px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .badge-text {
              font-family: 'Cinzel', serif;
              font-size: 10px;
              font-weight: 700;
              margin-top: 8px;
              color: #b89c56;
              letter-spacing: 1px;
            }
            .meta-block {
              position: absolute;
              bottom: 30px;
              left: 55px;
              font-size: 10px;
              color: #94a3b8;
              font-family: monospace;
            }
            .qr-block {
              position: absolute;
              bottom: 30px;
              right: 55px;
              text-align: center;
            }
            .qr-image {
              width: 70px;
              height: 70px;
              border: 1px solid #e2e8f0;
              padding: 3px;
              background: white;
            }
            .qr-label {
              font-size: 8px;
              color: #64748b;
              margin-top: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            @media print {
              /* Match the A4 landscape page box exactly.
                 Keep the same padding as the screen rule (40px) so the
                 interior .cert-border geometry — and therefore the visual
                 centre — is identical between preview and exported PDF.
                 Previously padding:0 was shifting the centre-point. */
              body {
                margin: 0;
                padding: 0;
                width: 297mm;
                height: 210mm;
              }
              .cert-container {
                width: 297mm;
                height: 210mm;
                margin: 0;
                padding: 40px;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <div class="cert-border">
              <div class="cert-corner-t-l"></div>
              <div class="cert-corner-t-r"></div>
              <div class="cert-corner-b-l"></div>
              <div class="cert-corner-b-r"></div>
              
              <div class="header">
                ${certificate.company?.logo_url ? `<img src="${certificate.company.logo_url}" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 10px;" />` : `<div class="logo">ZYR<span>0</span></div>`}
              </div>
              
              <div class="title">Certificate of Completion</div>
              <div class="subtitle">Verifiable Digital Internship Credential</div>
              
              <div class="present">This is proudly presented to</div>
              <div class="recipient">${recipientName}</div>
              
              <div class="description">
                for successfully completing the <span class="highlight">${internshipTitle}</span> program
                collaborating with <span class="highlight">${companyName}</span> from ZYR0 Internship Portal. 
                The candidate has successfully finalized all assigned tasks and industry-level milestones, 
                demonstrating profound commitment, outstanding skills, and exceptional professionalism.
              </div>
              
              <div class="footer-sections">
                <div class="sig-block">
                  <div style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #334155; height: 30px;">
                    ${supervisorName}
                  </div>
                  <div class="sig-line">
                    <div class="sig-name">${supervisorName}</div>
                    <div class="sig-title">${supervisorTitle}, ${companyName}</div>
                  </div>
                </div>
                
                <div class="seal-container">
                  <div class="seal-gold">
                    <svg style="width:40px; height:40px; fill:none; stroke:currentColor; stroke-width:2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 11l2 2 4-4"/>
                    </svg>
                  </div>
                  <div class="badge-text">VERIFIED SECURE</div>
                </div>
                
                <div class="sig-block">
                  <div style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #334155; height: 30px;">
                    ZYR0 Director
                  </div>
                  <div class="sig-line">
                    <div class="sig-name">Academic Director</div>
                    <div class="sig-title">ZYR0 Platforms</div>
                  </div>
                </div>
              </div>
              
              <div class="meta-block">
                ID: ${certificate.credential_id}<br/>
                Issued: ${issueDateStr}<br/>
                Hash: ${certificate.blockchain_hash ? certificate.blockchain_hash.slice(0, 24) + '...' : 'N/A'}
              </div>
              
              <div class="qr-block">
                <img class="qr-image" src="${qrCodeUrl}" alt="Verification QR" /><br/>
                <span class="qr-label">Scan to Verify</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for all fonts declared via @import to fully load before
    // triggering the print dialog. Falls back to a 600 ms delay for
    // browsers that do not support document.fonts (IE / old Edge).
    const triggerPrint = () => {
      if (printWindow.document.fonts && printWindow.document.fonts.ready) {
        printWindow.document.fonts.ready.then(() => {
          printWindow.focus();
          printWindow.print();
        });
      } else {
        // Legacy fallback: give the browser 600 ms to fetch fonts
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 600);
      }
    };

    // document.close() is synchronous but the load event fires after
    // all sub-resources (images, fonts) have been fetched.
    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      printWindow.addEventListener('load', triggerPrint);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-inner relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-600/30 dark:border-amber-500/20 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-600/30 dark:border-amber-500/20 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-600/30 dark:border-amber-500/20 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-amber-600/30 dark:border-amber-500/20 rounded-br-lg pointer-events-none" />

      <div className="bg-white dark:bg-slate-950 border-4 double border-amber-500/40 p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center text-center relative z-10 max-w-4xl mx-auto">
        {/* Certificate Seal/Badge header */}
        <div className="flex items-center gap-4 mb-6">
          {certificate.company?.logo_url ? (
            <img 
              src={certificate.company.logo_url} 
              alt={companyName} 
              className="h-16 max-w-[160px] object-contain bg-white p-1 rounded border border-slate-200 dark:border-slate-800" 
            />
          ) : (
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center">
              <Award className="w-9 h-9" />
            </div>
          )}
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-wider">
          Certificate of Completion
        </h2>
        <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2 font-semibold">
          Verifiable Digital Internship Credential
        </p>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-8">
          This is proudly presented to
        </p>
        <p className="font-serif text-3xl sm:text-4xl text-amber-600 dark:text-amber-500 italic font-medium my-3 border-b border-slate-200 dark:border-slate-800 pb-2 px-10">
          {recipientName}
        </p>

        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed mt-4">
          for successfully completing the <span className="font-semibold text-slate-900 dark:text-white">{internshipTitle}</span> program
          in collaboration with <span className="font-semibold text-slate-900 dark:text-white">{companyName}</span> through the ZYR0 Platform.
          The candidate has demonstrated exceptional proficiency, dedication, and technical skill in executing all professional responsibilities.
        </p>

        {/* Certificate metadata grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-12 pt-8 border-t border-slate-100 dark:border-slate-900">
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm italic text-slate-700 dark:text-slate-300">{supervisorName}</span>
            <div className="w-32 border-t border-slate-300 dark:border-slate-700 mt-2 pt-1">
              <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500">{supervisorTitle}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{companyName}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-950">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 mt-2 tracking-wider">
              VERIFIED RECORD
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-sm italic text-slate-700 dark:text-slate-300">ZYR0 Director</span>
            <div className="w-32 border-t border-slate-300 dark:border-slate-700 mt-2 pt-1">
              <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500">Academic Director</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">ZYR0 Platforms</p>
            </div>
          </div>
        </div>

        {/* Technical skills tag section */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Demonstrated Skills & Technologies
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xl">
              {certificate.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer verification & QR block */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 text-left">
          <div className="space-y-1 font-mono text-[9px] text-slate-400 dark:text-slate-500">
            <p>CREDENTIAL ID: <span className="text-slate-600 dark:text-slate-300 font-semibold">{certificate.credential_id}</span></p>
            <p>ISSUE DATE: <span className="text-slate-600 dark:text-slate-300 font-semibold">{issueDateStr}</span></p>
            {certificate.blockchain_hash && (
              <p className="truncate max-w-[280px]">HASH: <span className="text-slate-600 dark:text-slate-300 font-semibold">{certificate.blockchain_hash}</span></p>
            )}
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-900/80">
            <img src={qrCodeUrl} alt="Verify QR Code" className="w-12 h-12 bg-white p-0.5 rounded" />
            <div>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Scan to Verify</p>
              <p className="text-[8px] text-slate-400 dark:text-slate-500">Tamper-proof digital copy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons (Print/Download PDF) */}
      <div className="flex justify-end gap-3 mt-6 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Certificate
        </button>
      </div>
    </div>
  );
}
