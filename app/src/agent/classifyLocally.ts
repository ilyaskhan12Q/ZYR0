export type RouteMode = 'chat' | 'research';

export interface RouteDecision {
  mode: RouteMode;
  confidence: number;
  source: 'probe' | 'rules';
  reason: string;
}

const GREETINGS = new Set([
  'hi', 'hello', 'hey', 'yo', 'sup', 'hiya', 'howdy',
  'good morning', 'good afternoon', 'good evening',
  'how are you', 'how r u', 'how are you doing', 'whats up', 'what\'s up',
  'thanks', 'thank you', 'ty', 'thx', 'thanks a lot', 'thank you so much',
  'ok', 'okay', 'bye', 'goodbye', 'see you', 'see ya', 'nice', 'cool', 'great',
  'hello there', 'hey there', 'hi there',
]);

const RESEARCH_SIGNALS =
  /\b(compare|comparison|difference|impact|effect|affect|analy|evaluat|evidence|research|study|studies|source|benchmark|metric|data|paper|literature|review|explain|mechanism|architecture|trend|statistic|report|sodium|battery|credential|mentor|intern|ai|ml|llm|market|industry|policy|regulat)\b/i;

const QUESTION_OPENER = /^(how|why|what|when|where|which|who|is|are|does|do|can|should|could|would)\b/i;

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
