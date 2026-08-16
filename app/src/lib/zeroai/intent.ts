import { callLlm, extractJson } from './llm';
import type { ZeroAiKeys } from '@/hooks/useZeroAiKeys';

export type RouteMode = 'chat' | 'research';
export type ComposerMode = 'auto' | RouteMode;

export interface RouteDecision {
  mode: RouteMode;
  /** 0..1 — how confident the router is. Low + long message => confirmation popup. */
  confidence: number;
  /** Where the decision came from: live LLM probe or local rules. */
  source: 'probe' | 'rules';
  reason: string;
}

const PROBE_SYSTEM = `You are the router of a deep-research assistant. A chat request is casual conversation: greetings, small talk, simple facts, or clarification — it does not need evidence gathering. A research request asks for a substantive, evidence-backed answer: comparisons, impact analyses, mechanisms, benchmarks, or studies, where the answer should cite sources.

Reply with ONLY a JSON object, no commentary, no markdown:
{"mode":"chat"|"research","confidence":0.0..1.0}`;

const GREETINGS = new Set([
  'hi', 'hello', 'hey', 'yo', 'sup', 'hiya', 'howdy',
  'good morning', 'good afternoon', 'good evening',
  'how are you', 'how r u', 'how are you doing', 'whats up', 'what\'s up',
  'thanks', 'thank you', 'ty', 'thx', 'thanks a lot', 'thank you so much',
  'ok', 'okay', 'bye', 'goodbye', 'see you', 'see ya', 'nice', 'cool', 'great',
  'hello there', 'hey there', 'hi there',
]);

const AMBIGUITY_CONFIDENCE = 0.72;
const AMBIGUITY_MIN_CHARS = 25;

const RESEARCH_SIGNALS =
  /\b(compare|comparison|difference|impact|effect|affect|analy|evaluat|evidence|research|study|studies|source|benchmark|metric|data|paper|literature|review|explain|mechanism|architecture|trend|statistic|report|sodium|battery|credential|mentor|intern|ai|ml|llm|market|industry|policy|regulat)\b/i;

const QUESTION_OPENER = /^(how|why|what|when|where|which|who|is|are|does|do|can|should|could|would)\b/i;

export function parseProbe(text: string): { mode: RouteMode; confidence: number } | null {
  const raw = extractJson(text);
  if (!raw || typeof raw !== 'object') return null;
  const mode = (raw as { mode?: unknown }).mode;
  if (mode !== 'chat' && mode !== 'research') return null;
  const confidence = Number((raw as { confidence?: unknown }).confidence);
  if (!Number.isFinite(confidence)) return null;
  return { mode, confidence: Math.min(1, Math.max(0, confidence)) };
}

export function isGreeting(text: string): boolean {
  return GREETINGS.has(text.trim().toLowerCase().replace(/[.!?]+$/g, ''));
}

export function classifyLocally(text: string): RouteDecision {
  const trimmed = text.trim();
  const length = trimmed.length;
  if (isGreeting(trimmed)) {
    return { mode: 'chat', confidence: 0.96, source: 'rules', reason: 'greeting' };
  }
  if (length < 2) {
    return { mode: 'chat', confidence: 0.9, source: 'rules', reason: 'too-short' };
  }
  if (length < 12) {
    return { mode: 'chat', confidence: 0.7, source: 'rules', reason: 'short-casual' };
  }
  if (length >= 20 && RESEARCH_SIGNALS.test(trimmed)) {
    return { mode: 'research', confidence: 0.75, source: 'rules', reason: 'keyword-signal' };
  }
  if (length >= 20 && QUESTION_OPENER.test(trimmed)) {
    return { mode: 'research', confidence: 0.7, source: 'rules', reason: 'question-opener' };
  }
  if (length >= 40) {
    return { mode: 'research', confidence: 0.62, source: 'rules', reason: 'long-topic' };
  }
  return { mode: 'chat', confidence: 0.55, source: 'rules', reason: 'default-short' };
}

export function wantsConfirm(decision: RouteDecision, text: string): boolean {
  return decision.mode === 'chat' && decision.confidence < AMBIGUITY_CONFIDENCE && text.trim().length >= AMBIGUITY_MIN_CHARS;
}

export async function classifyIntent(text: string, keys: ZeroAiKeys): Promise<RouteDecision> {
  const res = await callLlm(
    PROBE_SYSTEM,
    `Classify this user message. Output ONLY the JSON object.\n\nMessage: "${text}"`,
    keys
  );
  if (res.ok) {
    const parsed = parseProbe(res.text);
    if (parsed) {
      return {
        mode: parsed.mode,
        confidence: parsed.confidence,
        source: 'probe',
        reason: 'llm-probe',
      };
    }
  }
  return classifyLocally(text);
}