import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Product } from '../models/Product.js';
import { useTestDb } from '../test/db.js';
import { defaultSeedFile, seedProducts, type SeedProduct } from './seed-products.js';

useTestDb();

const items: SeedProduct[] = [
  { id: 'seed-1', name: 'Redis', price: 60, colors: ['#FFF', '#000'], sizes: ['S', 'M'], likes: 2, image: 'https://example.com/redis.png' },
  { id: 'seed-2', name: 'Firebase', price: 60 },
];

describe('seed-products (NFR-5 idempotency)', () => {
  it('inserts missing products with defaults type polo and published true', async () => {
    const result = await seedProducts(items);
    expect(result).toEqual({ inserted: 2, skippedExisting: 0 });

    const redis = await Product.findById('seed-1');
    expect(redis).toMatchObject({
      name: 'Redis',
      price: 60,
      type: 'polo',
      published: true,
      likes: 2,
      colors: ['#FFF', '#000'],
      sizes: ['S', 'M'],
      logoPositions: ['pocket', 'chest', 'back', 'front-back'],
    });
    const firebase = await Product.findById('seed-2');
    expect(firebase).toMatchObject({
      type: 'polo',
      published: true,
      likes: 0,
      colors: [],
      sizes: [],
      logoPositions: ['pocket', 'chest', 'back', 'front-back'],
    });
  });

  it('re-running does not duplicate products', async () => {
    await seedProducts(items);
    const second = await seedProducts(items);
    expect(second).toEqual({ inserted: 0, skippedExisting: 2 });
    expect(await Product.countDocuments()).toBe(2);
  });

  it('admin edits survive a re-seed ($setOnInsert never overwrites)', async () => {
    await seedProducts(items);
    await Product.updateOne(
      { _id: 'seed-1' },
      { $set: { name: 'Redis Renamed', price: 99, published: false, logo: '/uploads/seed-1-1.png', likes: 42 } },
    );

    await seedProducts(items);

    const doc = await Product.findById('seed-1');
    expect(doc).toMatchObject({
      name: 'Redis Renamed',
      price: 99,
      published: false,
      logo: '/uploads/seed-1-1.png',
      likes: 42,
    });
    expect(await Product.countDocuments()).toBe(2);
  });

  it('items added to the seed file later are inserted on re-run without touching the rest', async () => {
    await seedProducts(items);
    await Product.updateOne({ _id: 'seed-2' }, { $set: { price: 1 } });

    const grown: SeedProduct[] = [...items, { id: 'seed-3', name: 'Taza React', price: 35, type: 'taza' }];
    const result = await seedProducts(grown);
    expect(result).toEqual({ inserted: 1, skippedExisting: 2 });
    expect((await Product.findById('seed-2'))?.price).toBe(1);
    expect(await Product.findById('seed-3')).toMatchObject({ type: 'taza', published: true, sizes: [], logoPositions: [] });
  });

  it('the real repo-root products.json parses and seeds cleanly', async () => {
    const raw = JSON.parse(await readFile(defaultSeedFile(), 'utf8')) as SeedProduct[];
    expect(raw.length).toBeGreaterThan(0);
    const result = await seedProducts(raw);
    expect(result.inserted).toBe(raw.length);
    expect(await Product.countDocuments({ published: true })).toBe(raw.length);

    const expectedTypeCounts = raw.reduce<Record<string, number>>((counts, item) => {
      const type = item.type ?? 'polo';
      counts[type] = (counts[type] ?? 0) + 1;
      return counts;
    }, {});
    for (const [type, count] of Object.entries(expectedTypeCounts)) {
      expect(await Product.countDocuments({ published: true, type })).toBe(count);
    }
  });
});
