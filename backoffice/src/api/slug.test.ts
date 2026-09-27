import { describe, expect, it } from 'vitest';
import { SLUG_MAX_LENGTH, isValidSlug, slugify } from './slug';

describe('slugify (mirror of api/src/models/slug.ts)', () => {
  it('matches the API algorithm on representative names', () => {
    expect(slugify('Polo Node.js')).toBe('polo-node-js');
    expect(slugify('Spring Boot')).toBe('spring-boot');
    expect(slugify('Camión Ñandú')).toBe('camion-nandu');
    expect(slugify('--Redis--')).toBe('redis');
    expect(slugify('???')).toBe('');
    expect(slugify('x'.repeat(200))).toHaveLength(SLUG_MAX_LENGTH);
  });

  it('isValidSlug mirrors the API regex and length cap', () => {
    expect(isValidSlug('polo-react')).toBe(true);
    expect(isValidSlug('polo-react-2')).toBe(true);
    for (const bad of ['Polo React', 'polo_react', '-polo', 'polo--react', 'ñandu', '', 'a'.repeat(81)]) {
      expect(isValidSlug(bad)).toBe(false);
    }
  });
});
