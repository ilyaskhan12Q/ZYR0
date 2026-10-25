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

/**
 * Identity questions ("who are you", "which model are you", "are you Google?")
 * must always take the chat path — the research pipeline's planner/editorial
 * prompts carry no ZYR0 identity, so letting one through lets the underlying
 * model answer with its own vendor identity.
 */
const IDENTITY_QUESTION = new RegExp(
  [
    '\\b(who|what)\\s+(are|r|is|am)\\s+(you|u)\\b',
    '\\bwho\\s+(made|created|built|developed|trained|owns|operates?)\\s+(you|u)\\b',
    '\\b(what|which)\\s+(model|ai|llm|assistant|chatbot|engine)\\b[^?]{0,40}\\b(you|u|this)\\b',
    '\\bare\\s+(you|u)\\b[^?]{0,40}\\b(google|gemini|openai|chatgpt|gpt|deepseek|claude|anthropic|grok|meta|llama|microsoft|copilot)\\b',
    '\\b(google|gemini|openai|chatgpt|deepseek|claude|grok)\\b[^?]{0,30}\\b(are|agent|bot)\\s+(you|u)\\b',
    '\\byour\\s+(identity|name|maker|creator|developer)s?\\b',
    '\\btell\\s+me\\s+about\\s+(yourself|you|u)\\b',
    '\\bwhat\\s+should\\s+i\\s+call\\s+you\\b',
  ].join('|'),
  'i',
);

export function isGreeting(text: string): boolean {
  return GREETINGS.has(text.trim().toLowerCase().replace(/[.!?]+$/g, ''));
}

export function isIdentityQuestion(text: string): boolean {
  return IDENTITY_QUESTION.test(text.trim());
}

export function classifyLocally(text: string): RouteDecision {
  const trimmed = text.trim();
  const length = trimmed.length;
  if (isIdentityQuestion(trimmed)) {
    return { mode: 'chat', confidence: 0.99, source: 'rules', reason: 'identity' };
  }
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
