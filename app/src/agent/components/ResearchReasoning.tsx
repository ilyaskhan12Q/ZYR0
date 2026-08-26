import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import React from "react";
import type { PipelineStage, EvidenceItem, CitationLedgerEntry, SubTaskContract } from "@/agent/research/types";
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";

interface ReasoningStep {
  id: string;
  label: string;
  detail?: string;
  status: 'completed' | 'active' | 'pending' | 'error';
}

function buildSteps(
  stage: PipelineStage,
  message: string,
  detail: string | undefined,
  contracts: SubTaskContract[],
  evidence: EvidenceItem[],
  ledger: CitationLedgerEntry[],
  errors: string[],
  running: boolean,
): ReasoningStep[] {
  const steps: ReasoningStep[] = [];

  if (stage === 'planning' || stage === 'review' || stage === 'working' || stage === 'verifying' || stage === 'writing' || stage === 'done' || stage === 'failed') {
    steps.push({
      id: 'planning',
      label: 'Planning the research agenda',
      detail: contracts.length > 0 ? `${contracts.length} research areas identified` : undefined,
      status: stage === 'planning' ? 'active' : 'completed',
    });
  }
  if (stage === 'review') {
    steps.push({
      id: 'review',
      label: 'Review the research plan',
      detail: detail,
      status: 'active',
    });
  }
  if (stage === 'working' || stage === 'verifying' || stage === 'writing' || stage === 'done' || stage === 'failed') {
    steps.push({
      id: 'working',
      label: 'Gathering evidence',
      detail: evidence.length > 0 ? `${evidence.length} sources found` : detail,
      status: stage === 'working' ? 'active' : 'completed',
    });
  }
  if (stage === 'verifying' || stage === 'writing' || stage === 'done' || stage === 'failed') {
    steps.push({
      id: 'verifying',
      label: 'Verifying sources',
      detail: ledger.length > 0 ? `${ledger.filter(l => l.verified).length} verified` : detail,
      status: stage === 'verifying' ? 'active' : 'completed',
    });
  }
  if (stage === 'writing' || stage === 'done' || stage === 'failed') {
    steps.push({
      id: 'writing',
      label: 'Writing the report',
      detail: stage === 'done' ? 'Report complete' : detail,
      status: stage === 'writing' ? 'active' : stage === 'done' ? 'completed' : 'pending',
    });
  }

  if (stage === 'failed') {
    const lastError = errors[errors.length - 1] ?? 'Unknown error';
    steps.push({
      id: 'error',
      label: 'Error',
      detail: lastError,
      status: 'error',
    });
  }

  return steps;
}

function StatusIcon({ status }: { status: ReasoningStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="size-4 text-emerald-400" />;
    case 'active':
      return <Loader2 className="size-4 text-blue-400 animate-spin" />;
    case 'error':
      return <XCircle className="size-4 text-red-400" />;
    default:
      return <Circle className="size-4 text-[#5a5a5f]" />;
  }
}

export function ResearchReasoning({
  stage,
  message,
  detail,
  contracts,
  evidence,
  ledger,
  errors,
  running,
  className,
}: {
  stage: PipelineStage;
  message: string;
  detail?: string;
  contracts: SubTaskContract[];
  evidence: EvidenceItem[];
  ledger: CitationLedgerEntry[];
  errors: string[];
  running: boolean;
  className?: string;
}) {
  const steps = buildSteps(stage, message, detail, contracts, evidence, ledger, errors, running);
  const defaultValue = running ? 'reasoning' : undefined;

  if (steps.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={cn("w-full", className)}
    >
      <AccordionItem value="reasoning" className="w-full">
        <AccordionTrigger className="text-md text-muted-foreground hover:no-underline hover:opacity-70 py-3 w-full">
          {running ? "Researching..." : `Research ${stage === 'done' ? 'complete' : stage === 'failed' ? 'failed' : stage === 'idle' ? 'complete' : `${stage}...`}.`}
        </AccordionTrigger>
        <AccordionContent className="p-0 -mt-1">
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-2 pl-2">
                <div className="flex flex-col items-center gap-1 pt-2 -mb-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                  <div
                    className={cn(
                      "w-0.5 min-h-0 flex-1 bg-border rounded-full",
                      index === steps.length - 1 &&
                        "bg-gradient-to-b from-border to-transparent",
                    )}
                  />
                </div>
                <div className="flex-1 py-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={step.status} />
                    <span className={cn(
                      "text-sm",
                      step.status === 'active' ? 'text-white font-medium' :
                      step.status === 'completed' ? 'text-[#a0a0a5]' :
                      step.status === 'error' ? 'text-red-400' :
                      'text-[#5a5a5f]'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {step.detail && (
                    <p className="text-xs text-[#6a6a6f] ml-6 mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
