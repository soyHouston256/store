import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CUTS } from './Product.js';
import { SIZES_BY_CUT, sizesFor } from './sizes.js';

interface TallasJson {
  hombre: { tallas: Array<{ talla: string }> };
  mujer: { tallas: Array<{ talla: string }> };
}

const TALLAS_JSON = fileURLToPath(
  new URL('../../../docs/devhaus-handoff/specs/data/tallas.json', import.meta.url),
);

describe('SIZES_BY_CUT (R4.1 / spec 04)', () => {
  it('matches docs/devhaus-handoff/specs/data/tallas.json exactly', async () => {
    const json = JSON.parse(await readFile(TALLAS_JSON, 'utf8')) as TallasJson;
    expect(SIZES_BY_CUT.hombre).toEqual(json.hombre.tallas.map((t) => t.talla));
    expect(SIZES_BY_CUT.mujer).toEqual(json.mujer.tallas.map((t) => t.talla));
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
