import { callLlm } from './llm';
import { isGreeting } from './intent';
import type { ZeroAiKeys } from '@/hooks/useZeroAiKeys';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const CHAT_MEMORY_TURNS = 8;

export const CHAT_SYSTEM = `You are 0-AI, a warm, concise assistant living inside a deep-research workspace.

Rules:
- Answer casual questions conversationally, in plain text. No markdown headers, no emoji.
- Keep replies short (2-4 sentences) unless the question genuinely needs more.
- If the question needs evidence, comparisons or sources, say so and offer: "I can run this as full research mode instead — just tap Research."
- Never fabricate citations or numbers in quick-chat mode.`;

const GREETING_FALLBACKS = [
  "Hey there! I'm 0-AI. I can answer quick questions right here, or dig deep — switch me into research mode and I'll plan, search, verify and synthesize sources into a citation-grade report.",
  "Hi! Quick chat here, or full deep-research mode whenever you need evidence-backed answers. What would you like to do?",
];

const GENERIC_FALLBACKS = [
  "I'm in quick-chat mode right now. For a question like this I'd normally gather sources, benchmark data and verified evidence — try research mode and I'll produce the full citation-grade report.",
  "That deserves more than a quick answer. Switch to research mode and I'll plan the search, pull sources and synthesize everything into a verified report.",
];

function pickFallback<T>(list: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

export function fallbackChatReply(history: ChatTurn[]): string {
  const lastUser = [...history].reverse().find((t) => t.role === 'user');
  if (!lastUser) return GENERIC_FALLBACKS[0];
  if (isGreeting(lastUser.text)) return pickFallback(GREETING_FALLBACKS, lastUser.text);
  return pickFallback(GENERIC_FALLBACKS, lastUser.text);
}

export function buildChatUserPrompt(history: ChatTurn[]): string {
  return history
    .slice(-CHAT_MEMORY_TURNS)
    .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`)
    .join('\n');
}

export interface ChatReplyResult {
  text: string;
  fromFallback: boolean;
}

export async function chatReply(history: ChatTurn[], keys: ZeroAiKeys): Promise<ChatReplyResult> {
  const res = await callLlm(CHAT_SYSTEM, buildChatUserPrompt(history), keys);
  if (res.ok) {
    const text = res.text.trim();
    if (text) return { text, fromFallback: false };
  }
  return { text: fallbackChatReply(history), fromFallback: true };
}