/**
 * Client-side mirror of `api/src/models/slug.ts` (same algorithm) so the
 * form can preview / prefill the slug the API would generate. The API is
 * still the authority (uniqueness, 409 on collision).
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/** "Polo Node.js" → "polo-node-js" (NFD, no diacritics, `[^a-z0-9]+` → `-`, trimmed, ≤ 80). */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= SLUG_MAX_LENGTH) return slug;
  return slug.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, '');
}

export function isValidSlug(value: string): boolean {
  return value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
}
