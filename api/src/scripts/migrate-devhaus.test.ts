import { describe, expect, it } from 'vitest';
import { Product } from '../models/Product.js';
import { useTestDb } from '../test/db.js';
import { SLUG_INDEX_NAME, migrateDevhaus, rollbackDevhaus } from './migrate-devhaus.js';

useTestDb();

/** Raw pre-phase-4 documents: no cuts / slug / soldOut, Firestore-era ids. */
async function seedLegacy() {
  const now = new Date();
  await Product.collection.insertMany([
    { _id: '0utzWxB9wGfCW1G7P9JI', name: 'Redis', price: 60, type: 'polo', published: true, createdAt: now },
    { _id: 'react-a', name: 'Polo React', price: 60, type: 'polo', published: true, createdAt: new Date(now.getTime() - 2000) },
    { _id: 'react-b', name: 'Polo React', price: 60, type: 'polo', published: true, createdAt: new Date(now.getTime() - 1000) },
    { _id: 'taza-1', name: 'Taza React', price: 35, type: 'taza', published: true, createdAt: now },
    { _id: 'pad-1', name: 'Mousepad Python', price: 25, type: 'mousepad', published: false, createdAt: now },
    { _id: 'legacy-notype', name: 'Legacy Shirt', price: 20, published: true },
  ] as never[]);
}

async function slugIndex() {
  const indexes = await Product.collection.indexes();
  return indexes.find((index) => index.name === SLUG_INDEX_NAME);
}

describe('migrateDevhaus (R4.4)', () => {
  it('backfills cuts per type, soldOut=false and unique slugs, then builds the index', async () => {
    await seedLegacy();
    const result = await migrateDevhaus();
    expect(result).toEqual({ cutsSet: 6, soldOutSet: 6, slugsSet: 6 });

    const docs = await Product.collection.find({}).toArray();
    const byId = Object.fromEntries(docs.map((doc) => [String(doc._id), doc]));

    expect(byId['0utzWxB9wGfCW1G7P9JI']).toMatchObject({ cuts: ['hombre'], soldOut: false, slug: 'redis' });
    expect(byId['taza-1']).toMatchObject({ cuts: [], soldOut: false, slug: 'taza-react' });
    expect(byId['pad-1']).toMatchObject({ cuts: [], soldOut: false, slug: 'mousepad-python' });
    // A row without `type` is a legacy polo.
    expect(byId['legacy-notype']).toMatchObject({ cuts: ['hombre'], slug: 'legacy-shirt' });
    // Firestore-era string ids are preserved.
    expect(typeof byId['0utzWxB9wGfCW1G7P9JI']?._id).toBe('string');

    const index = await slugIndex();
    expect(index).toBeDefined();
    expect(index?.unique).toBe(true);
    expect(index?.partialFilterExpression).toEqual({ slug: { $type: 'string' } });
  });

  it('resolves "Polo React" twice as polo-react / polo-react-2 in createdAt order', async () => {
    await seedLegacy();
    await migrateDevhaus();
    expect((await Product.collection.findOne({ _id: 'react-a' as never }))?.slug).toBe('polo-react');
    expect((await Product.collection.findOne({ _id: 'react-b' as never }))?.slug).toBe('polo-react-2');
  });

  it('is idempotent: a second run modifies nothing and does not fail on the index', async () => {
    await seedLegacy();
    await migrateDevhaus();
    const before = await Product.collection.find({}).sort({ _id: 1 }).toArray();

    const second = await migrateDevhaus();
    expect(second).toEqual({ cutsSet: 0, soldOutSet: 0, slugsSet: 0 });

    const after = await Product.collection.find({}).sort({ _id: 1 }).toArray();
    expect(after).toEqual(before);
    expect(await slugIndex()).toBeDefined();
  });

  it('respects slugs that already exist (suffixes new ones around them)', async () => {
    await Product.collection.insertMany([
      { _id: 'has-slug', name: 'Docker', type: 'polo', price: 60, slug: 'polo-docker', cuts: ['hombre', 'mujer'], soldOut: true },
      { _id: 'no-slug', name: 'Polo Docker', type: 'polo', price: 60 },
    ] as never[]);
    const result = await migrateDevhaus();
    expect(result).toEqual({ cutsSet: 1, soldOutSet: 1, slugsSet: 1 });
    // Existing values are never overwritten.
    expect(await Product.collection.findOne({ _id: 'has-slug' as never })).toMatchObject({
      slug: 'polo-docker',
      cuts: ['hombre', 'mujer'],
      soldOut: true,
    });
    expect((await Product.collection.findOne({ _id: 'no-slug' as never }))?.slug).toBe('polo-docker-2');
  });

  it('the index rejects a duplicate slug but tolerates rows without one', async () => {
    await seedLegacy();
    await migrateDevhaus();
    await expect(
      Product.collection.insertOne({ _id: 'dup', name: 'Dup', type: 'polo', price: 1, slug: 'redis' } as never),
    ).rejects.toMatchObject({ code: 11000 });
    await expect(
      Product.collection.insertMany([
        { _id: 'nos-1', name: 'A', type: 'polo', price: 1 },
        { _id: 'nos-2', name: 'B', type: 'polo', price: 1 },
      ] as never[]),
    ).resolves.toBeDefined();
  });

  it('rollbackDevhaus unsets the three fields and drops the index; running it twice is safe', async () => {
    await seedLegacy();
    await migrateDevhaus();

    const rollback = await rollbackDevhaus();
    expect(rollback).toEqual({ unset: 6, indexDropped: true });
    const docs = await Product.collection.find({}).toArray();
    for (const doc of docs) {
      expect(doc).not.toHaveProperty('cuts');
      expect(doc).not.toHaveProperty('slug');
      expect(doc).not.toHaveProperty('soldOut');
    }
    expect(await slugIndex()).toBeUndefined();

    expect(await rollbackDevhaus()).toEqual({ unset: 0, indexDropped: false });

    // Forward again restores everything (index included).
    expect(await migrateDevhaus()).toEqual({ cutsSet: 6, soldOutSet: 6, slugsSet: 6 });
    expect(await slugIndex()).toBeDefined();
  });
});
