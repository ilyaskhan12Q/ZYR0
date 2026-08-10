/**
 * Offer Letter PDF — Identical DOM Renderer
 *
 * Renders the REAL `<OfferLetterDocument>` component (the exact same node shown
 * on `/verify`, student & company dashboards) off-screen and captures it to an
 * A4 PDF via html2canvas. Because the PDF is produced from the same component
 * the user sees on the verification portal, the design is identical by
 * construction and can never drift from the finalized design.
 *
 * Fallback: `generateOfferLetterPdf()` in `offerLetterPdf.ts` remains the
 * legacy canvas renderer used when this capture fails at runtime.
 */

import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import OfferLetterDocument from '@/components/OfferLetterDocument';
import type { OfferLetter } from '@/lib/database.types';
import { OFFER_LETTER_COLORS, FONT_CINZEL, OFFER_LETTER_FONTS_CSS_URL } from '@/lib/offerLetterConfig';

const { NAVY } = OFFER_LETTER_COLORS;

const A4_W_MM = 210;
const A4_H_MM = 297;
const SHEET_WIDTH_PX = 794; // 210mm @ 96dpi
const SETTLE_MS = 250; // allow fonts + layout to settle before capture

/**
 * Render the verified offer letter design (same component as /verify) to an
 * A4 PDF Blob. Throws if the capture fails — callers should fall back to the
 * legacy canvas renderer or skip the email attachment.
 */
export async function generateIdenticalOfferLetterPdf(offer: OfferLetter): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = `${SHEET_WIDTH_PX}px`;
  container.style.background = '#ffffff';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<OfferLetterDocument offer={offer} showActions={false} />);

  try {
    // Ensure premium fonts are injected, then wait for them to fully load.
    await ensureCaptureFonts();
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

    const sheet = container.querySelector<HTMLElement>(`#offer-letter-sheet-${offer.id}`);
    if (!sheet) throw new Error('Offer letter sheet element not found for PDF capture');

    // html2canvas can't rasterize inline SVG or cross-origin images; replace
    // them inside the captured node with local data-URIs (visual output keeps
    // the exact same design, fonts and colors).
    await hydrateCaptureNode(sheet, offer);

    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      allowTaint: false,
      windowWidth: SHEET_WIDTH_PX,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    // Fit the sheet into the A4 page without cropping (scale to fit, centered).
    const ratio = canvas.height / canvas.width;
    let w = A4_W_MM;
    let h = A4_W_MM * ratio;
    if (h > A4_H_MM) {
      h = A4_H_MM;
      w = A4_H_MM / ratio;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    doc.addImage(imgData, 'JPEG', (A4_W_MM - w) / 2, (A4_H_MM - h) / 2, w, h, undefined, 'FAST');
    return doc.output('blob');
  } finally {
    root.unmount();
    container.remove();
  }
}

// ── Capture pre-processing ────────────────────────────────────────────────────

/** Inject the premium font stylesheet (idempotent) and await font readiness. */
async function ensureCaptureFonts(): Promise<void> {
  try {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('zyro-premium-fonts')) {
      const link = document.createElement('link');
      link.id = 'zyro-premium-fonts';
      link.rel = 'stylesheet';
      link.href = OFFER_LETTER_FONTS_CSS_URL;
      document.head.appendChild(link);
    }
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
  } catch {
    // Fonts are optional — fallbacks are Georgia / Arial.
  }
}

/**
 * Make every node inside the sheet html2canvas-safe:
 *  - inline <svg> elements (filigree, guilloché, lucide icons) → PNG data-URIs
 *  - external QR image → locally generated QR data-URI
 *  - cross-origin company logo → fetched data-URI (or initials avatar fallback)
 */
async function hydrateCaptureNode(sheet: HTMLElement, offer: OfferLetter): Promise<void> {
  const svgs = Array.from(sheet.querySelectorAll('svg'));
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    // Preserve computed stroke color (currentColor → concrete color) so
    // serialized icons keep their gold/navy tint instead of rendering black.
    const color = getComputedStyle(svg).color;
    const serialized = new XMLSerializer()
      .serializeToString(svg)
      .split('currentColor')
      .join(color);

    const raster = await svgToRaster(
      serialized,
      Math.max(1, Math.ceil(rect.width * 2)),
      Math.max(1, Math.ceil(rect.height * 2))
    );
    if (!raster) continue;

    const img = document.createElement('img');
    img.src = raster;
    img.alt = '';
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    img.style.display = 'block';
    svg.replaceWith(img);
  }

  const imgs = Array.from(sheet.querySelectorAll('img'));
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';

    if (src.includes('api.qrserver.com')) {
      const dataParam = new URL(src, window.location.origin).searchParams.get('data') || '';
      try {
        img.src = await QRCode.toDataURL(dataParam, { width: 140, margin: 1, errorCorrectionLevel: 'M' });
      } catch {
        // keep original QR — html2canvas may still load it via CORS
      }
    } else if (/^https?:\/\//.test(src) && !src.startsWith(window.location.origin)) {
      const dataUrl = await fetchAsDataUri(src);
      if (dataUrl) {
        img.src = dataUrl;
      } else {
        // Mirror the component's onError fallback: initials avatar
        const avatar = document.createElement('div');
        avatar.style.background = NAVY;
        avatar.style.color = '#f6efdf';
        avatar.style.fontWeight = '700';
        avatar.style.fontSize = '20px';
        avatar.style.fontFamily = FONT_CINZEL;
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
        avatar.style.width = `${img.getBoundingClientRect().width}px`;
        avatar.style.height = `${img.getBoundingClientRect().height}px`;
        avatar.textContent = (offer.company?.name || 'CO').substring(0, 2).toUpperCase();
        img.replaceWith(avatar);
      }
    }
  }
}

/** Serialize an SVG string to a rasterized PNG data-URI (or null on failure). */
function svgToRaster(svg: string, width: number, height: number): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
}

/** Fetch a cross-origin resource and return it as a data-URI (null on failure). */
async function fetchAsDataUri(src: string): Promise<string | null> {
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
