/**
 * Offer Letter PDF Generator
 *
 * Generates a premium, classical offer letter document directly in the browser
 * using HTML5 Canvas API with ZERO external network dependencies or CORS failure risks.
 *
 * Mirrors the certificate's design language: cream cotton-paper texture, champagne-gold
 * double frame, filigree corners, guilloché "O" + ZYR0 logo watermark, Cinzel/Montserrat
 * typography.
 *
 * The output is returned as a single-page A4 PDF Blob (rasterized canvas embedded
 * at 192 DPI for crisp print) for Supabase Storage, email attachment, or direct download.
 */

import { jsPDF } from 'jspdf';
import type { OfferLetter } from '@/lib/database.types';
import QRCode from 'qrcode';
import { noiseSvg, mottleSvg, fiberSvg, filigreeSvg } from '@/components/certificateTemplate';
import {
  OFFER_LETTER_COLORS,
  FONT_CINZEL,
  FONT_SANS,
  FONT_SCRIPT,
  OFFER_LETTER_FONTS_CSS_URL,
  CANVAS_PAGE_WIDTH,
  CANVAS_PAGE_HEIGHT,
  CANVAS_MARGIN,
  buildOfferDetails,
} from '@/lib/offerLetterConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OfferLetterPdfData {
  offer: OfferLetter;
  verificationUrl: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_WIDTH = CANVAS_PAGE_WIDTH;  // A4 proportions @192 dpi (1600 x 2262)
const PAGE_HEIGHT = CANVAS_PAGE_HEIGHT;
const MARGIN = CANVAS_MARGIN;

const {
  PAPER_CREAM,
  PAPER_IVORY,
  PAPER_TAN,
  GOLD,
  NAVY,
  INK,
  TEXT_MUTED,
  TEXT_SOFT,
} = OFFER_LETTER_COLORS;

const FOOTER_H = 54;

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Render a premium offer letter on an off-screen Canvas and return it as a
 * single-page A4 PDF Blob. Uses safe image pre-loading and fallback initial
 * avatars to guarantee success.
 */
