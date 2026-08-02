import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { buildCertificateHTML, CERT_WIDTH, CERT_HEIGHT } from './certificateTemplate';

interface CertificateDocumentProps {
  certificate: {
    title: string;
    credential_id: string;
    issue_date: string;
    blockchain_hash?: string;
    skills?: string[];
    start_date?: string | null;
    end_date?: string | null;
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
      start_date?: string | null;
      end_date?: string | null;
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
// PRINT PERFORMANCE NOTES — kept from the previous implementation:
//   The "Save as PDF" flow goes through window.open() → document.write().
//   Google Fonts woff2 files are prefetched in the parent window at mount and
//   inlined as base64 @font-face data URIs so the print window performs zero
//   network round-trips and document.fonts.ready resolves in < 10 ms.
//   The QR code is prefetched the same way (api.qrserver.com round-trip
//   eliminated from the print window).
// ---------------------------------------------------------------------------

export default function CertificateDocument({ certificate }: CertificateDocumentProps) {
  const recipientName = certificate.recipient?.full_name || certificate.recipientName || '[INSERT FULL NAME]';
  const companyName = certificate.company?.name || '[INSERT COMPANY NAME]';
  const internshipTitle = certificate.internship?.title || certificate.title || '[INSERT INTERNSHIP TITLE]';
  const issueDateStr = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '[INSERT ISSUE DATE]';
  const supervisorName = certificate.issuer?.full_name || '[INSERT ISSUER NAME]';
  const credentialId = certificate.credential_id || '[INSERT CREDENTIAL ID]';
  const skills = useMemo(() => certificate.skills || [], [certificate.skills]);

  // Real internship period: certificate snapshot → internship → placeholder.
  const formatDate = (d?: string | null) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const periodStart = certificate.start_date || certificate.internship?.start_date || null;
  const periodEnd = certificate.end_date || certificate.internship?.end_date || null;
  const dates = periodStart && periodEnd
    ? `${formatDate(periodStart)}, to ${formatDate(periodEnd)}`
    : '[Insert Dates, e.g., Month Day, Year, to Month Day, Year]';

  const qrCodeUrl = useMemo(() => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.credential_id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}`;
  }, [certificate.credential_id]);

  // Inline @font-face CSS built from base64-encoded woff2 files.
  const fontCssRef = useRef<string | null>(null);
  const qrDataUrlRef = useRef<string | null>(null);
  const crestDataUrlRef = useRef<string | null>(null);
  const isoDataUrlRef = useRef<string | null>(null);
  const qcaDataUrlRef = useRef<string | null>(null);
  const oLogoDataUrlRef = useRef<string | null>(null);
  const watermarkDataUrlRef = useRef<string | null>(null);

  // Real logo assets (all prefetched → inlined into the print window).
  const LOGO_URLS = useMemo(() => ({
    watermark: `${window.location.origin}/zyro-logo.png`,
    crest: `${window.location.origin}/logos/state-emblem-of-pakistan.svg`,
    iso: `${window.location.origin}/logos/iso-9001-sgs.png`,
    qca: `${window.location.origin}/logos/tuv-rheinland-iso-9001.png`,
    o: `${window.location.origin}/zyro-logo.png`,
  }), []);
  const logoRefs = {
    watermark: watermarkDataUrlRef,
    crest: crestDataUrlRef,
    iso: isoDataUrlRef,
    qca: qcaDataUrlRef,
    o: oLogoDataUrlRef,
  } as const;

  useEffect(() => {
    async function toDataUrl(url: string): Promise<string> {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Asset fetch ${r.status}: ${url}`);
      const blob = await r.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }

    const FONTS_CSS_URL =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700' +
      '&family=Montserrat:wght@300;400;600;800' +
      '&family=Playfair+Display:ital,wght@1,600&display=swap';

    (async () => {
      try {
        const cssRes = await fetch(FONTS_CSS_URL, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
        });
        if (!cssRes.ok) throw new Error(`Fonts CSS fetch: ${cssRes.status}`);
        let css = await cssRes.text();

        const woff2Regex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
        const woff2Urls: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = woff2Regex.exec(css)) !== null) woff2Urls.push(m[1]);

        const dataUrls = await Promise.all(woff2Urls.map(toDataUrl));
        woff2Urls.forEach((url, i) => {
          css = css.replaceAll(url, dataUrls[i]);
        });

        fontCssRef.current = css;
      } catch (e) {
        console.warn('[cert-save-perf] Font prefetch failed, falling back to <link>:', e);
      }
    })();

    toDataUrl(qrCodeUrl)
      .then(dataUrl => {
        qrDataUrlRef.current = dataUrl;
      })
      .catch(e => {
        console.warn('[cert-save-perf] QR prefetch failed, falling back to remote URL:', e);
      });

    // Prefetch all real logo assets in parallel → zero network in print window.
    (Object.keys(LOGO_URLS) as Array<keyof typeof LOGO_URLS>).forEach(key => {
      toDataUrl(LOGO_URLS[key])
        .then(dataUrl => {
          logoRefs[key].current = dataUrl;
        })
        .catch(e => {
          console.warn(`[cert-save-perf] Logo prefetch failed (${key}), falling back to origin URL:`, e);
        });
    });
    // Only re-run if the certificate identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate.credential_id]);

  const baseOptions = useMemo(() => ({
    recipientName,
    internshipTitle,
    companyName,
    dates,
    credentialId,
    issueDateStr,
    skills,
    supervisorName,
  }), [recipientName, internshipTitle, companyName, dates, issueDateStr, credentialId, skills, supervisorName]);

  // Preview iframe — same document as print, scaled to fit the card.
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  useEffect(() => {
    const el = frameWrapRef.current;
    if (!el) return;
    const update = () => setPreviewScale(el.clientWidth / CERT_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const previewHtml = useMemo(
    () => buildCertificateHTML({
      ...baseOptions,
      qrSrc: qrCodeUrl,
      logoSrc: LOGO_URLS.watermark,
      crestSrc: LOGO_URLS.crest,
      isoSrc: LOGO_URLS.iso,
      oLogoSrc: LOGO_URLS.o,
      qcaSrc: LOGO_URLS.qca,
      fontCss: null,
    }),
    [baseOptions, qrCodeUrl, LOGO_URLS]
  );

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = buildCertificateHTML({
      ...baseOptions,
      qrSrc: qrDataUrlRef.current ?? qrCodeUrl,
      logoSrc: watermarkDataUrlRef.current ?? LOGO_URLS.watermark,
      crestSrc: crestDataUrlRef.current ?? LOGO_URLS.crest,
      isoSrc: isoDataUrlRef.current ?? LOGO_URLS.iso,
      oLogoSrc: oLogoDataUrlRef.current ?? LOGO_URLS.o,
      qcaSrc: qcaDataUrlRef.current ?? LOGO_URLS.qca,
      fontCss: fontCssRef.current,
    });

    printWindow.document.write(html);
    printWindow.document.close();

    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(() => {
        printWindow.focus();
        printWindow.print();
      });
    } else {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 600);
    }
  };

  return (
    <div className="certificate-print-root bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-inner relative">
      <div
        ref={frameWrapRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${CERT_WIDTH} / ${CERT_HEIGHT}`,
          overflow: 'hidden',
          borderRadius: 8,
          boxShadow: '0 12px 36px rgba(0,0,0,0.28)',
          background: '#f1ece0',
        }}
      >
        <iframe
          srcDoc={previewHtml}
          title="Certificate preview"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CERT_WIDTH,
            height: CERT_HEIGHT,
            border: 0,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>

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
