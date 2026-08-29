import { chatOnce } from '@/agent/api/gateway';
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  type DecompositionResult,
  type DimensionId,
  type SubTaskContract,
} from '@/agent/research/types';

const SYSTEM_PROMPT = `You are the Planner Agent of a deep-research system. Decompose a topic into EXACTLY 4 sub-task worker contracts, one per research dimension:

1. Dimension "foundations" — Foundational Context & Definitions
2. Dimension "technical" — Core Mechanism & Deep Architecture
3. Dimension "benchmarks" — State-of-the-Art Benchmarks & Real-World Implementations
4. Dimension "constraints" — Bottlenecks, Trade-offs & Future Challenges

Return ONLY a JSON object:
{"contracts":[{"taskId":1,"dimension":"foundations","focusArea":"short focus label","subTopicTitle":"searchable domain label","coreObjective":"exactly what question the worker must answer","keywords":["search term 1","search term 2","search term 3"]}],"contracts":[...]}

Rules:
- subTopicTitle: short, searchable phrase that appears in academic papers (not a sentence)
- keywords: SPECIFIC SEARCH TERMS that appear in paper titles (not generic like "definition" or "principles")
- 3 keywords per contract
- exactly 4 contracts in the order foundations, technical, benchmarks, constraints
- taskId 1..4
- JSON only, no markdown, no commentary`;

function buildUserPrompt(topic: string): string {
  return `Decompose this topic into the 4 sub-task contracts:\n\nTopic: "${topic}"\n\nOutput ONLY the JSON object.`;
}

export function extractJson(text: string): unknown | null {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function asStringArray(v: unknown, maxItems: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, maxItems)
    .map((item) => asString(item))
    .filter(Boolean);
}

function isContractLike(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

export function validateContracts(raw: unknown): SubTaskContract[] | null {
  if (!isContractLike(raw)) return null;
  const arr = raw.contracts;
  if (!Array.isArray(arr) || arr.length !== 4) return null;

  const contracts: SubTaskContract[] = [];
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (!isContractLike(c)) return null;
    const dimension = (DIMENSION_ORDER as readonly string[]).includes(c.dimension as string)
      ? (c.dimension as DimensionId)
      : DIMENSION_ORDER[i];
    const boundaries = isContractLike(c.boundaries) ? c.boundaries : undefined;
    const contract: SubTaskContract = {
      taskId: i + 1,
      dimension,
      focusArea: asString(c.focusArea),
      subQuestions: asStringArray(c.subQuestions, 6),
      subTopicTitle: asString(c.subTopicTitle),
      coreObjective: asString(c.coreObjective),
      keywords: asStringArray(c.keywords, 6),
      boundaries: {
        include: asStringArray(boundaries?.include, 6),
        exclude: asStringArray(boundaries?.exclude, 6),
      },
      outputFields: asStringArray(c.outputFields, 8),
      sourceTypes: asStringArray(c.sourceTypes, 6),
    };
    if (!contract.focusArea || !contract.subTopicTitle || !contract.coreObjective) return null;
    contracts.push(contract);
  }
  return contracts;
}