export async function generateOfferLetterPdf(data: OfferLetterPdfData): Promise<Blob> {
  const { offer, verificationUrl } = data;

  const internship = offer.internship;
  const student    = offer.student;
  const company    = offer.company;

  // Preload premium fonts + texture assets (never blocks: graceful fallbacks).
  const [paperTex, filigreeImg, zyroLogo] = await Promise.all([
    Promise.all([
      svgToImage(noiseSvg()),
      svgToImage(mottleSvg()),
      svgToImage(fiberSvg()),
    ]),
    svgToImage(filigreeSvg()),
    safeLoadImage(`${window.location.origin}/zyro-logo.png`),
    ensurePremiumFonts(),
  ]);

  // ── Create off-screen canvas ──────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Cotton-paper background ───────────────────────────────────────────────
  ctx.fillStyle = PAPER_CREAM;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  const bgGrad = ctx.createRadialGradient(800, 800, 160, 800, 920, 1400);
  bgGrad.addColorStop(0, PAPER_IVORY);
  bgGrad.addColorStop(0.68, '#f7f0dd');
  bgGrad.addColorStop(1, PAPER_TAN);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Paper grain layers (noise / mottle / fibers)
  drawTiled(ctx, paperTex[0], 0.5);
  drawTiled(ctx, paperTex[1], 0.5);
  drawTiled(ctx, paperTex[2], 0.4);

  // ── Soft purple glow behind the watermark ─────────────────────────────────
  const glow = ctx.createRadialGradient(800, 940, 40, 800, 940, 760);
  glow.addColorStop(0, 'rgba(140,115,255,.13)');
  glow.addColorStop(0.45, 'rgba(140,115,255,.05)');
  glow.addColorStop(1, 'rgba(140,115,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 400, PAGE_WIDTH, 1120);

  // ── Guilloché "O" watermark ───────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.lineCap = 'round';
  for (let r = 144; r <= 464; r += 40) {
    const purple = r % 80 === 0;
    ctx.strokeStyle = purple ? '#cdc2ea' : '#d6d2c6';
    ctx.lineWidth = r === 384 ? 3.2 : 1.7;
    ctx.setLineDash(r % 120 === 0 ? [14, 10] : [2.5, 5.5]);
    ctx.stroke(ringPath(800, 940, r, 5, 7, r * 0.23));
  }
  ctx.setLineDash([]);
  ctx.restore();

  // ── ZYR0 logo watermark ───────────────────────────────────────────────────
  if (zyroLogo) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    const s = 330;
    ctx.drawImage(zyroLogo, 800 - s / 2, 940 - s / 2, s, s);
    ctx.restore();
  }

  // ── Champagne-gold double frame + thin inner rule ─────────────────────────
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, PAGE_WIDTH - 36, PAGE_HEIGHT - 36);
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68);

  ctx.globalAlpha = 0.8;
  ctx.strokeRect(50, 50, PAGE_WIDTH - 100, PAGE_HEIGHT - 100);
  ctx.globalAlpha = 1;

  // ── Filigree corner ornaments ─────────────────────────────────────────────
  if (filigreeImg) {
    const fc = 118;
    const pad = 34;
    const corners: Array<[number, number, number, number]> = [
      [pad, pad, 1, 1],
      [PAGE_WIDTH - pad - fc, pad, -1, 1],
      [pad, PAGE_HEIGHT - pad - fc, 1, -1],
      [PAGE_WIDTH - pad - fc, PAGE_HEIGHT - pad - fc, -1, -1],
    ];
    for (const [x, y, sx, sy] of corners) {
      ctx.save();
      ctx.translate(sx === -1 ? x + fc : x, sy === -1 ? y + fc : y);
      ctx.scale(sx, sy);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(filigreeImg, 0, 0, fc, fc);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  let y = 80;

  // ── Letterhead ────────────────────────────────────────────────────────────
  // Company logo (gold-framed) or initials avatar
  const logoSize = 68;
  let logoLoaded = false;
  if (company?.logo_url) {
    try {
      const logoImg = await safeLoadImage(company.logo_url);
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, MARGIN, y, logoSize, logoSize, 12);
        ctx.clip();
        ctx.drawImage(logoImg, MARGIN, y, logoSize, logoSize);
        ctx.restore();

        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        roundRect(ctx, MARGIN, y, logoSize, logoSize, 12);
        ctx.stroke();
        logoLoaded = true;
      }
    } catch {
      logoLoaded = false;
    }
  }

  if (!logoLoaded) {
    renderInitialsAvatar(ctx, company?.name ?? 'CO', MARGIN, y, logoSize, NAVY, PAPER_IVORY);
  }

  // Company name + letter subtitle
  const titleX = MARGIN + logoSize + 20;
  ctx.fillStyle = INK;
  ctx.font = `700 24px ${FONT_CINZEL}`;
  ctx.fillText(truncateString(company?.name ?? 'Company', 32), titleX, y + 30);

  ctx.fillStyle = NAVY;
  ctx.font = `700 12px ${FONT_SANS}`;
  ctx.fillText('GENERAL OFFICE OF THE BOARD  ·  OFFICIAL INTERNSHIP OFFER LETTER', titleX, y + 54);

  // Document metadata box (top right)
  const metaBoxW = 260;
  const metaBoxH = 74;
  const metaBoxX = PAGE_WIDTH - MARGIN - metaBoxW;

  ctx.fillStyle = 'rgba(255,253,245,.72)';
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, metaBoxX, y, metaBoxW, metaBoxH, 10);
  ctx.fill();
  ctx.stroke();

  const issueDate = offer.issued_at
    ? new Date(offer.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const expiryDate = offer.expires_at
    ? new Date(offer.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '30 Days';

  const metaLabel = (text: string, vx: number, vy: number, value: string, mono = false) => {
    ctx.fillStyle = '#a99a78';
    ctx.font = `600 10px ${FONT_SANS}`;
    ctx.fillText(text.toUpperCase(), metaBoxX + 14, vy);
    ctx.fillStyle = NAVY;
    ctx.font = mono
      ? `700 11px ${FONT_CINZEL}`
      : `600 11px ${FONT_SANS}`;
    ctx.fillText(value, metaBoxX + vx, vy);
  };

  metaLabel('Offer Code', 94, y + 24, offer.offer_code || offer.id.slice(0, 12).toUpperCase(), true);
  metaLabel('Issued', 90, y + 44, issueDate);
  metaLabel('Expires', 98, y + 62, expiryDate);

  y += 114;

  // Gold divider rule
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(PAGE_WIDTH - MARGIN, y);
  ctx.stroke();

  y += 40;

  // ── Salutation & Opening Paragraph ─────────────────────────────────────────
  const studentName = student?.full_name ?? 'Candidate';
  const companyName = company?.name ?? 'our company';
  const position    = internship?.title ?? 'Intern';

  ctx.fillStyle = NAVY;
  ctx.font = `700 17px ${FONT_CINZEL}`;
  ctx.fillText(`Dear ${studentName},`, MARGIN, y);
  y += 32;

  const openingText =
    `On behalf of ${companyName}, we are delighted to extend an official offer of ` +
    `internship for the position of ${position}. Having reviewed your qualifications, ` +
    `academic background, and prior experience, we believe your talent and commitment will be a valuable ` +
    `addition to our organization. Please find the terms of engagement and offer details below:`;

  y = wrapText(ctx, openingText, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 22, INK, `400 14px ${FONT_SANS}`, 1.45) + 24;

  // ── Position & Engagement Details Card ─────────────────────────────────────
  const cardW = PAGE_WIDTH - MARGIN * 2;
  const cardH = 224;

  ctx.fillStyle = 'rgba(255,253,245,.75)';
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, MARGIN, y, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();

  // Card header with gold accent rule
  ctx.fillStyle = GOLD;
  ctx.fillRect(MARGIN + 20, y + 18, 14, 2);
  ctx.fillStyle = NAVY;
  ctx.font = `700 12px ${FONT_SANS}`;
  ctx.fillText('POSITION & ENGAGEMENT DETAILS', MARGIN + 42, y + 26);

  const workArrangement = internship?.location && internship.location !== internship.location_type
    ? `${internship?.location_type ?? 'Remote'} (${internship.location})`
    : (internship?.location_type || 'Remote');

  const signatoryName  = company?.owner?.full_name || 'Authorized Signatory';
  const signatoryTitle = company?.owner?.title || 'Company Representative';
  const signatoryInfo  = `${signatoryName} · ${signatoryTitle}`;

  const startDate = internship?.start_date
    ? new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be agreed upon';

  const compensation = internship?.stipend
    ? `${internship.stipend} (${internship.stipend_type ?? 'Monthly'})`
    : 'Unpaid / Experience-Based';

  const rawFields = buildOfferDetails({
    studentName,
    position,
    internshipType: internship?.type ?? 'Internship',
    workArrangement,
    duration: internship?.duration ?? 'Flexible',
    startDate,
    compensation,
    signatoryInfo,
  });

  const col1X = MARGIN + 24;
  const col2X = MARGIN + (cardW / 2) + 20;
  let fieldsY = y + 58;

  rawFields.forEach((field, idx) => {
    const isCol2 = idx % 2 === 1;
    const curX = isCol2 ? col2X : col1X;
    if (idx > 0 && !isCol2) fieldsY += 40;

    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `600 10px ${FONT_SANS}`;
    ctx.fillText(field.label.toUpperCase(), curX, fieldsY);

    ctx.fillStyle = INK;
    ctx.font = `700 13px ${FONT_SANS}`;
    ctx.fillText(truncateString(field.value, 40), curX, fieldsY + 18);
  });

  y += cardH + 34;

  // ── Responsibilities & Terms: content sizing ────────────────────────────────
  const contentW = PAGE_WIDTH - MARGIN * 2;

  const RESP_FONT = `400 12.5px ${FONT_SANS}`;
  const RESP_LH = 18;
  const RESP_SP = 1.35;

  const TERM_FONT = `400 12px ${FONT_SANS}`;
  const TERM_LH = 17;
  const TERM_SP = 1.4;

  let respList = internship?.responsibilities?.length
    ? internship.responsibilities.slice(0, 5)
    : [];

  let termList = [
    'This offer is contingent upon verification of candidate credentials and completion of required onboarding paperwork.',
    'You are expected to maintain professional standards, confidentiality, and data safety during the internship.',
    `This offer remains valid until ${offer.expires_at ? new Date(offer.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '30 days from issuance'}, after which it may expire automatically unless extended.`,
  ];

  const respLines = (r: string) => measureWrapped(ctx, r, contentW - 24, RESP_FONT, RESP_LH, RESP_SP);
  const termLines = (t: string) => measureWrapped(ctx, t, contentW - 24, TERM_FONT, TERM_LH, TERM_SP);
  const sectionSpace = () => {
    const respH = respList.length
      ? 24 + respList.reduce((h, r) => h + respLines(r) * RESP_LH * RESP_SP, 0) + 16
      : 0;
    const termsH = termList.reduce((h, t) => h + termLines(t) * TERM_LH * TERM_SP, 0);
    return respH + 24 + termsH + 30;
  };

  const idealSigY = PAGE_HEIGHT - 230;
  const maxSigY   = PAGE_HEIGHT - FOOTER_H - 110;

  for (let guard = 0; guard < 20; guard++) {
    if (y + sectionSpace() <= maxSigY - 6) break;
    if (respList.length) respList.pop();
    else if (termList.length > 2) termList.pop();
    else break;
  }

  // ── Responsibilities Section ───────────────────────────────────────────────
  if (respList.length) {
    ctx.fillStyle = NAVY;
    ctx.font = `700 14px ${FONT_SANS}`;
    ctx.fillText('KEY RESPONSIBILITIES', MARGIN, y);
    y += 24;

    for (const resp of respList) {
      ctx.fillStyle = GOLD;
      ctx.font = `700 14px ${FONT_CINZEL}`;
      ctx.fillText('•', MARGIN + 4, y);

      y = wrapText(ctx, resp, MARGIN + 24, y, contentW - 24, RESP_LH, TEXT_SOFT, RESP_FONT, RESP_SP);
    }
    y += 16;
  }

  // ── Terms & Conditions ─────────────────────────────────────────────────────
  ctx.fillStyle = NAVY;
  ctx.font = `700 14px ${FONT_SANS}`;
  ctx.fillText('TERMS & CONDITIONS', MARGIN, y);
  y += 24;

  termList.forEach((term, index) => {
    ctx.fillStyle = GOLD;
    ctx.font = `700 13px ${FONT_CINZEL}`;
    ctx.fillText(`${index + 1}.`, MARGIN, y);

    y = wrapText(ctx, term, MARGIN + 24, y, contentW - 24, TERM_LH, TEXT_SOFT, TERM_FONT, TERM_SP);
  });

  y += 28;

  // ── Signatory Line & Verification Section ───────────────────────────────────
  const sigY = Math.max(idealSigY, Math.min(y + 4, maxSigY));

  // Signature rule + details
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN, sigY);
  ctx.lineTo(MARGIN + 240, sigY);
  ctx.stroke();

  const signatoryEmail = company?.owner?.email;

  ctx.fillStyle = NAVY;
  ctx.font = `italic 600 20px ${FONT_SCRIPT}`;
  ctx.fillText(truncateString(signatoryName, 28), MARGIN, sigY + 24);

  ctx.fillStyle = TEXT_SOFT;
  ctx.font = `400 11.5px ${FONT_SANS}`;
  ctx.fillText(signatoryTitle, MARGIN, sigY + 44);
  ctx.fillText(company?.name ?? 'Company Name', MARGIN, sigY + 60);
  if (signatoryEmail) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `400 10.5px ${FONT_SANS}`;
    ctx.fillText(signatoryEmail, MARGIN, sigY + 76);
  }

  // Verification QR box (gold-framed, right side)
  const qrBoxW = 240;
  const qrBoxH = 104;
  const qrBoxX = PAGE_WIDTH - MARGIN - qrBoxW;
  const qrBoxY = sigY - 6;

  ctx.fillStyle = 'rgba(255,253,245,.8)';
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 10);
  ctx.fill();
  ctx.stroke();

  renderSafeCanvasQr(ctx, verificationUrl, qrBoxX + 14, qrBoxY + 12, 80);

  ctx.fillStyle = NAVY;
  ctx.font = `700 11.5px ${FONT_SANS}`;
  ctx.fillText('VERIFIED OFFER', qrBoxX + 106, qrBoxY + 32);

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `400 10px ${FONT_SANS}`;
  ctx.fillText('Scan to authenticate', qrBoxX + 106, qrBoxY + 52);
  ctx.fillText('via ZYR0 Platform', qrBoxX + 106, qrBoxY + 66);

  // ── Bottom navy security footer with gold rule ─────────────────────────────
  const footerY = PAGE_HEIGHT - FOOTER_H;

  ctx.fillStyle = GOLD;
  ctx.fillRect(0, footerY, PAGE_WIDTH, 2);

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, footerY + 2, PAGE_WIDTH, FOOTER_H - 2);

  ctx.textAlign = 'center';

  const footerOfferLabel = offer.offer_code
    ? `Offer Code: ${offer.offer_code}   ·   Offer ID: ${offer.id.slice(0, 8)}`
    : `Offer ID: ${offer.id.slice(0, 8)}`;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `400 10px ${FONT_SANS}`;
  ctx.fillText(footerOfferLabel, PAGE_WIDTH / 2, footerY + 22);

  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.font = `400 9.5px ${FONT_SANS}`;
  ctx.fillText(`Verify at ${verificationUrl}`, PAGE_WIDTH / 2, footerY + 37);

  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.font = `400 9px ${FONT_SANS}`;
  ctx.fillText(
    `© ${new Date().getFullYear()} ZYR0 Platform · ${truncateString(company?.name ?? '', 60)} · Confidential Document`,
    PAGE_WIDTH / 2,
    footerY + 50
  );
  ctx.textAlign = 'left';

  // ── Status Watermark Stamp ─────────────────────────────────────────────────
  if (['Accepted', 'Rejected', 'Revoked'].includes(offer.status)) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
    ctx.rotate(-Math.PI / 6);

    ctx.fillStyle = offer.status === 'Accepted' ? '#10B981' : offer.status === 'Rejected' ? '#EF4444' : '#64748B';
    ctx.font = `700 104px ${FONT_CINZEL}`;
    ctx.textAlign = 'center';
    ctx.fillText(offer.status.toUpperCase(), 0, 0);
    ctx.restore();
  }

  // ── Export to single-page A4 PDF ──────────────────────────────────────────
  const imgData = canvas.toDataURL('image/png');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  return doc.output('blob');
}

