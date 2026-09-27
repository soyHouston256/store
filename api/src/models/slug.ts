/**
 * Product slug helpers (spec R4.1, design §7.1, conciliación C8).
 *
 * The same algorithm is mirrored in `backoffice/src/api/slug.ts` (and the
 * storefront's `src/data/slug.ts`) so client-side previews match what the
 * API persists. Keep the three in sync.
 */

/** Allowed persisted shape: lowercase words joined by single hyphens (C8). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/** Base used when a name has no slug-able characters at all (e.g. "???"). */
const FALLBACK_BASE = 'producto';

/**
 * "Polo Node.js" → "polo-node-js". NFD + strip diacritics, lowercase,
 * any run of non `[a-z0-9]` → `-`, trim hyphens, cap at 80 chars (never
 * ending in a dangling hyphen after the cut).
 */
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

/**
 * Returns `base` if free, otherwise `base-2`, `base-3`, … — the first suffix
 * not present in `taken`. The chosen slug is added to `taken`, so callers
 * can resolve a whole batch with one shared set (seed / migration).
 * An empty base falls back to "producto".
 */
export function ensureUniqueSlug(base: string, taken: Set<string>): string {
  const root = base || FALLBACK_BASE;
  let candidate = root;
  for (let n = 2; taken.has(candidate); n += 1) {
    const suffix = `-${n}`;
    // Keep the suffixed slug within the max length too.
    const head = root.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/g, '');
    candidate = `${head}${suffix}`;
  }
  taken.add(candidate);
  return candidate;
}
