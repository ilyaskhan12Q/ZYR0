import { streamChat } from '@/agent/api/gateway';
import type { CitationLedgerEntry, SubTaskContract } from '@/agent/research/types';

const SYSTEM_PROMPT = `You are the Editorial Agent of a deep-research system. You write the final research report.

Style rules:
- Objective, publication-grade tone. No marketing language, no hype.
- Banned AI clichés (never use): "delve", "in today's fast-paced world", "unlock", "landscape", "game-changer", "it is important to note", "in conclusion,", "furthermore,", "dive into", "robust", "leverage", "seamless", "cutting-edge".
- Ground EVERY factual claim in the citation ledger: append the matching citation key as an inline reference like [1], [2], ... [N].
- You may ONLY reference keys that exist in the ledger. If the ledger does not support a claim, omit the claim.
- Structure the report with a markdown title and exactly four ## sections: Foundations & Baseline, Technical Architecture & Mechanics, Benchmarks & Empirical Data, Constraints, Economics & Outlook.
- End with a "## Sources" section listing every cited source as "- [n] Title — Source (Year)" with the URL.
- Write in full sentences and paragraphs; use short bullet lists only where they genuinely aid clarity.
- Output ONLY the markdown report, no commentary before or after.`;

function buildEditorialPrompt(
  topic: string,
  contracts: SubTaskContract[],
  ledger: CitationLedgerEntry[],
): string {
  const outline = contracts
    .map((c) => `- Dimension "${c.dimension}" — ${c.focusArea}: ${c.coreObjective}`)
    .join('\n');

  const sources = ledger
    .map(
      (entry) =>
        `[${entry.key}] ${entry.title} — ${entry.sourceName}${entry.year ? ` (${entry.year})` : ''} — ${entry.url}`,
    )
    .join('\n');

  return `Topic: "${topic}"

Research outline:
${outline}

Verified citation ledger (assign keys already fixed — keep them as-is):
${sources}

Write the report now.`;
}

export interface EditorialResult {
  markdown: string;
  model: string;
  error?: string;
}

export async function synthesizeReport(
  topic: string,
  contracts: SubTaskContract[],
  ledger: CitationLedgerEntry[],
  onDelta?: (text: string) => void,
): Promise<EditorialResult> {
  let text = '';
  let model = '';

  const result = await streamChat([{ role: 'user', content: buildEditorialPrompt(topic, contracts, ledger) }], {
    system: SYSTEM_PROMPT,
    onEvent: (event) => {
      if (event.type === 'delta') {
        text += event.text;
        onDelta?.(event.text);
      } else if (event.type === 'usage') {
        model = event.model;
      }
    },
  });

  if (!result.ok) return { markdown: text, model, error: result.error ?? 'Editorial request failed' };
  return { markdown: text, model };
}