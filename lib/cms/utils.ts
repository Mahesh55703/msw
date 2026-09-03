/**
 * Resolves CMS content fallbacks with strict semantics.
 * 
 * Behavior:
 * - Valid string -> Returns the CMS string
 * - undefined / null -> Returns the fallback string
 * - "" (empty string) -> Returns "" (respects intentional deletion)
 * - "   " (whitespace-only) -> Returns "" (respects intentional deletion)
 * - Invalid type -> Returns the fallback string
 */
export function resolveCmsText(cmsValue: string | null | undefined, fallback: string): string {
  if (cmsValue === undefined || cmsValue === null) {
    return fallback;
  }
  
  if (typeof cmsValue !== 'string') {
    return fallback;
  }

  // Treat pure whitespace or empty strings as intentional deletion
  if (cmsValue.trim() === '') {
    return '';
  }

  return cmsValue;
}
