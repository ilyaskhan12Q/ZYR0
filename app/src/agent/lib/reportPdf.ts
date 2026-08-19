import { jsPDF } from 'jspdf';
import type { ResearchReport } from '@/agent/research/types';

// A4 in points
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const FONT_BODY = 'helvetica';
const FONT_BODY_SIZE = 10;
const LINE_H = 13;

function slugify(topic: string): string {
  return (
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'research-report'
  );
}

function markdownToPdfLines(markdown: string): string[] {
  return markdown.split('\n').map((line) => {
    const trimmed = line.trimEnd();
    if (/^##\s/.test(trimmed)) return `\x00H2\x00${trimmed.replace(/^##\s/, '')}`;
    if (/^###\s/.test(trimmed)) return `\x00H3\x00${trimmed.replace(/^###\s/, '')}`;
    if (/^-\s/.test(trimmed)) return `\x00BUL\x00${trimmed.replace(/^-\s/, '')}`;
    return trimmed.replace(/\*\*([^*]+)\*\*/g, '$1');
  });
}

function wrapLines(doc: jsPDF, text: string, size: number, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function drawTextWithWrap(
  doc: jsPDF,
  text: string,
  size: number,
  style: string,
  x: number,
  y: number,
  lineHeight: number,
): number {
  const lines = wrapLines(doc, text, size, CONTENT_W);
  doc.setFont(FONT_BODY, style);
  doc.setFontSize(size);
  for (const line of lines) {
    if (y > PAGE_H - MARGIN - lineHeight) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function addFooter(doc: jsPDF, label: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(FONT_BODY, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${label} · Page ${i} of ${pages}`, PAGE_W / 2, PAGE_H - 24, { align: 'center' });
  }
  doc.setTextColor(30, 30, 30);
}

export function generateReportPdf(report: ResearchReport): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });

  let y = MARGIN;

  // Header
  doc.setFont(FONT_BODY, 'bold');
  doc.setFontSize(16);
  doc.text(report.topic, MARGIN, y);
  y += 22;

  doc.setFont(FONT_BODY, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  const elapsed = report.elapsedMs >= 60_000 ? `${(report.elapsedMs / 60_000).toFixed(1)} min` : `${report.elapsedMs}s`;
  const verified = report.ledger.filter((entry) => entry.verified).length;
  const pending = report.ledger.length - verified;
  doc.text(
    `${report.model || '—'} · ${elapsed} · ${verified} verified${pending > 0 ? ` · ${pending} additional` : ''} · ${new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    MARGIN,
    y,
  );
  doc.setTextColor(30, 30, 30);
  y += 26;

  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 24;

  // Report body
  for (const raw of markdownToPdfLines(report.markdown)) {
    if (raw.startsWith('\x00H2\x00')) {
      y += 6;
      y = drawTextWithWrap(doc, raw.slice(5), 13, 'bold', MARGIN, y, 17);
      y += 4;
    } else if (raw.startsWith('\x00H3\x00')) {
      y = drawTextWithWrap(doc, raw.slice(5), 11, 'bold', MARGIN, y, 15);
      y += 2;
    } else if (raw.startsWith('\x00BUL\x00')) {
      const lines = wrapLines(doc, raw.slice(5), FONT_BODY_SIZE, CONTENT_W - 14);
      doc.setFont(FONT_BODY, 'normal');
      doc.setFontSize(FONT_BODY_SIZE);
      for (const line of lines) {
        if (y > PAGE_H - MARGIN - LINE_H) {
          doc.addPage();
          y = MARGIN;
        }
        doc.text('•', MARGIN + 2, y);
        doc.text(line, MARGIN + 14, y);
        y += LINE_H;
      }
    } else if (raw.trim() === '') {
      y += 4;
    } else {
      y = drawTextWithWrap(doc, raw, FONT_BODY_SIZE, 'normal', MARGIN, y, LINE_H);
    }
  }

  // Citation ledger
  doc.addPage();
  y = MARGIN;
  doc.setFont(FONT_BODY, 'bold');
  doc.setFontSize(14);
  doc.text('Citation Ledger', MARGIN, y);
  y += 24;

  for (const entry of report.ledger) {
    if (y > PAGE_H - MARGIN - 60) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont(FONT_BODY, 'bold');
    doc.setFontSize(9);
    doc.text(`${entry.key > 0 ? `[${entry.key}]` : '•'} ${entry.title}`, MARGIN, y);
    y += 12;

    doc.setFont(FONT_BODY, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    const meta = `${entry.sourceName}${entry.year ? ` · ${entry.year}` : ''}${entry.authors?.length ? ` · ${entry.authors.slice(0, 3).join(', ')}` : ''}${entry.verified ? ' · verified' : ' · unverified'}`;
    doc.text(meta, MARGIN, y);
    y += 11;
    doc.setTextColor(60, 90, 160);
    const urlLines = wrapLines(doc, entry.url, 8, CONTENT_W);
    for (const line of urlLines) {
      doc.text(line, MARGIN, y);
      y += 11;
    }
    doc.setTextColor(30, 30, 30);
    y += 8;
  }

  addFooter(doc, 'ZYR0 Research Agent');
  doc.save(`zyro-research-${slugify(report.topic)}.pdf`);
}