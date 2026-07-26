export function locateExactEvidence(sourceText: string | null | undefined, excerpt: string | null | undefined) {
  const normalizedExcerpt = excerpt?.trim();
  if (!sourceText || !normalizedExcerpt) return null;
  const start = sourceText.toLocaleLowerCase().indexOf(normalizedExcerpt.toLocaleLowerCase());
  return start < 0 ? null : { excerpt: normalizedExcerpt, start, end: start + normalizedExcerpt.length };
}
