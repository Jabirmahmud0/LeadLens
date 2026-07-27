export const DEFAULT_MAX_PROMPT_CHARS = 12_000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 2_048;

/** Prevent arbitrary website content from creating an unbounded provider request. */
export function fitPromptToBudget(prompt: string, maxChars = DEFAULT_MAX_PROMPT_CHARS): string {
  if (prompt.length <= maxChars) return prompt;
  const marker = '\n\n[...additional source material omitted to stay within the model budget...]\n\n';
  const available = Math.max(0, maxChars - marker.length);
  const headLength = Math.floor(available * 0.72);
  return `${prompt.slice(0, headLength)}${marker}${prompt.slice(-(available - headLength))}`;
}
