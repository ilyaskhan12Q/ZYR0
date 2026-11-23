import type { ToolItem } from '@/data/tools';
import { splitCapability } from './capability';

/**
 * Dynamically synthesizes a ready-to-run prompt for AI agents (Claude, Gemini, Cursor, ChatGPT, Antigravity)
 * based on verified tool metadata when the author hasn't provided a manual prompt.
 */
export function generateMagicPrompt(tool: ToolItem): string {
  const isSkill = tool.item_type === 'skill';
  const isHybrid = tool.item_type === 'tool_skill';
  const kind = isSkill ? 'agent skill' : isHybrid ? 'tool and agent skill' : 'developer tool';

  const lines: string[] = [
    `You are an expert AI assistant. I want to use and integrate the following ${kind}: "${tool.name}".`,
    '',
    `Overview:`,
    `${tool.tagline}`,
  ];

  // Installation or Invocation Commands
  const commands =
    tool.installCommands && tool.installCommands.length > 0
      ? tool.installCommands
      : tool.installCommand
      ? [{ label: isSkill ? 'Invocation' : 'Installation', command: tool.installCommand }]
      : [];

  if (commands.length > 0) {
    lines.push('');
    lines.push(isSkill ? 'Invocation / Command Pattern:' : 'Setup & Installation Commands:');
    for (const cmd of commands) {
      if (cmd.label) {
        lines.push(`- ${cmd.label}: \`${cmd.command}\``);
      } else {
        lines.push(`- \`${cmd.command}\``);
      }
    }
  }

  if (tool.installInstructions?.trim()) {
    lines.push('');
    lines.push('Setup Notes:');
    lines.push(tool.installInstructions.trim());
  }

  // Key Capabilities
  if (tool.capabilities && tool.capabilities.length > 0) {
    lines.push('');
    lines.push('Core Capabilities & Features:');
    for (const cap of tool.capabilities) {
      const [label, val] = splitCapability(cap);
      lines.push(`- ${label}${val ? `: ${val}` : ''}`);
    }
  }

  // Source & Documentation links
  lines.push('');
  lines.push('References:');
  if (tool.sourceUrl) {
    lines.push(`- Source / Repository: ${tool.sourceUrl}`);
  }
  if (tool.documentationUrl) {
    lines.push(`- Official Documentation: ${tool.documentationUrl}`);
  }

  // Actionable instruction for the receiving AI agent
  lines.push('');
  lines.push('Instructions for Agent:');
  if (isSkill) {
    lines.push(
      `1. Review the invocation and setup above to understand how to trigger and execute this skill.`,
      `2. Guide me through invoking it or execute the required workflow directly when applicable.`,
      `3. Ask me for any specific parameters, input files, or targets to proceed.`
    );
  } else {
    lines.push(
      `1. Check if the required environment and dependencies are present based on the setup commands.`,
      `2. Help me run the installation, configure the tool, and integrate it into my project workflow.`,
      `3. Confirm when ready and ask how I would like to utilize "${tool.name}".`
    );
  }

  return lines.join('\n');
}

/**
 * Returns the author's custom magic prompt if available, or generates a deterministic fallback.
 */
export function getEffectiveMagicPrompt(tool: ToolItem): string {
  if (tool.magicPrompt && tool.magicPrompt.trim().length > 0) {
    return tool.magicPrompt.trim();
  }
  return generateMagicPrompt(tool);
}
