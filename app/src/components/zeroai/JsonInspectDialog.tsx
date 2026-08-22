import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TELEMETRY_LOGS, TELEMETRY_STEPS, type ResearchReport } from '@/data/zeroAiFixtures';

interface JsonInspectDialogProps {
  report: ResearchReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Pretty-printed mock telemetry/JSON inspector dialog. */
export function JsonInspectDialog({ report, open, onOpenChange }: JsonInspectDialogProps) {
  const payload = {
    report: {
      id: report.id,
      prompt: report.prompt,
      depth: report.depth,
      durationSec: report.durationSec,
      generatedAt: report.generatedAt,
      title: report.title,
      sections: report.sections.length,
      sources: report.sources.length,
    },
    pipeline: {
      steps: TELEMETRY_STEPS,
      logs: TELEMETRY_LOGS,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="za-mono text-sm tracking-wide">Report Telemetry JSON</DialogTitle>
          <DialogDescription className="text-xs">
            Raw mock pipeline payload — inspect before a real backend replaces it.
          </DialogDescription>
        </DialogHeader>
        <pre className="za-mono max-h-[60vh] overflow-auto rounded-xl border bg-background/70 p-4 text-[11px] leading-relaxed text-muted-foreground">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}