// ── Private Helpers ───────────────────────────────────────────────────────────

/** Preload premium web fonts (Cinzel / Montserrat / Playfair) with a bounded wait. */
async function ensurePremiumFonts(): Promise<void> {
  try {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('zyro-premium-fonts')) {
      const link = document.createElement('link');
      link.id = 'zyro-premium-fonts';
      link.rel = 'stylesheet';
      link.href = OFFER_LETTER_FONTS_CSS_URL;
      document.head.appendChild(link);
    }
    if (document.fonts) {
      const faces = [
        '700 24px "Cinzel"',
        '700 17px "Cinzel"',
        '600 13px "Montserrat"',
        '700 13px "Montserrat"',
        '400 14px "Montserrat"',
        'italic 600 20px "Playfair Display"',
      ];
      await Promise.race([
        Promise.allSettled(faces.map((f) => document.fonts.load(f))),
        new Promise((res) => setTimeout(res, 2500)),
      ]);
    }
  } catch {
    // Fonts are optional — renderers fall back to Georgia / Arial.
  }
}

/** Convert an SVG string to an Image (data-URI, fully offline). */
function svgToImage(svg: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
}

/** Tile a texture image across the page at the given global alpha. */
function drawTiled(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, alpha: number) {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const tile = 320;
  for (let ty = 0; ty < PAGE_HEIGHT; ty += tile) {
    for (let tx = 0; tx < PAGE_WIDTH; tx += tile) {
      ctx.drawImage(img, tx, ty, tile, tile);
    }
  }
  ctx.restore();
}

