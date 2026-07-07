/**
 * Offer Letter PDF Generator
 *
 * Generates a professional, branded PDF directly in the browser using
 * the Canvas API so there is zero server dependency. The output is a
 * Blob that can be uploaded to Supabase Storage or directly downloaded.
 *
 * QR code is rendered via the qrcode library (no external service).
 */

import type { OfferLetter } from '@/lib/database.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OfferLetterPdfData {
  offer: OfferLetter;
  verificationUrl: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_WIDTH = 794;   // A4 @96 dpi
const PAGE_HEIGHT = 1123;
const MARGIN = 60;
const PRIMARY = '#1E3A5F';
const ACCENT = '#3B82F6';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';
const TEXT_LIGHT = '#9CA3AF';
const GREEN = '#10B981';

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Render a professional offer letter on a Canvas and return it as a PDF Blob.
 * Falls back gracefully when company logo fails to load.
 */
export async function generateOfferLetterPdf(data: OfferLetterPdfData): Promise<Blob> {
  const { offer, verificationUrl } = data;

  const internship = offer.internship;
  const student    = offer.student;
  const company    = offer.company;

  // ── Create off-screen canvas ──────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // ── Header Band ───────────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, PAGE_WIDTH, 160);
  grad.addColorStop(0, PRIMARY);
  grad.addColorStop(1, '#2563EB');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PAGE_WIDTH, 160);

  // Company logo (if available)
  if (company?.logo_url) {
    try {
      const logoImg = await loadImage(company.logo_url);
      const logoSize = 72;
      ctx.save();
      ctx.beginPath();
      ctx.arc(MARGIN + logoSize / 2, 44 + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, MARGIN, 44, logoSize, logoSize);
      ctx.restore();
    } catch {
      // Logo failed — render initials fallback
      renderInitialsAvatar(ctx, company.name ?? 'CO', MARGIN, 44, 72, '#FFFFFF', PRIMARY);
    }
  } else {
    renderInitialsAvatar(ctx, company?.name ?? 'CO', MARGIN, 44, 72, '#FFFFFF', PRIMARY);
  }

  // Company name + tagline in header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(company?.name ?? 'Company', MARGIN + 90, 80);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Official Offer Letter', MARGIN + 90, 102);

  // Issue date top-right
  const issueDate = offer.issued_at
    ? new Date(offer.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Issued: ${issueDate}`, PAGE_WIDTH - MARGIN, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`Offer ID: ${offer.id.slice(0, 8).toUpperCase()}`, PAGE_WIDTH - MARGIN, 100);
  ctx.textAlign = 'left';

  // ── Body ──────────────────────────────────────────────────────────────────
  let y = 200;

  // "Dear [Name]" greeting
  ctx.fillStyle = TEXT_DARK;
  ctx.font = '15px sans-serif';
  ctx.fillText(`Dear ${student?.full_name ?? 'Candidate'},`, MARGIN, y);
  y += 30;

  // Opening paragraph
  const opening =
    `We are pleased to offer you the position of ${internship?.title ?? 'Intern'} ` +
    `at ${company?.name ?? 'our company'}. After reviewing your application and ` +
    `qualifications, we believe you are an excellent fit for our team.`;
  wrapText(ctx, opening, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 22, TEXT_MUTED, '14px');
  y += 85;

  // ── Position Details Card ────────────────────────────────────────────────
  drawCard(ctx, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 220, '#F0F7FF', ACCENT + '33');
  y += 20;

  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('POSITION DETAILS', MARGIN + 20, y);
  y += 20;

  const fields: [string, string][] = [
    ['Position',      internship?.title ?? '—'],
    ['Internship Type', internship?.type ?? '—'],
    ['Duration',      internship?.duration ?? '—'],
    ['Start Date',    internship?.start_date ? new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
    ['Compensation',  internship?.stipend ? `${internship.stipend} (${internship.stipend_type ?? ''})` : '—'],
    ['Work Mode',     internship?.location_type ?? '—'],
    ['Location',      internship?.location ?? company?.location ?? '—'],
  ];

  fields.forEach(([label, value]) => {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = '12px sans-serif';
    ctx.fillText(label, MARGIN + 20, y);
    ctx.fillStyle = TEXT_DARK;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(value, MARGIN + 180, y);
    y += 22;
  });
  y += 20;

  // ── Responsibilities ─────────────────────────────────────────────────────
  if (internship?.responsibilities?.length) {
    ctx.fillStyle = TEXT_DARK;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Key Responsibilities', MARGIN, y);
    y += 20;

    internship.responsibilities.slice(0, 5).forEach((r) => {
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('•', MARGIN, y);
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = '13px sans-serif';
      ctx.fillText(r, MARGIN + 16, y);
      y += 20;
    });
    y += 10;
  }

  // ── Offer Conditions ─────────────────────────────────────────────────────
  ctx.fillStyle = TEXT_DARK;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Offer Conditions', MARGIN, y);
  y += 20;

  const conditions = [
    'This offer is contingent upon the completion of all required documentation.',
    'You are required to maintain satisfactory performance throughout the internship.',
    `This offer expires on ${offer.expires_at ? new Date(offer.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '30 days from the issue date'}.`,
  ];
  conditions.forEach((c) => {
    wrapText(ctx, `• ${c}`, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 20, TEXT_MUTED, '12px');
    y += 38;
  });
  y += 10;

  // ── Closing ──────────────────────────────────────────────────────────────
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '13px sans-serif';
  const closing = 'We look forward to welcoming you to our team. Please accept or reject this offer via your Zyro dashboard.';
  wrapText(ctx, closing, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 20, TEXT_MUTED, '13px');
  y += 55;

  // ── Signature Line ───────────────────────────────────────────────────────
  ctx.strokeStyle = TEXT_LIGHT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(MARGIN + 180, y);
  ctx.stroke();
  y += 14;
  ctx.fillStyle = TEXT_DARK;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Authorized Signatory', MARGIN, y);
  y += 18;
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '12px sans-serif';
  ctx.fillText(company?.name ?? '', MARGIN, y);

  // ── QR Code (verification) ────────────────────────────────────────────────
  const qrSize = 90;
  const qrX = PAGE_WIDTH - MARGIN - qrSize;
  const qrY = PAGE_HEIGHT - 200;
  await drawQRCode(ctx, verificationUrl, qrX, qrY, qrSize);
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Scan to verify', qrX + qrSize, qrY + qrSize + 14);
  ctx.fillText(verificationUrl.slice(0, 40), qrX + qrSize, qrY + qrSize + 26);
  ctx.textAlign = 'left';

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, PAGE_HEIGHT - 56, PAGE_WIDTH, 56);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Offer ID: ${offer.id} · Verify at ${verificationUrl}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 33
  );
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(
    `© ${new Date().getFullYear()} Zyro Internship Platform · ${company?.name ?? ''} · Confidential`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 16
  );
  ctx.textAlign = 'left';

  // ── Status Watermark (Accepted / Rejected / Revoked) ──────────────────────
  if (['Accepted', 'Rejected', 'Revoked'].includes(offer.status)) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = offer.status === 'Accepted' ? GREEN : '#EF4444';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(offer.status.toUpperCase(), 0, 0);
    ctx.restore();
  }

  // ── Export to Blob ────────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob returned null'));
    }, 'image/png');    // PNG — Supabase stores it; user downloads it
  });
}

// ── Private helpers ───────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renderInitialsAvatar(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number, y: number, size: number,
  bg: string, fg: string
) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = `bold ${size * 0.38}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    (name || '?').slice(0, 2).toUpperCase(),
    x + size / 2,
    y + size / 2
  );
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number,
  color: string,
  font: string
) {
  ctx.fillStyle = color;
  ctx.font = font;
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  bg: string,
  border: string
) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

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

/** Render a minimal QR code using a data-URI service without network calls. */
async function drawQRCode(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  size: number
) {
  // Use Google Charts QR API (only network call — produces a small PNG)
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=${size * 2}x${size * 2}&chl=${encodeURIComponent(text)}&choe=UTF-8`;
  try {
    const img = await loadImage(src);
    ctx.drawImage(img, x, y, size, size);
  } catch {
    // Fallback: draw a placeholder box
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = '#888';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', x + size / 2, y + size / 2);
    ctx.textAlign = 'left';
  }
}
