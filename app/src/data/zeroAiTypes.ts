import type { ProviderId } from '@/hooks/useZeroAiKeys';

export type DimensionId = 'foundations' | 'technical' | 'benchmarks' | 'constraints';

export const DIMENSION_ORDER: readonly DimensionId[] = ['foundations', 'technical', 'benchmarks', 'constraints'];

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  foundations: 'Foundational Context & Definitions',
  technical: 'Core Mechanism & Deep Architecture',
  benchmarks: 'State-of-the-Art Benchmarks & Implementations',
  constraints: 'Bottlenecks, Trade-offs & Future Challenges',
};

export interface ContractBoundaries {
  include: string[];
  exclude: string[];
}

export interface SubTaskContract {
  taskId: number;
  dimension: DimensionId;
  focusArea: string;
  subQuestions: string[];
  subTopicTitle: string;
  coreObjective: string;
  keywords: string[];
  boundaries: ContractBoundaries;
  outputFields: string[];
  sourceTypes: string[];
}

export interface DecompositionResult {
  contracts: SubTaskContract[];
  provider: ProviderId | 'fallback';
  elapsedMs: number;
  error?: string;
}