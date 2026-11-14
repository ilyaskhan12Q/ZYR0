/** "Agents - 71" becomes label/value; hyphens inside words ("OpenAI-compatible") stay intact. */
export function splitCapability(capability: string): [string, string?] {
  const match = capability.match(/^(.+?)\s+-\s+(.+)$/);
  return match ? [match[1].trim(), match[2].trim()] : [capability.trim()];
}
