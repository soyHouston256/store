import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { LOGO_POSITIONS, Product } from '../models/Product.js';
import { useTestDb } from '../test/db.js';
import { adminToken, badSignatureToken, expiredToken } from '../test/auth.js';

useTestDb();
const app = createApp();

const auth = () => ({ Authorization: `Bearer ${adminToken()}` });

async function seed() {
  await Product.create([
    { _id: 'p-live', name: 'Live Polo', price: 25, type: 'polo', likes: 5, published: true },
    { _id: 'p-draft', name: 'Draft Mug', price: 9, type: 'taza', likes: 0, published: false },
  ]);
}

describe('admin auth guard — full 401 matrix (R2.2)', () => {
  const routes = [
    { method: 'get', path: '/api/admin/products' },
    { method: 'get', path: '/api/admin/products/p-live' },
    { method: 'post', path: '/api/admin/products' },
    { method: 'put', path: '/api/admin/products/p-live' },
    { method: 'delete', path: '/api/admin/products/p-live' },
    { method: 'patch', path: '/api/admin/products/p-live/publish' },
    { method: 'post', path: '/api/admin/products/p-live/logo' },
  ] as const;

  const variants: Array<[string, Record<string, string>]> = [
    ['missing header', {}],
    ['malformed header (not Bearer)', { Authorization: 'Basic YWRtaW46eA==' }],
    ['garbage token', { Authorization: 'Bearer not.a.jwt' }],
    ['expired token', { Authorization: `Bearer ${expiredToken()}` }],
    ['bad signature', { Authorization: `Bearer ${badSignatureToken()}` }],
  ];

  for (const { method, path } of routes) {
    for (const [label, headers] of variants) {
      it(`${method.toUpperCase()} ${path} with ${label} → 401`, async () => {
        const res = await request(app)[method](path).set(headers);
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      });
    }
  }

  it('expired JWT on PATCH publish leaves the product unchanged (R2.2 scenario)', async () => {
    await seed();
    const res = await request(app)
      .patch('/api/admin/products/p-live/publish')
      .set('Authorization', `Bearer ${expiredToken()}`)
      .send({ published: false });
    expect(res.status).toBe(401);
    const doc = await Product.findById('p-live');
    expect(doc?.published).toBe(true);
  });
});

describe('GET /api/admin/products', () => {
  it('lists ALL products, unpublished included', async () => {
    await seed();
    const res = await request(app).get('/api/admin/products').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((p: { id: string }) => p.id).sort()).toEqual(['p-draft', 'p-live']);
  });

  it('GET one returns unpublished products too; unknown → 404', async () => {
    await seed();
    const draft = await request(app).get('/api/admin/products/p-draft').set(auth());
    expect(draft.status).toBe(200);
    expect(draft.body.published).toBe(false);

    const missing = await request(app).get('/api/admin/products/nope').set(auth());
    expect(missing.status).toBe(404);
  });
});

describe('POST /api/admin/products (R3.1)', () => {
  it('creates a draft with server-generated UUID, likes 0, published false', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ name: 'New Mug', price: 15, type: 'taza', colors: ['#ff0000'] });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(res.body).toMatchObject({
      name: 'New Mug',
      price: 15,
      type: 'taza',
      colors: ['#ff0000'],
      sizes: [],
      logoPositions: [],
      likes: 0,
      published: false,
    });
    // Draft never leaks to the public list (R1.1).
    const publicList = await request(app).get('/api/products');
    expect(publicList.body).toHaveLength(0);
  });

  it('type "shirt" → 400 naming `type` (R3.1 scenario)', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ name: 'Shirt', price: 10, type: 'shirt' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('type');
  });

  it('missing name/price and bad color format → 400 naming each field', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ type: 'polo', colors: ['red'] });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('name');
    expect(fields).toContain('price');
    expect(fields).toContain('colors.0');
  });

  it('client-sent likes/published/logo are stripped, defaults win', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ name: 'Sneaky', price: 5, type: 'polo', likes: 999, published: true, logo: '/uploads/evil.svg' });
    expect(res.status).toBe(201);
    expect(res.body.likes).toBe(0);
    expect(res.body.published).toBe(false);
    expect(res.body.logo).toBeUndefined();
  });

  it('stores configurable logo positions for polos and defaults missing positions to every option', async () => {
    const custom = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({
        name: 'Configurable Polo',
        price: 60,
        type: 'polo',
        colors: ['#fff'],
        sizes: ['M'],
        logoPositions: ['pocket', 'back'],
      });
    expect(custom.status).toBe(201);
    expect(custom.body.logoPositions).toEqual(['pocket', 'back']);

    const defaulted = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ name: 'Default Polo', price: 60, type: 'polo' });
    expect(defaulted.status).toBe(201);
    expect(defaulted.body.logoPositions).toEqual([...LOGO_POSITIONS]);
  });

  it('rejects a polo when the admin explicitly disables every logo position', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set(auth())
      .send({ name: 'Empty Polo', price: 60, type: 'polo', logoPositions: [] });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('logoPositions');
  });
});

