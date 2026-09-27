import { describe, expect, it } from 'vitest';
import { CUTS } from './Product.js';
import { SIZES_BY_CUT, sizesFor } from './sizes.js';

/**
 * Expected table vendored from the designer handoff
 * (`docs/devhaus-handoff/specs/data/tallas.json`, gitignored — not available
 * in CI). Each `tallas[].talla` in order; measurements (`anchoPechoCm`,
 * `largoCm`) are `null` in the handoff and intentionally not modelled here.
 * If the handoff changes, update this table and `SIZES_BY_CUT` together.
 */
const EXPECTED_TALLAS = {
  hombre: ['S', 'M', 'L', 'XL', 'XXL'],
  mujer: ['XS', 'S', 'M', 'L', 'XL'],
} as const;

describe('SIZES_BY_CUT (R4.1 / spec 04)', () => {
  it('matches the handoff tallas.json size table exactly (vendored inline)', () => {
    expect(SIZES_BY_CUT.hombre).toEqual([...EXPECTED_TALLAS.hombre]);
    expect(SIZES_BY_CUT.mujer).toEqual([...EXPECTED_TALLAS.mujer]);
    expect(Object.keys(SIZES_BY_CUT).sort()).toEqual(Object.keys(EXPECTED_TALLAS).sort());
  });

  it('covers every cut and sizesFor returns a fresh copy', () => {
    for (const cut of CUTS) {
      expect(SIZES_BY_CUT[cut].length).toBeGreaterThan(0);
      const copy = sizesFor(cut);
      expect(copy).toEqual([...SIZES_BY_CUT[cut]]);
      expect(copy).not.toBe(SIZES_BY_CUT[cut]);
    }
    expect(sizesFor('hombre')).toEqual(['S', 'M', 'L', 'XL', 'XXL']);
    expect(sizesFor('mujer')).toEqual(['XS', 'S', 'M', 'L', 'XL']);
  });
});
