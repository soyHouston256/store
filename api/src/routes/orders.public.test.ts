import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { useTestDb } from '../test/db.js';

useTestDb();
const app = createApp();

const USER = { dni: '12345678', name: 'Ada Lovelace', phone: '+51999888777' };

async function seed() {
  await Product.create([
    { _id: 'polo-1', name: 'Polo One', price: 25, type: 'polo', published: true, logo: '/uploads/polo-one.png' },
    { _id: 'taza-1', name: 'Taza One', price: 12.5, type: 'taza', published: true },
    { _id: 'draft-1', name: 'Draft', price: 9, type: 'mousepad', published: false },
  ]);
}

describe('POST /api/orders (R8.1)', () => {
  it('creates an order with server-computed total and 8-char uppercase id', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({
        user: USER,
        items: [
          { productId: 'polo-1', quantity: 2, size: 'M', color: '#fff', logoPosition: 'pecho' },
          { productId: 'taza-1', quantity: 1, color: 'red' },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[A-Z0-9]{8}$/);
    expect(res.body.total).toBe(2 * 25 + 12.5);
    expect(res.body.user).toEqual(USER);
    expect(res.body.items).toEqual([
      {
        productId: 'polo-1',
        name: 'Polo One',
        type: 'polo',
        price: 25,
        quantity: 2,
        size: 'M',
        color: '#fff',
        logoPosition: 'pecho',
      },
      { productId: 'taza-1', name: 'Taza One', type: 'taza', price: 12.5, quantity: 1, color: 'red' },
    ]);

    const stored = await Order.findById(res.body.id);
    expect(stored).not.toBeNull();
    expect(stored?.total).toBe(62.5);
    expect(stored?.createdAt).toBeInstanceOf(Date);
  });

  it('ignores tampered client total/prices — server recomputes from DB', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({
        user: USER,
        total: 0.01, // tampered — stripped by zod
        items: [{ productId: 'polo-1', quantity: 1, price: 0.01 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(25);
    expect(res.body.items[0].price).toBe(25);
  });

  it('snapshots name/type/price from the DB at order time', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({ user: USER, items: [{ productId: 'taza-1', quantity: 3 }] });
    expect(res.status).toBe(201);
    // Later product edits must not affect the stored order.
    await Product.updateOne({ _id: 'taza-1' }, { $set: { price: 999, name: 'Renamed' } });
    const stored = await Order.findById(res.body.id);
    expect(stored?.items[0]?.name).toBe('Taza One');
    expect(stored?.items[0]?.price).toBe(12.5);
    expect(stored?.total).toBe(37.5);
  });

  it('400 on empty items', async () => {
    await seed();
    const res = await request(app).post('/api/orders').send({ user: USER, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'items' })]),
    );
  });

  it('400 on missing user name/phone, naming the fields', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({ user: { dni: '123' }, items: [{ productId: 'polo-1', quantity: 1 }] });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['user.name', 'user.phone']));
  });

  it('400 when an item references an unknown product', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({ user: USER, items: [{ productId: 'ghost', quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(await Order.countDocuments()).toBe(0);
  });

  it('400 when an item references an unpublished product', async () => {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({ user: USER, items: [{ productId: 'draft-1', quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('400 on non-integer or zero quantity', async () => {
    await seed();
    for (const quantity of [0, -1, 1.5]) {
      const res = await request(app)
        .post('/api/orders')
        .send({ user: USER, items: [{ productId: 'polo-1', quantity }] });
      expect(res.status).toBe(400);
    }
  });
});

describe('GET /api/orders/:id/tracking (order-tracking)', () => {
  async function createOrder() {
    await seed();
    const res = await request(app)
      .post('/api/orders')
      .send({
        user: USER,
        items: [
          { productId: 'polo-1', quantity: 2, size: 'M', color: '#fff', logoPosition: 'pecho' },
          { productId: 'taza-1', quantity: 1 },
        ],
      });
    expect(res.status).toBe(201);
    return res.body.id as string;
  }

  it('returns the privacy-limited tracking view, field by field', async () => {
    const id = await createOrder();
    const res = await request(app).get(`/api/orders/${id}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id,
      status: 'pendiente',
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      items: [
        {
          name: 'Polo One',
          type: 'polo',
          quantity: 2,
          size: 'M',
          color: '#fff',
          logoPosition: 'pecho',
          logo: '/uploads/polo-one.png',
        },
        { name: 'Taza One', type: 'taza', quantity: 1 },
      ],
      total: 62.5,
    });
    // Privacy: no user data, no productId, no per-item price — ever.
    expect(res.body).not.toHaveProperty('user');
    expect(JSON.stringify(res.body)).not.toContain(USER.dni);
    expect(JSON.stringify(res.body)).not.toContain(USER.name);
    expect(JSON.stringify(res.body)).not.toContain(USER.phone);
    for (const item of res.body.items) {
      expect(item).not.toHaveProperty('productId');
      expect(item).not.toHaveProperty('price');
    }
    // Absent optional attrs are omitted, not null.
    expect(res.body.items[1]).not.toHaveProperty('size');
    expect(res.body.items[1]).not.toHaveProperty('color');
    expect(res.body.items[1]).not.toHaveProperty('logoPosition');
    // taza-1 has neither logo nor legacy image → no logo key at all.
    expect(res.body.items[1]).not.toHaveProperty('logo');
  });

  it('serves the product\'s *current* logo, resolved at request time', async () => {
    const id = await createOrder();
    await Product.updateOne({ _id: 'polo-1' }, { $set: { logo: '/uploads/polo-one-v2.png' } });
    const res = await request(app).get(`/api/orders/${id}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body.items[0].logo).toBe('/uploads/polo-one-v2.png');
  });

  it('falls back to the legacy product image when there is no uploaded logo', async () => {
    await seed();
    await Product.create({
      _id: 'mug-legacy',
      name: 'Taza Legacy',
      price: 10,
      type: 'taza',
      published: true,
      image: 'https://firebase.example/taza-legacy.png',
    });
    const created = await request(app)
      .post('/api/orders')
      .send({ user: USER, items: [{ productId: 'mug-legacy', quantity: 1 }] });
    expect(created.status).toBe(201);
    const res = await request(app).get(`/api/orders/${created.body.id}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body.items[0].logo).toBe('https://firebase.example/taza-legacy.png');
    expect(res.body.items[0]).not.toHaveProperty('productId');
  });

  it('omits logo when the referenced product no longer exists — never breaks tracking', async () => {
    const id = await createOrder();
    await Product.deleteOne({ _id: 'polo-1' });
    const res = await request(app).get(`/api/orders/${id}/tracking`);
    expect(res.status).toBe(200);
    // Snapshot survives, artwork of the deleted product does not.
    expect(res.body.items[0].name).toBe('Polo One');
    expect(res.body.items[0]).not.toHaveProperty('logo');
    for (const item of res.body.items) {
      expect(item).not.toHaveProperty('productId');
      expect(item).not.toHaveProperty('price');
    }
  });

  it('finds the order when the code is typed in lowercase (trim + uppercase)', async () => {
    const id = await createOrder();
    const res = await request(app).get(`/api/orders/${id.toLowerCase()}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('404 NOT_FOUND envelope for an unknown id', async () => {
    const res = await request(app).get('/api/orders/DEADBEEF/tracking');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Order not found' },
    });
  });

  it('reports "pendiente" for legacy orders stored without status', async () => {
    // Insert directly, bypassing mongoose defaults, like a pre-status document.
    const now = new Date();
    await Order.collection.insertOne({
      _id: 'AAAA1111',
      user: USER,
      items: [{ productId: 'polo-1', name: 'Polo One', type: 'polo', price: 25, quantity: 1 }],
      total: 25,
      createdAt: now,
      updatedAt: now,
    } as never);
    const res = await request(app).get('/api/orders/AAAA1111/tracking');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pendiente');
  });

  it('returns the status of a cancelled order', async () => {
    const id = await createOrder();
    await Order.updateOne({ _id: id }, { $set: { status: 'cancelado' } });
    const res = await request(app).get(`/api/orders/${id}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelado');
    // Not yet finalized: the full tracking shape is still served.
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
  });

  it('finalizado order returns only the minimal closure view — no items, no total', async () => {
    const id = await createOrder();
    await Order.updateOne({ _id: id }, { $set: { status: 'finalizado' } });
    const res = await request(app).get(`/api/orders/${id}/tracking`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id,
      status: 'finalizado',
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    });
    expect(res.body).not.toHaveProperty('items');
    expect(res.body).not.toHaveProperty('total');
    expect(res.body).not.toHaveProperty('user');
  });

  it('every non-finalizado status keeps the full tracking shape', async () => {
    const id = await createOrder();
    for (const status of ['preparado', 'enviado', 'recibido']) {
      await Order.updateOne({ _id: id }, { $set: { status } });
      const res = await request(app).get(`/api/orders/${id}/tracking`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(62.5);
    }
  });
});
