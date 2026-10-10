import type { ResearchDepth } from '@/agent/research/types';

/**
 * Workspace preferences behind the Settings panel.
 *
 * These are browser-local (localStorage) on purpose: they change how the
 * workspace *starts* — which mode a new thread opens in, whether threads are
 * saved, how deep a research run goes — and must survive reloads without
 * needing a database round trip. The plan-review preference lives with the
 * pipeline hook (`useResearchPipeline`), which owns its own key.
 */
export type AgentMode = 'chat' | 'research';

const DEFAULT_MODE_KEY = 'zyro-research-default-mode';
const START_TEMPORARY_KEY = 'zyro-research-start-temporary';
const DEFAULT_DEPTH_KEY = 'zyro-research-default-depth';

export function readDefaultMode(): AgentMode {
  return localStorage.getItem(DEFAULT_MODE_KEY) === 'research' ? 'research' : 'chat';
}

export function writeDefaultMode(mode: AgentMode): void {
  localStorage.setItem(DEFAULT_MODE_KEY, mode);
}

export function readStartTemporary(): boolean {
  return localStorage.getItem(START_TEMPORARY_KEY) === '1';
}

export function writeStartTemporary(value: boolean): void {
  localStorage.setItem(START_TEMPORARY_KEY, value ? '1' : '0');
}

export function readDefaultDepth(): ResearchDepth {
  const value = localStorage.getItem(DEFAULT_DEPTH_KEY);
  return value === 'quick' || value === 'deep' ? value : 'standard';
}

export function writeDefaultDepth(depth: ResearchDepth): void {
  localStorage.setItem(DEFAULT_DEPTH_KEY, depth);
}

/**
 * Workspace appearance. Light is the default: the page ships light-first
 * and only renders the dark palette when the stored preference says so.
 */
export type AgentTheme = 'light' | 'dark';

const THEME_KEY = 'zyro-research-theme';

export function readAgentTheme(): AgentTheme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function writeAgentTheme(theme: AgentTheme): void {
  localStorage.setItem(THEME_KEY, theme);
}

/** "Restore defaults" — forget every locally stored preference. */
export function clearPreferences(): void {
  localStorage.removeItem(DEFAULT_MODE_KEY);
  localStorage.removeItem(START_TEMPORARY_KEY);
  localStorage.removeItem(DEFAULT_DEPTH_KEY);
  localStorage.removeItem(THEME_KEY);
}
