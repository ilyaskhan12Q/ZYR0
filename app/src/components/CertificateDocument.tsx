import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import PrintErrorDialog from './PrintErrorDialog';
import { buildCertificateHTML, CERT_WIDTH, CERT_HEIGHT } from './certificateTemplate';
import { Loader } from '@/components/common/Loader';

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
  /** Public verification pages pass false so only the dashboard can print/download. */
  showActions?: boolean;
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

export default function CertificateDocument({ certificate, showActions = true }: CertificateDocumentProps) {
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
  const [popupBlocked, setPopupBlocked] = useState(false);
  /** All inlined assets; null until every font/logo/signature/QR is ready. */
  const [inlineAssets, setInlineAssets] = useState<{
    fontCss: string | null;
    qr: string | null;
    logos: Record<string, string>;
    paper: string | null;
  } | null>(null);
  const assetsReady = inlineAssets !== null;

  // Real internship period: certificate snapshot → internship → placeholder.
  const formatDate = (d?: string | null) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;
  const periodStart = certificate.start_date || certificate.internship?.start_date || null;
  const periodEnd = certificate.end_date || certificate.internship?.end_date || null;
  const dates = periodStart && periodEnd
    ? `${formatDate(periodStart)} – ${formatDate(periodEnd)}`
    : '[Insert Dates, e.g., August 2025 – October 2025]';

  const qrCodeUrl = useMemo(() => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.credential_id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}`;
  }, [certificate.credential_id]);

  // Real logo assets (all prefetched → inlined into the print window).
  const LOGO_URLS = useMemo(() => ({
    watermark: `${window.location.origin}/zyro-logo.png`,
    crest: `${window.location.origin}/logos/state-emblem-of-pakistan.svg`,
    iso: `${window.location.origin}/logos/iso-9001-sgs.png`,
    qca: `${window.location.origin}/logos/tuv-rheinland-iso-9001.png`,
    o: `${window.location.origin}/zyro-logo.png`,
    sig: `${window.location.origin}/signatures/program-coordinator.png`,
    dirSig: `${window.location.origin}/signatures/director.png`,
    seal: `${window.location.origin}/seal_ZYR0.png`,
  }), []);

  useEffect(() => {
    let cancelled = false;
    setInlineAssets(null);

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

    // A stalled request must not keep the certificate hidden forever.
    const withTimeout = <T,>(p: Promise<T>, ms = 20000) =>
      Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Asset timeout')), ms)),
      ]);

    const FONTS_CSS_URL =
      'https://fonts.googleapis.com/css2?family=Agbalumo' +
      '&family=Cinzel:wght@500;700' +
      '&family=Montserrat:wght@300;400;600;800' +
      '&family=Playfair+Display:ital,wght@1,600&display=swap';

    (async () => {
      const result: {
        fontCss: string | null;
        qr: string | null;
        logos: Record<string, string>;
        paper: string | null;
      } = { fontCss: null, qr: null, logos: {}, paper: null };

      const jobs: Promise<unknown>[] = [];

      jobs.push((async () => {
        try {
          const cssRes = await withTimeout(fetch(FONTS_CSS_URL, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
          }));
          if (!cssRes.ok) throw new Error(`Fonts CSS fetch: ${cssRes.status}`);
          let css = await cssRes.text();

          const woff2Regex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
          const woff2Urls: string[] = [];
          let m: RegExpExecArray | null;
          while ((m = woff2Regex.exec(css)) !== null) woff2Urls.push(m[1]);

          const dataUrls = await Promise.all(woff2Urls.map(url => withTimeout(toDataUrl(url))));
          woff2Urls.forEach((url, i) => {
            css = css.replaceAll(url, dataUrls[i]);
          });

          result.fontCss = css;
        } catch (e) {
          console.warn('[cert-save-perf] Font prefetch failed, falling back to <link>:', e);
        }
      })());

      jobs.push(withTimeout(toDataUrl(qrCodeUrl))
        .then(dataUrl => {
          result.qr = dataUrl;
        })
        .catch(e => {
          console.warn('[cert-save-perf] QR prefetch failed, falling back to remote URL:', e);
        }));

      // Prefetch all real logo assets in parallel → zero network in print window.
      (Object.keys(LOGO_URLS) as Array<keyof typeof LOGO_URLS>).forEach(key => {
        jobs.push(withTimeout(toDataUrl(LOGO_URLS[key]))
          .then(dataUrl => {
            result.logos[key] = dataUrl;
          })
          .catch(e => {
            console.warn(`[cert-save-perf] Logo prefetch failed (${key}), falling back to origin URL:`, e);
          }));
      });

      // Paper texture is the largest asset — inline it too so slow connections
      // never reveal a half-textured certificate.
      jobs.push(withTimeout(toDataUrl(`${window.location.origin}/certificate-paper.webp`))
        .then(dataUrl => {
          result.paper = dataUrl;
        })
        .catch(e => {
          console.warn('[cert-save-perf] Paper texture prefetch failed, falling back to URL:', e);
        }));

      // Reveal the certificate only once everything has settled.
      await Promise.allSettled(jobs);
      if (!cancelled) setInlineAssets(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [certificate.credential_id, qrCodeUrl, LOGO_URLS]);

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
      qrSrc: inlineAssets?.qr ?? qrCodeUrl,
      logoSrc: inlineAssets?.logos.watermark ?? LOGO_URLS.watermark,
      crestSrc: inlineAssets?.logos.crest ?? LOGO_URLS.crest,
      isoSrc: inlineAssets?.logos.iso ?? LOGO_URLS.iso,
      oLogoSrc: inlineAssets?.logos.o ?? LOGO_URLS.o,
      qcaSrc: inlineAssets?.logos.qca ?? LOGO_URLS.qca,
      sigSrc: inlineAssets?.logos.sig ?? LOGO_URLS.sig,
      dirSigSrc: inlineAssets?.logos.dirSig ?? LOGO_URLS.dirSig,
      sealSrc: inlineAssets?.logos.seal ?? LOGO_URLS.seal,
      paperSrc: inlineAssets?.paper ?? `${window.location.origin}/certificate-paper.webp`,
      fontCss: inlineAssets?.fontCss ?? null,
    }),
    [baseOptions, qrCodeUrl, LOGO_URLS, inlineAssets]
  );

  const handlePrint = async () => {
    if (!inlineAssets) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPopupBlocked(true);
      return;
    }

    const html = buildCertificateHTML({
      ...baseOptions,
      qrSrc: inlineAssets.qr ?? qrCodeUrl,
      logoSrc: inlineAssets.logos.watermark ?? LOGO_URLS.watermark,
      crestSrc: inlineAssets.logos.crest ?? LOGO_URLS.crest,
      isoSrc: inlineAssets.logos.iso ?? LOGO_URLS.iso,
      oLogoSrc: inlineAssets.logos.o ?? LOGO_URLS.o,
      qcaSrc: inlineAssets.logos.qca ?? LOGO_URLS.qca,
      sigSrc: inlineAssets.logos.sig ?? LOGO_URLS.sig,
      dirSigSrc: inlineAssets.logos.dirSig ?? LOGO_URLS.dirSig,
      sealSrc: inlineAssets.logos.seal ?? LOGO_URLS.seal,
      paperSrc: inlineAssets.paper ?? `${window.location.origin}/certificate-paper.webp`,
      fontCss: inlineAssets.fontCss,
    });

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for every image and font inside the print window before opening the
    // dialog — otherwise slow connections print a sheet with missing assets.
    const doc = printWindow.document;
    const imagesDone = Promise.all(
      Array.from(doc.images).map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            })
      )
    );
    const fontsDone = doc.fonts?.ready ?? Promise.resolve();

    await Promise.race([
      Promise.all([imagesDone, fontsDone]),
      new Promise(resolve => setTimeout(resolve, 15000)),
    ]);

    if (printWindow.closed) return;
    printWindow.focus();
    printWindow.print();
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
        {assetsReady ? (
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
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
            <Loader variant="container" label="Preparing certificate…" />
            <p className="text-xs font-medium">Loading fonts, signature and seal</p>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex justify-end gap-3 mt-6 no-print">
          <button
            onClick={handlePrint}
            disabled={!assetsReady}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" /> {assetsReady ? 'Print Certificate' : 'Preparing…'}
          </button>
        </div>
      )}

      <PrintErrorDialog
        open={popupBlocked}
        onOpenChange={setPopupBlocked}
        description="Your browser blocked the pop-up that prepares the certificate for printing. Allow pop-ups for this site, then click Print Certificate again."
      />
    </div>
  );
}
