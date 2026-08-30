import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { Order } from '../models/Order.js';
import { useTestDb } from '../test/db.js';
import { adminToken, badSignatureToken, expiredToken } from '../test/auth.js';

useTestDb();
const app = createApp();

const auth = () => ({ Authorization: `Bearer ${adminToken()}` });

const USER = { dni: '12345678', name: 'Ada Lovelace', phone: '+51999888777' };
const ITEMS = [{ productId: 'polo-1', name: 'Polo One', type: 'polo', price: 25, quantity: 2 }];

/**
 * Seeds via the raw collection (bypassing mongoose defaults) so we control
 * `createdAt` for sort assertions and can omit `status` for legacy docs.
 */
async function seedRaw(
  docs: Array<{ _id: string; status?: string; createdAt: Date }>,
): Promise<void> {
  // Raw driver insert; cast because the driver types `_id` as ObjectId
  // while this collection uses string ids.
  await Order.collection.insertMany(
    docs.map((doc) => ({
      _id: doc._id,
      user: USER,
      items: ITEMS,
      total: 50,
      ...(doc.status !== undefined ? { status: doc.status } : {}),
      createdAt: doc.createdAt,
      updatedAt: doc.createdAt,
    })) as unknown as Parameters<typeof Order.collection.insertMany>[0],
  );
}

async function seedOne(id: string, status?: string): Promise<void> {
  await seedRaw([{ _id: id, ...(status !== undefined ? { status } : {}), createdAt: new Date() }]);
}

const patchStatus = (id: string, status: string) =>
  request(app).patch(`/api/admin/orders/${id}/status`).set(auth()).send({ status });

describe('admin orders auth guard — full 401 matrix', () => {
  const routes = [
    { method: 'get', path: '/api/admin/orders' },
    { method: 'get', path: '/api/admin/orders/ORDER001' },
    { method: 'patch', path: '/api/admin/orders/ORDER001/status' },
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

  it('expired JWT on PATCH status leaves the order unchanged', async () => {
    await seedOne('ORDER001', 'pendiente');
    const res = await request(app)
      .patch('/api/admin/orders/ORDER001/status')
      .set('Authorization', `Bearer ${expiredToken()}`)
      .send({ status: 'confirmado' });
    expect(res.status).toBe(401);
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('pendiente');
  });
});

describe('GET /api/admin/orders', () => {
  it('lists all orders sorted by createdAt desc with the full DTO', async () => {
    await seedRaw([
      { _id: 'OLDEST01', status: 'recibido', createdAt: new Date('2026-01-01T10:00:00Z') },
      { _id: 'NEWEST01', status: 'pendiente', createdAt: new Date('2026-03-01T10:00:00Z') },
      { _id: 'MIDDLE01', status: 'pagado', createdAt: new Date('2026-02-01T10:00:00Z') },
    ]);
    const res = await request(app).get('/api/admin/orders').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.map((o: { id: string }) => o.id)).toEqual(['NEWEST01', 'MIDDLE01', 'OLDEST01']);
    expect(res.body[0]).toEqual({
      id: 'NEWEST01',
      user: USER,
      items: ITEMS,
      total: 50,
      status: 'pendiente',
      createdAt: '2026-03-01T10:00:00.000Z',
    });
  });

  it('?status= filters by status', async () => {
    await seedRaw([
      { _id: 'PEND0001', status: 'pendiente', createdAt: new Date('2026-01-01T10:00:00Z') },
      { _id: 'PAGO0001', status: 'pagado', createdAt: new Date('2026-01-02T10:00:00Z') },
      { _id: 'PAGO0002', status: 'pagado', createdAt: new Date('2026-01-03T10:00:00Z') },
    ]);
    const res = await request(app).get('/api/admin/orders?status=pagado').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.map((o: { id: string }) => o.id)).toEqual(['PAGO0002', 'PAGO0001']);
  });

  it('?status=pendiente includes legacy orders stored without a status field', async () => {
    await seedRaw([
      { _id: 'LEGACY01', createdAt: new Date('2026-01-01T10:00:00Z') }, // no status in DB
      { _id: 'CONF0001', status: 'confirmado', createdAt: new Date('2026-01-02T10:00:00Z') },
    ]);
    const res = await request(app).get('/api/admin/orders?status=pendiente').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.map((o: { id: string }) => o.id)).toEqual(['LEGACY01']);
    expect(res.body[0].status).toBe('pendiente');
  });

  it('?status with an unknown value → 400 VALIDATION naming the field', async () => {
    const res = await request(app).get('/api/admin/orders?status=bogus').set(auth());
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('status');
  });
});

