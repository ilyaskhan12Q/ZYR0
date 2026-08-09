/**
 * Shared Design System & Configuration Constants for Offer Letters
 * Single Source of Truth for both HTML/React UI preview (`OfferLetterDocument.tsx`)
 * and HTML5 Canvas PDF generator (`offerLetterPdf.ts`).
 */

// ── Classical Premium Color Palette ─────────────────────────────────────────
export const OFFER_LETTER_COLORS = {
  PAPER_CREAM: '#f1ece0',
  PAPER_IVORY: '#fffdf5',
  PAPER_TAN: '#efe5ca',
  GOLD: '#b89c56',
  GOLD_DARK: '#a3874f',
  GOLD_SOFT: '#cbb880',
  NAVY: '#1e3a8a',
  INK: '#13100d',
  TEXT_MUTED: '#8a7f6c',
  TEXT_SOFT: '#5b544a',
  TEXT_BODY: '#26221e',
} as const;

// ── Typography & Fonts ────────────────────────────────────────────────────────
export const FONT_CINZEL = `'Cinzel', Georgia, 'Times New Roman', serif`;
export const FONT_SANS = `'Montserrat', -apple-system, 'Segoe UI', Arial, sans-serif`;
export const FONT_SCRIPT = `'Playfair Display', Georgia, serif`;

export const OFFER_LETTER_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700' +
  '&family=Montserrat:wght@300;400;500;600;700;800' +
  '&family=Playfair+Display:ital,wght@1,600&display=swap';

// ── Dimensions ────────────────────────────────────────────────────────────────
export const CANVAS_PAGE_WIDTH = 1600;  // 192 DPI (A4 aspect ratio: ~1.4137)
export const CANVAS_PAGE_HEIGHT = 2262;
export const CANVAS_MARGIN = 64;

// ── Shared Terms & Conditions ────────────────────────────────────────────────
export const DEFAULT_OFFER_TERMS = [
  'This offer is contingent upon verification of candidate credentials and completion of required onboarding paperwork.',
  'You are expected to maintain professional standards, confidentiality, and data safety during the internship.',
  'This offer remains valid until the specified expiration date, after which it may expire automatically unless extended.',
];

/** Build formatted detail fields array for both UI and Canvas */
export function buildOfferDetails(data: {
  studentName: string;
  position: string;
  internshipType: string;
  workArrangement: string;
  duration: string;
  startDate: string;
  compensation: string;
  signatoryInfo: string;
}) {
  return [
    { label: 'Candidate Name', value: data.studentName },
    { label: 'Position Title', value: data.position },
    { label: 'Internship Category', value: data.internshipType },
    { label: 'Work Arrangement', value: data.workArrangement },
    { label: 'Duration', value: data.duration },
    { label: 'Proposed Start Date', value: data.startDate },
    { label: 'Stipend / Compensation', value: data.compensation },
    { label: 'Reporting Signatory', value: data.signatoryInfo },
  ];
}
