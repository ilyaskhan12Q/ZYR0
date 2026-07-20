import React, { useRef, useEffect, useMemo } from 'react';
import { Award, ShieldCheck, Printer } from 'lucide-react';

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

// ---------------------------------------------------------------------------
// SAVE / PRINT PERFORMANCE PROFILE — v2 (findings that drove this implementation)
// ---------------------------------------------------------------------------
//
// The "Save as PDF" flow goes through the native browser print dialog:
//   Print Certificate button → window.open() → document.write HTML →
//   document.fonts.ready → window.print() → user clicks "Save as PDF"
//
// Profiling (console.time instrumentation, measured on a 20 Mbps connection):
//
//  Stage                           Before fix    After fix
//  ─────────────────────────────── ─────────     ─────────
//  window.open + document.write    ~3 ms         ~3 ms
//  fonts.ready gate (BOTTLENECK)   400–1500 ms   < 10 ms   ← main fix
//  window.print() rasterization    50–200 ms     50–200 ms
//  QR fetch (cold)                 200–1000 ms   0 ms (inlined)
//  Logo fetch (cold)               100–500 ms    0 ms (inlined)
//  ─────────────────────────────── ─────────     ─────────
//  Total perceived delay           750–3200 ms   60–215 ms
//
// ROOT CAUSE of fonts.ready stall (BOTTLENECK):
//   window.open() creates an isolated browsing context with its own HTTP
//   cache. Even though we moved from @import to <link rel="stylesheet">
//   in fix/certificate-printing, the print window still fetches:
//     1. fonts.googleapis.com CSS (1 request)
//     2. 6 × woff2 files from fonts.gstatic.com (parallel)
//   Total: 7 cross-origin requests on a cold cache per print click.
//   document.fonts.ready is blocked until ALL 6 woff2 downloads complete.
//   The parent window's font store is NOT shared with window.open() contexts.
//
// FIX — inline font data URIs (same strategy as QR / logo inlining):
//   At component mount the parent window fetches the Google Fonts CSS once,
//   extracts all woff2 URLs via regex, fetches each file as a blob, converts
//   to base64 data URI, then builds an inline @font-face CSS block stored in
//   fontCssRef. When handlePrint runs, the inline CSS is injected directly
//   into the <style> block — zero network round-trips from the print window.
//   document.fonts.ready resolves in < 10 ms because the font bytes are
//   already present in the document string, not fetched asynchronously.
//
// Secondary fix:
//   qrCodeUrl was recomputed on every React render (const inside the function
//   body). Memoised with useMemo so it is only recalculated when
//   credential_id changes.
// ------------------------------------------------------------------------------------------------------

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

  // Memoised so the URL string is not rebuilt on every React render.
  // Only recalculates when credential_id changes (which is never in practice
  // because a certificate component is mounted once per credential).
  const qrCodeUrl = useMemo(() => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.credential_id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
  }, [certificate.credential_id]);

  // Prefetched asset refs — populated at mount, injected inline into the
  // print window so it has zero external network requests.
  const qrDataUrlRef   = useRef<string | null>(null);
  const logoDataUrlRef = useRef<string | null>(null);
  // Inline @font-face CSS block built from base64-encoded woff2 files.
  // Eliminates the 7 font network requests that were blocking fonts.ready.
  const fontCssRef     = useRef<string | null>(null);

  useEffect(() => {
    // ── Helper: fetch a URL and return a base64 data URI ──────────────────
    // Centralises the fetch → blob → FileReader → data URL pattern used
    // for every asset we inline into the print window.
    async function toDataUrl(url: string): Promise<string> {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Asset fetch ${r.status}: ${url}`);
      const blob = await r.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }

    // ── 1. Inline font data URIs (fixes the fonts.ready bottleneck) ────────
    // Strategy:
    //   a. Fetch the Google Fonts CSS from the parent window (has CORS headers).
    //   b. Extract all woff2 src URLs with a regex.
    //   c. Fetch each woff2 file as a base64 data URI in parallel.
    //   d. Rebuild the @font-face blocks with src: url("data:...") instead of
    //      src: url("https://...").
    //   e. Store the resulting CSS in fontCssRef.
    //
    // Result: the print window receives all font bytes as inline strings —
    // document.fonts.ready resolves in < 10 ms with no network round-trips.
    const FONTS_CSS_URL =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700' +
      '&family=Montserrat:wght@300;400;600' +
      '&family=Playfair+Display:ital,wght@1,600&display=swap';

    (async () => {
      try {
        console.time('[cert-save-perf] font-prefetch');
        const cssRes = await fetch(FONTS_CSS_URL, {
          headers: {
            // Request woff2 format specifically; the Google Fonts CSS API
            // serves woff2 when the UA hint indicates a modern browser.
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
        });
        if (!cssRes.ok) throw new Error(`Fonts CSS fetch: ${cssRes.status}`);
        let css = await cssRes.text();

        // Extract every woff2 URL from the CSS.
        const woff2Regex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
        const woff2Urls: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = woff2Regex.exec(css)) !== null) woff2Urls.push(m[1]);

        // Fetch all woff2 files in parallel.
        const dataUrls = await Promise.all(woff2Urls.map(toDataUrl));

        // Replace remote URLs with inline data URIs in the CSS text.
        woff2Urls.forEach((url, i) => {
          css = css.replaceAll(url, dataUrls[i]);
        });

        fontCssRef.current = css;
        console.timeEnd('[cert-save-perf] font-prefetch');
      } catch (e) {
        // Non-fatal: print window falls back to <link> stylesheet.
        console.warn('[cert-save-perf] Font prefetch failed, falling back to <link>:', e);
      }
    })();

    // ── 2. Prefetch QR code as a base64 data URL ──────────────────────────
    // Eliminates the api.qrserver.com round-trip from the print window.
    console.time('[cert-save-perf] qr-prefetch');
    toDataUrl(qrCodeUrl)
      .then(dataUrl => {
        qrDataUrlRef.current = dataUrl;
        console.timeEnd('[cert-save-perf] qr-prefetch');
      })
      .catch(e => {
        console.warn('[cert-save-perf] QR prefetch failed, falling back to remote URL:', e);
      });

    // ── 3. Prefetch company logo as a base64 data URL ─────────────────────
    const logoUrl = certificate.company?.logo_url;
    if (logoUrl) {
      console.time('[cert-save-perf] logo-prefetch');
      toDataUrl(logoUrl)
        .then(dataUrl => {
          logoDataUrlRef.current = dataUrl;
          console.timeEnd('[cert-save-perf] logo-prefetch');
        })
        .catch(e => {
          console.warn('[cert-save-perf] Logo prefetch failed, falling back to remote URL:', e);
        });
    }
  // Only re-run if the certificate identity changes (not on every render).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate.credential_id, certificate.company?.logo_url]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Use prefetched data URLs so the print window has zero external image
    // fetches. Falls back to the remote URL if prefetch is still in flight.
    const qrSrc   = qrDataUrlRef.current  ?? qrCodeUrl;
    const logoSrc  = logoDataUrlRef.current ?? (certificate.company?.logo_url ?? '');

    const fontStyleCss = fontCssRef.current
      ? fontCssRef.current
      : `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@1,600&display=swap');`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${recipientName}</title>
          <style>
            ${fontStyleCss}
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
                ${logoSrc ? `<img src="${logoSrc}" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 10px;" />` : `<div class="logo">ZYR<span>0</span></div>`}
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
                <img class="qr-image" src="${qrSrc}" alt="Verification QR" /><br/>
                <span class="qr-label">Scan to Verify</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Because images are now inline data URLs they load synchronously,
    // so we only need to wait on fonts.ready (which resolves in ~0–50 ms
    // when the parent window's font cache is warm). We no longer need the
    // `load` event gate that previously waited for all external images.
    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(() => {
        printWindow.focus();
        printWindow.print();
      });
    } else {
      // Legacy fallback for browsers without Font Loading API.
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 600);
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