describe('PUT /api/admin/products/:id (R3.2)', () => {
  it('updates writable fields, returns the updated DTO', async () => {
    await seed();
    const res = await request(app)
      .put('/api/admin/products/p-draft')
      .set(auth())
      .send({ name: 'Renamed Mug', price: 11, type: 'mousepad', colors: ['#000'], sizes: [] });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'p-draft', name: 'Renamed Mug', price: 11, type: 'mousepad' });
  });

  it('never touches likes, logo or published — even when sent in the body', async () => {
    await seed();
    await Product.updateOne({ _id: 'p-live' }, { $set: { logo: '/uploads/keep.png' } });
    const res = await request(app)
      .put('/api/admin/products/p-live')
      .set(auth())
      .send({ name: 'Live Polo v2', price: 30, type: 'polo', likes: 999, logo: '/uploads/evil.svg', published: false });
    expect(res.status).toBe(200);
    const doc = await Product.findById('p-live');
    expect(doc?.name).toBe('Live Polo v2');
    expect(doc?.likes).toBe(5); // untouched
    expect(doc?.logo).toBe('/uploads/keep.png'); // untouched
    expect(doc?.published).toBe(true); // untouched
  });

  it('unknown id → 404; invalid body → 400', async () => {
    const missing = await request(app)
      .put('/api/admin/products/nope')
      .set(auth())
      .send({ name: 'X', price: 1, type: 'polo' });
    expect(missing.status).toBe(404);

    await seed();
    const invalid = await request(app)
      .put('/api/admin/products/p-live')
      .set(auth())
      .send({ name: '', price: -2, type: 'polo' });
    expect(invalid.status).toBe(400);
    const fields = invalid.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('name');
    expect(fields).toContain('price');
  });
});

describe('DELETE /api/admin/products/:id (R3.3)', () => {
  it('deletes with 204; a second delete → 404', async () => {
    await seed();
    const first = await request(app).delete('/api/admin/products/p-live').set(auth());
    expect(first.status).toBe(204);
    const second = await request(app).delete('/api/admin/products/p-live').set(auth());
    expect(second.status).toBe(404);
    expect(await Product.findById('p-live')).toBeNull();
  });
});

describe('PATCH /api/admin/products/:id/publish (R3.4)', () => {
  it('publish shows the product on the public list; unpublish hides it and 404s GET by id', async () => {
    await seed();

    const publish = await request(app)
      .patch('/api/admin/products/p-draft/publish')
      .set(auth())
      .send({ published: true });
    expect(publish.status).toBe(200);
    expect(publish.body.published).toBe(true);

    let publicList = await request(app).get('/api/products');
    expect(publicList.body.map((p: { id: string }) => p.id)).toContain('p-draft');

    const unpublish = await request(app)
      .patch('/api/admin/products/p-draft/publish')
      .set(auth())
      .send({ published: false });
    expect(unpublish.status).toBe(200);
    expect(unpublish.body.published).toBe(false);

    publicList = await request(app).get('/api/products');
    expect(publicList.body.map((p: { id: string }) => p.id)).not.toContain('p-draft');
    const publicOne = await request(app).get('/api/products/p-draft');
    expect(publicOne.status).toBe(404);
  });

  it('non-boolean body → 400; unknown id → 404', async () => {
    await seed();
    const bad = await request(app)
      .patch('/api/admin/products/p-live/publish')
      .set(auth())
      .send({ published: 'yes' });
    expect(bad.status).toBe(400);

    const missing = await request(app)
      .patch('/api/admin/products/nope/publish')
      .set(auth())
      .send({ published: true });
    expect(missing.status).toBe(404);
  });
});