/** Build a wavy concentric guilloché ring as a Path2D. */
function ringPath(cx: number, cy: number, r: number, wobbles: number, amplitude: number, phase: number): Path2D {
  const N = 140;
  const path = new Path2D();
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 * Math.PI;
    const rr = r + amplitude * Math.sin(wobbles * t + phase);
    const x = cx + rr * Math.cos(t);
    const y = cy + rr * Math.sin(t);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  return path;
}

/**
 * Load image with CORS check.
 * Crucial safety fix: Never falls back to non-CORS loading because drawing a cross-origin
 * non-CORS image onto canvas taints it, breaking canvas.toDataURL() with a SecurityError.
 */
function safeLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Resolve null on failure so avatar fallback is used cleanly
    img.src = src;
  });
}

/** Render stylized company initials avatar on canvas. */
function renderInitialsAvatar(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number, y: number, size: number,
  bg: string, fg: string
) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();

  ctx.fillStyle = fg;
  ctx.font = `700 ${size * 0.36}px ${FONT_CINZEL}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    (name || '?').slice(0, 2).toUpperCase(),
    x + size / 2,
    y + size / 2
  );
  ctx.restore();
}

/** Wrap multiline text nicely within maxWidth. Returns the y just below the last line. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number,
  color: string,
  font: string,
  lineSpacing = 1
): number {
  ctx.fillStyle = color;
  ctx.font = font;
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      curY += lineHeight * lineSpacing;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY + lineHeight * lineSpacing;
}

/** Count how many lines wrapped text will occupy, without drawing. */
function measureWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
  lineHeight: number,
  lineSpacing = 1
): number {
  if (!text) return 0;
  ctx.font = font;
  const words = text.split(' ');
  let line = '';
  let lines = 1;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines++;
      line = word;
    } else {
      line = testLine;
    }
  }
  return lines;
}

/** Truncate text string if too long. */
function truncateString(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
}

/** Helper to draw rounded rectangle paths. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Render a real, scannable QR Code directly onto Canvas context.
 * Uses the pure-JS `qrcode` encoder, so it stays 100% offline —
 * zero network calls & zero CORS errors, while remaining machine-readable.
 */
function renderSafeCanvasQr(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  size: number
) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const count = qr.modules.size;
  const quiet = 3;

  const cellSize = size / (count + quiet * 2);

  ctx.save();

  // White background (required for reliable scanning)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, size, size);

  // Draw data modules
  ctx.fillStyle = INK;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.modules.get(r, c)) {
        ctx.fillRect(
          Math.floor(x + (c + quiet) * cellSize),
          Math.floor(y + (r + quiet) * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }

  ctx.restore();
}