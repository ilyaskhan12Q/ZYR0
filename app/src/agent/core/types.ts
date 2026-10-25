export type AgentTier = 'free' | 'byok' | 'local';

export interface AgentModelInfo {
  id: string;
  name: string;
  provider: string;
  tier: AgentTier;
  context: number;
  output: number;
  inputPricePer1M: number;
  outputPricePer1M: number;
  enabled: boolean;
}

export interface AgentUsageMeta {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Lightweight attachment descriptor forwarded with a user message.
 * `url` is a local blob URL used for in-app preview only — it is never
 * sent to the gateway (which is text-only).
 */
export interface AgentAttachment {
  id: string;
  name: string;
  url: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  meta?: AgentUsageMeta;
  streaming?: boolean;
  error?: string;
}

export interface AgentModelsResponse {
  models: AgentModelInfo[];
}

export interface AgentChatResponse {
  ok: boolean;
  text?: string;
  model?: string;
  usage?: { inputTokens: number; outputTokens: number };
  latencyMs?: number;
  error?: string;
}

export type AgentChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'usage'; model: string; inputTokens: number; outputTokens: number; latencyMs: number }
  | { type: 'error'; message: string }
  | { type: 'done' };

export const AGENT_TIER_LABEL: Record<AgentTier, string> = {
  free: 'Free',
  byok: 'BYOK',
  local: 'Local',
};