describe('GET /api/admin/orders/:id', () => {
  it('returns one order with its status', async () => {
    await seedOne('ORDER001', 'enviado');
    const res = await request(app).get('/api/admin/orders/ORDER001').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'ORDER001', user: USER, total: 50, status: 'enviado' });
  });

  it('legacy order without a status field reads as pendiente', async () => {
    await seedOne('LEGACY01');
    const res = await request(app).get('/api/admin/orders/LEGACY01').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pendiente');
  });

  it('unknown id → 404', async () => {
    const res = await request(app).get('/api/admin/orders/NOPE').set(auth());
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/admin/orders/:id/status', () => {
  it('walks the full happy path pendiente → … → finalizado', async () => {
    await seedOne('ORDER001', 'pendiente');
    for (const status of ['confirmado', 'pagado', 'preparado', 'enviado', 'recibido', 'finalizado']) {
      const res = await patchStatus('ORDER001', status);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('finalizado');
  });

  it('allows one step backward (admin fixing a mistake)', async () => {
    await seedOne('ORDER001', 'confirmado');
    const res = await patchStatus('ORDER001', 'pendiente');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pendiente');
  });

  it('allows cancel from pagado', async () => {
    await seedOne('ORDER001', 'pagado');
    const res = await patchStatus('ORDER001', 'cancelado');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelado');
  });

  it('rejects cancel from preparado → 400 naming both statuses', async () => {
    await seedOne('ORDER001', 'preparado');
    const res = await patchStatus('ORDER001', 'cancelado');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(res.body.error.message).toContain('preparado');
    expect(res.body.error.message).toContain('cancelado');
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('preparado');
  });

  it('rejects skipping a step (pendiente → pagado) → 400', async () => {
    await seedOne('ORDER001', 'pendiente');
    const res = await patchStatus('ORDER001', 'pagado');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('recibido → finalizado closes the order', async () => {
    await seedOne('ORDER001', 'recibido');
    const res = await patchStatus('ORDER001', 'finalizado');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('finalizado');
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('finalizado');
  });

  it('recibido is forward-only — no backward step, no cancel', async () => {
    await seedOne('ORDER001', 'recibido');
    for (const status of ['enviado', 'pendiente', 'cancelado']) {
      const res = await patchStatus('ORDER001', status);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
      expect(res.body.error.message).toContain('recibido');
    }
  });

  it('finalizado is final — no transition out, not even backward', async () => {
    await seedOne('ORDER001', 'finalizado');
    for (const status of ['recibido', 'enviado', 'pendiente', 'cancelado']) {
      const res = await patchStatus('ORDER001', status);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
      expect(res.body.error.message).toContain('finalizado');
    }
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('finalizado');
  });

  it('cancelado is final — no transition out', async () => {
    await seedOne('ORDER001', 'cancelado');
    for (const status of ['pendiente', 'confirmado', 'pagado']) {
      const res = await patchStatus('ORDER001', status);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    }
  });

  it('legacy order without a status field is treated as pendiente and transitionable', async () => {
    await seedOne('LEGACY01');
    const res = await patchStatus('LEGACY01', 'confirmado');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmado');
    const doc = await Order.findById('LEGACY01');
    expect(doc?.status).toBe('confirmado');
  });

  it('unknown id → 404', async () => {
    const res = await patchStatus('NOPE1234', 'confirmado');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('unknown status value in the body → 400 naming the field', async () => {
    await seedOne('ORDER001', 'pendiente');
    const res = await patchStatus('ORDER001', 'enviando');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('status');
  });

  it('missing status in the body → 400', async () => {
    await seedOne('ORDER001', 'pendiente');
    const res = await request(app)
      .patch('/api/admin/orders/ORDER001/status')
      .set(auth())
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('race: two concurrent confirms → exactly one 200, the loser 400', async () => {
    await seedOne('ORDER001', 'pendiente');
    const [a, b] = await Promise.all([
      patchStatus('ORDER001', 'confirmado'),
      patchStatus('ORDER001', 'confirmado'),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 400]);
    const doc = await Order.findById('ORDER001');
    expect(doc?.status).toBe('confirmado');
  });
});
