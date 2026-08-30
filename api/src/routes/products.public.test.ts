import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { Product } from '../models/Product.js';
import { useTestDb } from '../test/db.js';

useTestDb();
const app = createApp();

async function seed() {
  await Product.create([
    {
      _id: '0utzWxB9wGfCW1G7P9JI', // Firestore-era string id
      name: 'Bravo Polo',
      price: 25,
      type: 'polo',
      colors: ['#fff', '#000'],
      sizes: ['S', 'M'],
      likes: 5,
      published: true,
    },
    { _id: 'p-alpha', name: 'Alpha Mug', price: 12, type: 'taza', likes: 0, published: true },
    { _id: 'p-draft', name: 'Draft Pad', price: 9, type: 'mousepad', likes: 3, published: false },
  ]);
}

describe('GET /api/products (R1.1)', () => {
  it('returns only published products, sorted by name', async () => {
    await seed();
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((p: { name: string }) => p.name)).toEqual(['Alpha Mug', 'Bravo Polo']);
    expect(res.body.every((p: { published: boolean }) => p.published === true)).toBe(true);
    const polo = res.body[1];
    expect(polo).toMatchObject({
      id: '0utzWxB9wGfCW1G7P9JI',
      name: 'Bravo Polo',
      price: 25,
      type: 'polo',
      colors: ['#fff', '#000'],
      sizes: ['S', 'M'],
      likes: 5,
    });
  });

  it('legacy doc without type is served with type "polo" (R1.4)', async () => {
    // Raw insert bypassing mongoose, mimicking a pre-migration document.
    await Product.collection.insertOne({
      _id: 'legacy-1' as unknown as never,
      name: 'Legacy Shirt',
      price: 20,
      published: true,
      likes: 2,
    });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    const legacy = res.body.find((p: { id: string }) => p.id === 'legacy-1');
    expect(legacy.type).toBe('polo');
    expect(legacy.colors).toEqual([]);
    expect(legacy.sizes).toEqual([]);
    expect(legacy.logoPositions).toEqual(['pocket', 'chest', 'back', 'front-back']);
  });
});

describe('GET /api/products/:id (R1.2)', () => {
  it('returns a published product by its Firestore-era string id', async () => {
    await seed();
    const res = await request(app).get('/api/products/0utzWxB9wGfCW1G7P9JI');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('0utzWxB9wGfCW1G7P9JI');
  });

  it('returns 404 for unknown ids', async () => {
    await seed();
    const res = await request(app).get('/api/products/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('unpublished is indistinguishable from missing (404)', async () => {
    await seed();
    const res = await request(app).get('/api/products/p-draft');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/products/:id/like (R1.3)', () => {
  it('increments likes and returns the new count', async () => {
    await seed();
    const res = await request(app).post('/api/products/0utzWxB9wGfCW1G7P9JI/like').send({ delta: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '0utzWxB9wGfCW1G7P9JI', likes: 6 });
  });

  it('two racing likes both land ($inc is atomic): 5 -> 7', async () => {
    await seed();
    const [a, b] = await Promise.all([
      request(app).post('/api/products/0utzWxB9wGfCW1G7P9JI/like').send({ delta: 1 }),
      request(app).post('/api/products/0utzWxB9wGfCW1G7P9JI/like').send({ delta: 1 }),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    const doc = await Product.findById('0utzWxB9wGfCW1G7P9JI');
    expect(doc?.likes).toBe(7);
  });

  it('unlike decrements', async () => {
    await seed();
    const res = await request(app).post('/api/products/0utzWxB9wGfCW1G7P9JI/like').send({ delta: -1 });
    expect(res.status).toBe(200);
    expect(res.body.likes).toBe(4);
  });

  it('unlike floors at 0 and never goes negative', async () => {
    await seed();
    const res = await request(app).post('/api/products/p-alpha/like').send({ delta: -1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'p-alpha', likes: 0 });
    const doc = await Product.findById('p-alpha');
    expect(doc?.likes).toBe(0);
  });

  it('racing unlikes on likes=1 floor at 0', async () => {
    await seed();
    await Product.updateOne({ _id: 'p-alpha' }, { $set: { likes: 1 } });
    const results = await Promise.all([
      request(app).post('/api/products/p-alpha/like').send({ delta: -1 }),
      request(app).post('/api/products/p-alpha/like').send({ delta: -1 }),
      request(app).post('/api/products/p-alpha/like').send({ delta: -1 }),
    ]);
    for (const res of results) expect(res.status).toBe(200);
    const doc = await Product.findById('p-alpha');
    expect(doc?.likes).toBe(0);
  });

  it('404 for unknown product', async () => {
    const res = await request(app).post('/api/products/nope/like').send({ delta: 1 });
    expect(res.status).toBe(404);
  });

  it('404 for unpublished product (hidden from public)', async () => {
    await seed();
    const res = await request(app).post('/api/products/p-draft/like').send({ delta: 1 });
    expect(res.status).toBe(404);
  });

  it('rejects deltas other than ±1 with 400 VALIDATION', async () => {
    await seed();
    for (const delta of [0, 2, -3, 'up', null]) {
      const res = await request(app).post('/api/products/p-alpha/like').send({ delta });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    }
  });
});
