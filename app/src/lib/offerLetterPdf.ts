/**
 * Offer Letter PDF / Image Generator
 *
 * Generates a premium, classical offer letter document directly in the browser
 * using HTML5 Canvas API with ZERO external network dependencies or CORS failure risks.
 *
 * Mirrors the certificate's design language: cream cotton-paper texture, champagne-gold
 * double frame, filigree corners, guilloché "O" + ZYR0 logo watermark, Cinzel/Montserrat
 * typography.
 *
 * The output is returned as a Blob (PNG/image format) for Supabase Storage or direct download.
 */

import type { OfferLetter } from '@/lib/database.types';
import QRCode from 'qrcode';
import { noiseSvg, mottleSvg, fiberSvg, filigreeSvg } from '@/components/certificateTemplate';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OfferLetterPdfData {
  offer: OfferLetter;
  verificationUrl: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_WIDTH = 800;   // A4 proportions @96 dpi
const PAGE_HEIGHT = 1131;
const MARGIN = 64;

// Classical premium palette (shared with certificate + email redesigns)
const PAPER_CREAM = '#f1ece0';
const PAPER_IVORY = '#fffdf5';
const PAPER_TAN = '#efe5ca';
const GOLD = '#b89c56';
const GOLD_DARK = '#a3874f';
const GOLD_SOFT = '#cbb880';
const NAVY = '#1e3a8a';
const INK = '#13100d';
const TEXT_MUTED = '#8a7f6c';
const TEXT_SOFT = '#5b544a';

const FONT_CINZEL = `'Cinzel', Georgia, 'Times New Roman', serif`;
const FONT_SANS = `'Montserrat', -apple-system, 'Segoe UI', Arial, sans-serif`;
const FONT_SCRIPT = `'Playfair Display', Georgia, serif`;

const FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700' +
  '&family=Montserrat:wght@300;400;500;600;700;800' +
  '&family=Playfair+Display:ital,wght@1,600&display=swap';

const FOOTER_H = 54;

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Render a premium offer letter on an off-screen Canvas and return it as a Blob.
 * Uses safe image pre-loading and fallback initial avatars to guarantee success.
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

  const bgGrad = ctx.createRadialGradient(400, 400, 80, 400, 460, 700);
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
  const glow = ctx.createRadialGradient(400, 470, 20, 400, 470, 380);
  glow.addColorStop(0, 'rgba(140,115,255,.13)');
  glow.addColorStop(0.45, 'rgba(140,115,255,.05)');
  glow.addColorStop(1, 'rgba(140,115,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 200, PAGE_WIDTH, 560);

  // ── Guilloché "O" watermark ───────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.lineCap = 'round';
  for (let r = 72; r <= 232; r += 20) {
    const purple = r % 40 === 0;
    ctx.strokeStyle = purple ? '#cdc2ea' : '#d6d2c6';
    ctx.lineWidth = r === 192 ? 3.2 : 1.7;
    ctx.setLineDash(r % 60 === 0 ? [14, 10] : [2.5, 5.5]);
    ctx.stroke(ringPath(400, 470, r, 5, 7, r * 0.23));
  }
  ctx.setLineDash([]);
  ctx.restore();

  // ── ZYR0 logo watermark ───────────────────────────────────────────────────
  if (zyroLogo) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    const s = 300;
    ctx.drawImage(zyroLogo, 400 - s / 2, 470 - s / 2, s, s);
    ctx.restore();
  }

  // ── Champagne-gold double frame + thin inner rule ─────────────────────────
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(9, 9, PAGE_WIDTH - 18, PAGE_HEIGHT - 18);
  ctx.lineWidth = 1;
  ctx.strokeRect(17, 17, PAGE_WIDTH - 34, PAGE_HEIGHT - 34);

  ctx.globalAlpha = 0.8;
  ctx.strokeRect(25, 25, PAGE_WIDTH - 50, PAGE_HEIGHT - 50);
  ctx.globalAlpha = 1;

  // ── Filigree corner ornaments ─────────────────────────────────────────────
  if (filigreeImg) {
    const fc = 104;
    const pad = 30;
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

  let y = 64;

  // ── Letterhead ────────────────────────────────────────────────────────────
  // Company logo (gold-framed) or initials avatar
  const logoSize = 64;
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
  const titleX = MARGIN + logoSize + 18;
  ctx.fillStyle = INK;
  ctx.font = `700 21px ${FONT_CINZEL}`;
  ctx.fillText(truncateString(company?.name ?? 'Company', 30), titleX, y + 26);

  ctx.fillStyle = NAVY;
  ctx.font = `700 11px ${FONT_SANS}`;
  ctx.fillText('OFFICIAL INTERNSHIP OFFER LETTER', titleX, y + 48);

  // Document metadata box (top right)
  const metaBoxW = 236;
  const metaBoxH = 68;
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
    ctx.font = `600 9px ${FONT_SANS}`;
    ctx.fillText(text.toUpperCase(), metaBoxX + 12, vy);
    ctx.fillStyle = NAVY;
    ctx.font = mono
      ? `700 10px ${FONT_CINZEL}`
      : `600 10px ${FONT_SANS}`;
    ctx.fillText(value, metaBoxX + vx, vy);
  };

  metaLabel('Offer Code', 82, y + 22, offer.offer_code || offer.id.slice(0, 12).toUpperCase(), true);
  metaLabel('Issued', 78, y + 40, issueDate);
  metaLabel('Expiration', 90, y + 56, expiryDate);

  y += 104;

  // Gold divider rule
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(PAGE_WIDTH - MARGIN, y);
  ctx.stroke();

  y += 34;

  // ── Salutation & Opening Paragraph ─────────────────────────────────────────
  ctx.fillStyle = NAVY;
  ctx.font = `700 15px ${FONT_CINZEL}`;
  ctx.fillText(`Dear ${student?.full_name ?? 'Candidate'},`, MARGIN, y);
  y += 28;

  const openingText =
    `On behalf of ${company?.name ?? 'our company'}, we are delighted to extend an official offer of ` +
    `internship for the position of ${internship?.title ?? 'Intern'}. Having reviewed your qualifications, ` +
    `academic background, and prior experience, we believe your talent and commitment will be a valuable ` +
    `addition to our organization. Please find the terms of engagement and offer details below:`;

  // Advance by the paragraph's *measured* height so the card below never overlaps it.
  y = wrapText(ctx, openingText, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 20, INK, `400 13px ${FONT_SANS}`, 1.45) + 20;

  // ── Position & Engagement Details Card ─────────────────────────────────────
  const cardW = PAGE_WIDTH - MARGIN * 2;
  const cardH = 216;

  ctx.fillStyle = 'rgba(255,253,245,.7)';
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
  ctx.font = `700 11px ${FONT_SANS}`;
  ctx.fillText('POSITION & ENGAGEMENT DETAILS', MARGIN + 40, y + 26);

  const workArrangement = internship?.location && internship.location !== internship.location_type
    ? `${internship?.location_type ?? 'Remote'} (${internship.location})`
    : (internship?.location_type || 'Remote');

  let fieldsY = y + 56;
  const fields: Array<[string, string]> = [
    ['Candidate Name', student?.full_name ?? '—'],
    ['Position Title', internship?.title ?? '—'],
    ['Internship Category', internship?.type ?? 'Internship'],
    ['Work Arrangement', workArrangement],
    ['Duration', internship?.duration ?? 'Flexible'],
    ['Proposed Start', internship?.start_date ? new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'To be agreed'],
    ['Stipend / Compensation', internship?.stipend ? `${internship.stipend} (${internship.stipend_type ?? 'Monthly'})` : 'Experience-Based'],
    ['Reporting Signatory', company?.owner?.full_name ?? 'Company Representative'],
  ];

  const col1X = MARGIN + 24;
  const col2X = MARGIN + (cardW / 2) + 18;

  fields.forEach(([label, value], idx) => {
    const isCol2 = idx % 2 === 1;
    const curX = isCol2 ? col2X : col1X;
    if (idx > 0 && !isCol2) fieldsY += 38;

    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `600 9.5px ${FONT_SANS}`;
    ctx.fillText(label.toUpperCase(), curX, fieldsY);

    ctx.fillStyle = INK;
    ctx.font = `700 12px ${FONT_SANS}`;
    ctx.fillText(truncateString(value, 36), curX, fieldsY + 17);
  });

  y += cardH + 30;

  // ── Responsibilities & Terms: content sizing ────────────────────────────────
  // Everything below flows with *measured* heights. A budget loop runs first:
  // if the natural content would collide with the signature zone, trailing
  // responsibilities (least essential) are dropped, then trailing terms,
  // until it fits — the card, signature, and footer are never overlapped.
  const contentW = PAGE_WIDTH - MARGIN * 2;

  const RESP_FONT = `400 11.5px ${FONT_SANS}`;
  const RESP_LH = 17;
  const RESP_SP = 1.35;

  const TERM_FONT = `400 11px ${FONT_SANS}`;
  const TERM_LH = 16;
  const TERM_SP = 1.4;

  let respList = internship?.responsibilities?.length
    ? internship.responsibilities.slice()
    : [];

  let termList = [
    'This offer is contingent upon verification of candidate credentials and completion of required onboarding paperwork.',
    'You are expected to maintain professional standards, confidentiality, and data safety during the internship.',
    `This offer remains valid until ${offer.expires_at ? new Date(offer.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '30 days from issuance'}, after which it may expire automatically unless extended.`,
  ];

  const respLines = (r: string) => measureWrapped(ctx, r, contentW - 22, RESP_FONT, RESP_LH, RESP_SP);
  const termLines = (t: string) => measureWrapped(ctx, t, contentW - 22, TERM_FONT, TERM_LH, TERM_SP);
  const sectionSpace = () => {
    const respH = respList.length
      ? 22 + respList.reduce((h, r) => h + respLines(r) * RESP_LH * RESP_SP, 0) + 14
      : 0;
    const termsH = termList.reduce((h, t) => h + termLines(t) * TERM_LH * TERM_SP, 0);
    return respH + 22 + termsH + 26;
  };

  // Safe zone: signature rule sits between ideal (917) and just above the footer.
  const idealSigY = PAGE_HEIGHT - 214;
  const maxSigY = PAGE_HEIGHT - FOOTER_H - 106;

  for (let guard = 0; guard < 20; guard++) {
    if (y + sectionSpace() <= maxSigY - 6) break;
    if (respList.length) respList.pop();
    else if (termList.length > 2) termList.pop();
    else break;
  }

  // ── Responsibilities Section ───────────────────────────────────────────────
  if (respList.length) {
    ctx.fillStyle = NAVY;
    ctx.font = `700 13px ${FONT_SANS}`;
    ctx.fillText('KEY RESPONSIBILITIES', MARGIN, y);
    y += 22;

    for (const resp of respList) {
      ctx.fillStyle = GOLD;
      ctx.font = `700 13px ${FONT_CINZEL}`;
      ctx.fillText('•', MARGIN + 4, y);

      y = wrapText(ctx, resp, MARGIN + 22, y, contentW - 22, RESP_LH, TEXT_SOFT, RESP_FONT, RESP_SP);
    }
    y += 14;
  }

  // ── Terms & Conditions ─────────────────────────────────────────────────────
  ctx.fillStyle = NAVY;
  ctx.font = `700 13px ${FONT_SANS}`;
  ctx.fillText('TERMS & CONDITIONS', MARGIN, y);
  y += 22;

  termList.forEach((term, index) => {
    ctx.fillStyle = GOLD;
    ctx.font = `700 12px ${FONT_CINZEL}`;
    ctx.fillText(`${index + 1}`, MARGIN, y);

    y = wrapText(ctx, term, MARGIN + 22, y, contentW - 22, TERM_LH, TEXT_SOFT, TERM_FONT, TERM_SP);
  });

  y += 26;

  // ── Signatory Line & Verification Section ───────────────────────────────────
  // Floats between the ideal position and just above the footer so the
  // signature block can never collide with content or the navy footer.
  const sigY = Math.max(idealSigY, Math.min(y + 4, maxSigY));

  // Signature rule + details
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN, sigY);
  ctx.lineTo(MARGIN + 230, sigY);
  ctx.stroke();

  const signatoryName = company?.owner?.full_name || 'Authorized Signatory';
  const signatoryTitle = company?.owner?.title || 'Company Representative';
  const signatoryEmail = company?.owner?.email;

  ctx.fillStyle = NAVY;
  ctx.font = `italic 600 19px ${FONT_SCRIPT}`;
  ctx.fillText(truncateString(signatoryName, 26), MARGIN, sigY + 4);

  ctx.fillStyle = TEXT_SOFT;
  ctx.font = `400 11px ${FONT_SANS}`;
  ctx.fillText(signatoryTitle, MARGIN, sigY + 32);
  ctx.fillText(company?.name ?? 'Company Name', MARGIN, sigY + 48);
  if (signatoryEmail) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `400 10px ${FONT_SANS}`;
    ctx.fillText(signatoryEmail, MARGIN, sigY + 64);
  }

  // Verification QR box (gold-framed, right side)
  const qrBoxW = 224;
  const qrBoxH = 96;
  const qrBoxX = PAGE_WIDTH - MARGIN - qrBoxW;
  const qrBoxY = sigY - 6;

  ctx.fillStyle = 'rgba(255,253,245,.75)';
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 10);
  ctx.fill();
  ctx.stroke();

  renderSafeCanvasQr(ctx, verificationUrl, qrBoxX + 14, qrBoxY + 12, 76);

  ctx.fillStyle = NAVY;
  ctx.font = `700 11px ${FONT_SANS}`;
  ctx.fillText('VERIFIED OFFER', qrBoxX + 100, qrBoxY + 30);

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `400 9.5px ${FONT_SANS}`;
  ctx.fillText('Scan to authenticate', qrBoxX + 100, qrBoxY + 48);
  ctx.fillText('via ZYR0 Platform', qrBoxX + 100, qrBoxY + 62);

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
  ctx.font = `400 9.5px ${FONT_SANS}`;
  ctx.fillText(footerOfferLabel, PAGE_WIDTH / 2, footerY + 22);

  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.font = `400 9px ${FONT_SANS}`;
  ctx.fillText(`Verify at ${verificationUrl}`, PAGE_WIDTH / 2, footerY + 38);

  ctx.fillStyle = 'rgba(255,255,255,.65)';
  ctx.font = `400 8.5px ${FONT_SANS}`;
  ctx.fillText(
    `© ${new Date().getFullYear()} ZYR0 Platform · ${truncateString(company?.name ?? '', 60)} · Confidential Document`,
    PAGE_WIDTH / 2,
    footerY + 52
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

  // ── Export to PNG Blob ────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob returned null'));
    }, 'image/png');
  });
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
      link.href = FONTS_CSS_URL;
      document.head.appendChild(link);
    }
    if (document.fonts) {
      const faces = [
        '700 22px "Cinzel"',
        '700 15px "Cinzel"',
        '600 12px "Montserrat"',
        '700 12px "Montserrat"',
        '400 13px "Montserrat"',
        'italic 600 19px "Playfair Display"',
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

/** Load image with crossOrigin fallback without throwing exception on failure. */
function safeLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = src;
    };
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
  const quiet = 3; // QR spec quiet zone (modules of padding)

  // Cell size fits the module grid + quiet zone into the requested box
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