function buildContract(dimension: DimensionId, topic: string): SubTaskContract {
  const label = DIMENSION_LABELS[dimension];
  const byDimension: Record<DimensionId, Omit<SubTaskContract, 'taskId' | 'dimension'>> = {
    foundations: {
      focusArea: 'Foundational Context & Definitions',
      subQuestions: [
        `What core concepts, definitions and prior approaches anchor "${topic}"?`,
        'Which baseline principles or earlier work frame the current state of the field?',
        'What foundational data or canonical references must the report cite?',
      ],
      subTopicTitle: `Foundational context: ${topic}`,
      coreObjective: 'Establish baseline definitions, underlying principles and prior approaches for the topic.',
      keywords: [topic, 'definition', 'overview', 'review'],
      boundaries: {
        include: ['peer-reviewed papers', 'institutional and reference sources'],
        exclude: ['shallow blog posts', 'marketing copy', 'uncredited claims'],
      },
      outputFields: ['definition', 'key principles', 'prior approaches', 'dates', 'full source attribution'],
      sourceTypes: ['Academic papers', 'Review articles', 'Standard references'],
    },
    technical: {
      focusArea: 'Core Mechanism & Deep Architecture',
      subQuestions: [
        `What are the core technical components and mechanisms behind "${topic}"?`,
        'Which engineering workflows, algorithms or processes are involved?',
        'What design choices or failure modes matter most?',
      ],
      subTopicTitle: `Mechanism & architecture: ${topic}`,
      coreObjective: 'Investigate the technical components, engineering workflows and underlying mechanisms of the topic.',
      keywords: [topic, 'architecture', 'algorithm', 'method', 'framework'],
      boundaries: {
        include: ['peer-reviewed papers', 'technical documentation', 'official whitepapers'],
        exclude: ['marketing copy', 'non-technical summaries'],
      },
      outputFields: ['component', 'mechanism', 'design trade-off', 'specification', 'full source attribution'],
      sourceTypes: ['Academic papers', 'Technical documentation', 'Preprints (arXiv)'],
    },
    benchmarks: {
      focusArea: 'State-of-the-Art Benchmarks & Real-World Implementations',
      subQuestions: [
        `What measured metrics, benchmarks or evaluations exist for "${topic}"?`,
        'Which leading industry or academic implementations demonstrate real-world results?',
        'What case studies quantify the impact or performance?',
      ],
      subTopicTitle: `Benchmarks & implementations: ${topic}`,
      coreObjective: 'Pull real metrics, case studies, empirical benchmarks and leading industry/academic implementations.',
      keywords: [topic, 'benchmark', 'evaluation', 'performance', 'results'],
      boundaries: {
        include: ['peer-reviewed studies', 'empirical benchmarks', 'official case studies'],
        exclude: ['marketing copy', 'unverified claims', 'aggregator summaries'],
      },
      outputFields: ['metric', 'result', 'study size', 'year', 'full source attribution'],
      sourceTypes: ['Empirical papers', 'Industry reports', 'Preprints (arXiv)'],
    },
    constraints: {
      focusArea: 'Bottlenecks, Trade-offs & Future Outlook',
      subQuestions: [
        `What cost barriers, scalability limits or bottlenecks face "${topic}"?`,
        'Which security, regulatory or supply-chain hurdles apply?',
        'What do credible outlooks say about the near-term trajectory?',
      ],
      subTopicTitle: `Constraints & outlook: ${topic}`,
      coreObjective: 'Identify cost barriers, scalability limitations, security vulnerabilities and regulatory hurdles.',
      keywords: [topic, 'challenges', 'limitations', 'future', 'trends'],
      boundaries: {
        include: ['official reports', 'regulatory filings', 'peer-reviewed studies'],
        exclude: ['marketing copy', 'opinion pieces without evidence'],
      },
      outputFields: ['bottleneck', 'trade-off', 'regulatory status', 'outlook', 'full source attribution'],
      sourceTypes: ['Industry reports', 'Regulatory filings', 'Press releases with evidence'],
    },
  };
  return { taskId: 0, dimension, ...byDimension[dimension] };
}

export function fallbackContracts(topic: string): SubTaskContract[] {
  return DIMENSION_ORDER.map((dimension, i) => ({
    ...buildContract(dimension, topic),
    taskId: i + 1,
  }));
}

/**
 * Decompose a topic through the ai-gateway chat (non-streaming for speed).
 * Uses Gemini by default (fastest). Retries once when the model output is
 * invalid, then falls back to rule-built contracts.
 */
export async function decompose(topic: string): Promise<DecompositionResult> {
  const started = performance.now();

  // 8-second client-side timeout — never wait longer for the planner.
  const timeoutMs = 8_000;

  const callLLM = async (prompt: string): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await chatOnce(
        [{ role: 'user', content: prompt }],
        {
          system: SYSTEM_PROMPT,
          maxTokens: 800,
          signal: controller.signal,
        },
      );
      return result.ok ? (result.text ?? '') : '';
    } catch {
      return '';
    } finally {
      clearTimeout(timer);
    }
  };

  const text = await callLLM(buildUserPrompt(topic));
  const elapsedMs = Math.round(performance.now() - started);

  if (text.trim()) {
    const contracts = validateContracts(extractJson(text));
    if (contracts) {
      return { contracts, provider: 'gateway', elapsedMs };
    }

    // One retry for degraded output before falling back.
    const retryText = await callLLM(buildUserPrompt(topic));
    const retryContracts = retryText.trim() ? validateContracts(extractJson(retryText)) : null;
    if (retryContracts) {
      return { contracts: retryContracts, provider: 'gateway', elapsedMs };
    }

    return {
      contracts: fallbackContracts(topic),
      provider: 'fallback',
      elapsedMs,
      error: 'Planner output did not match the contract schema',
    };
  }
  return {
    contracts: fallbackContracts(topic),
    provider: 'fallback',
    elapsedMs,
    error: 'Planner request failed or timed out',
  };
}
