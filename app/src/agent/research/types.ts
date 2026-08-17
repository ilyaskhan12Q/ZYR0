// Research pipeline contracts — isolated from the legacy zeroai module.

export type DimensionId = 'foundations' | 'technical' | 'benchmarks' | 'constraints';

export const DIMENSION_ORDER: readonly DimensionId[] = [
  'foundations',
  'technical',
  'benchmarks',
  'constraints',
];

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  foundations: 'Foundations & Baseline',
  technical: 'Technical Architecture & Mechanics',
  benchmarks: 'Benchmarks & Empirical Data',
  constraints: 'Constraints, Economics & Outlook',
};

export interface SubTaskContract {
  taskId: number;
  dimension: DimensionId;
  focusArea: string;
  subQuestions: string[];
  subTopicTitle: string;
  coreObjective: string;
  keywords: string[];
  boundaries: {
    include: string[];
    exclude: string[];
  };
  outputFields: string[];
  sourceTypes: string[];
}

export type EvidenceSourceType = 'academic' | 'web';

export interface EvidenceItem {
  id: string;
  title: string;
  url: string;
  sourceType: EvidenceSourceType;
  sourceName: string; // 'OpenAlex' | 'arXiv' | 'Semantic Scholar' | 'Jina Web'
  year?: number;
  doi?: string;
  authors?: string[];
  snippet?: string;
}

export interface CitationLedgerEntry extends EvidenceItem {
  key: number; // deterministic [key] = 1..N in ledger order
  verified: boolean;
  status: number; // HTTP status from the gateway verify pass
}

export interface DecompositionResult {
  contracts: SubTaskContract[];
  provider: string;
  elapsedMs: number;
  error?: string;
}

export interface ResearchReport {
  topic: string;
  contracts: SubTaskContract[];
  evidence: EvidenceItem[];
  ledger: CitationLedgerEntry[];
  markdown: string;
  model: string;
  elapsedMs: number;
  created_at: string;
  researchId?: string;
}

export type PipelineStage =
  | 'idle'
  | 'planning'
  | 'review'
  | 'working'
  | 'verifying'
  | 'writing'
  | 'done'
  | 'failed';

export interface PipelineStageUpdate {
  stage: PipelineStage;
  message: string;
  detail?: string;
}