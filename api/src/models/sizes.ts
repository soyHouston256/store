import type { Cut } from './Product.js';

/**
 * Global size table per cut (spec R4.1 / handoff spec 04). Polos no longer
 * carry their own `sizes`: the storefront lists `SIZES_BY_CUT[cut]`.
 * Source of truth: `docs/devhaus-handoff/specs/data/tallas.json`
 * (gitignored designer package; `sizes.test.ts` asserts this copy against an
 * inline table vendored from it, so CI never reads the handoff).
 */
export const SIZES_BY_CUT: Readonly<Record<Cut, readonly string[]>> = {
  hombre: ['S', 'M', 'L', 'XL', 'XXL'],
  mujer: ['XS', 'S', 'M', 'L', 'XL'],
};

export function sizesFor(cut: Cut): string[] {
  return [...SIZES_BY_CUT[cut]];
}
