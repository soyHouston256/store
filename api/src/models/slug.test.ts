import { describe, expect, it } from 'vitest';
import { SLUG_MAX_LENGTH, SLUG_PATTERN, ensureUniqueSlug, slugify } from './slug.js';

describe('slugify (R4.1)', () => {
  it('lowercases and turns punctuation runs into single hyphens', () => {
    expect(slugify('Polo Node.js')).toBe('polo-node-js');
    expect(slugify('Spring Boot')).toBe('spring-boot');
    expect(slugify('  Hacker   Rank  ')).toBe('hacker-rank');
  });

  it('strips diacritics', () => {
    expect(slugify('Camión Ñandú')).toBe('camion-nandu');
    expect(slugify('Café con leche')).toBe('cafe-con-leche');
  });

  it('trims leading/trailing hyphens and returns "" for non-slug-able input', () => {
    expect(slugify('--Redis--')).toBe('redis');
    expect(slugify('???')).toBe('');
  });

  it('caps at 80 chars without a dangling hyphen and matches the persisted pattern', () => {
    const long = slugify(`${'a'.repeat(79)} bcd`);
    expect(long.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(long).toBe('a'.repeat(79));
    expect(long).toMatch(SLUG_PATTERN);
    expect(slugify('x'.repeat(200))).toHaveLength(SLUG_MAX_LENGTH);
  });
});

describe('ensureUniqueSlug (R4.4 collision)', () => {
  it('returns the base when free and registers it as taken', () => {
    const taken = new Set<string>();
    expect(ensureUniqueSlug('polo-react', taken)).toBe('polo-react');
    expect(taken.has('polo-react')).toBe(true);
  });

  it('appends -2, -3… for collisions', () => {
    const taken = new Set(['polo-react']);
    expect(ensureUniqueSlug('polo-react', taken)).toBe('polo-react-2');
    expect(ensureUniqueSlug('polo-react', taken)).toBe('polo-react-3');
    expect([...taken].sort()).toEqual(['polo-react', 'polo-react-2', 'polo-react-3']);
  });

  it('falls back to "producto" for an empty base', () => {
    const taken = new Set<string>();
    expect(ensureUniqueSlug('', taken)).toBe('producto');
    expect(ensureUniqueSlug('', taken)).toBe('producto-2');
  });

  it('keeps suffixed slugs within the max length', () => {
    const base = 'b'.repeat(SLUG_MAX_LENGTH);
    const taken = new Set([base]);
    const next = ensureUniqueSlug(base, taken);
    expect(next.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(next.endsWith('-2')).toBe(true);
    expect(next).toMatch(SLUG_PATTERN);
  });
});
