import { Clipboard, FileDown, FileJson2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { ResearchReport } from '@/data/zeroAiFixtures';
import { reportToMarkdown } from '@/data/zeroAiFixtures';

interface ExportToolbarProps {
  report: ResearchReport;
  onJsonInspect: () => void;
  onNewResearch: () => void;
}

export function ExportToolbar({ report, onJsonInspect, onNewResearch }: ExportToolbarProps) {
  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(reportToMarkdown(report));
      toast.success('Markdown copied to clipboard');
    } catch {
      toast.error('Clipboard unavailable');
    }
  };

  const exportPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 18;
      let y = 18;

      const writeBlock = (label: string, lines: string[]) => {
        if (y > 262) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(20);
        doc.text(doc.splitTextToSize(label, pageWidth - margin * 2), margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(45);
        for (const line of lines) {
          const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2) as string[];
          for (const w of wrapped) {
            if (y > 270) {
              doc.addPage();
              y = 18;
            }
            doc.text(w, margin, y);
            y += 5;
          }
        }
        y += 3;
      };

      if (y > 262) {
        doc.addPage();
        y = 18;
      }
      writeBlock(report.title, []);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(110);
      doc.text(
        doc.splitTextToSize(
          `Report ID: ${report.id} · Depth: ${report.depth} · Duration: ${report.durationSec}s · Sources: ${report.sources.length}`,
          pageWidth - margin * 2
        ),
        margin,
        (y += 2)
      );
      y += 6;

      writeBlock('Abstract', doc.splitTextToSize(report.abstract, pageWidth - margin * 2) as string[]);
      for (const section of report.sections) {
        const paragraphLines: string[] = [];
        for (const para of section.paragraphs) {
          const refs = para.citations.map((n) => `[${n}]`).join('');
          paragraphLines.push(`${para.text}${refs}`, '');
        }
        writeBlock(section.heading, paragraphLines);
      }
      const sourceLines = report.sources.map(
        (s, i) =>
          `${i + 1}. ${s.kind === 'academic' ? 'Academic' : 'Industry'} — ${s.authors}. ${s.title}. ${s.venue} (${s.year})${s.doi ? `, DOI: ${s.doi}` : ''}`
      );
      writeBlock('Sources', sourceLines);

      doc.save(`0-ai-${report.id}.pdf`);
      toast.success('PDF exported');
    } catch {
      toast.error('PDF export failed');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button variant="ghost" size="sm" onClick={copyMarkdown} className="gap-1.5 text-xs">
        <Clipboard className="size-3.5" /> Copy Markdown
      </Button>
      <Button variant="ghost" size="sm" onClick={exportPdf} className="gap-1.5 text-xs">
        <FileDown className="size-3.5" /> Export PDF
      </Button>
      <Button variant="ghost" size="sm" onClick={onJsonInspect} className="gap-1.5 text-xs">
        <FileJson2 className="size-3.5" /> JSON
      </Button>
      <Button variant="outline" size="sm" onClick={onNewResearch} className="gap-1.5 text-xs">
        <RefreshCw className="size-3.5" /> New Research
      </Button>
    </div>
  );
}