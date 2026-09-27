import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { Complaint, counterKeyFor, formatCode } from '../models/Complaint.js';
import { Counter, nextSequence } from '../models/Counter.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { createMailer, sendComplaintEmail, type MailTransport, type Mailer } from '../mail/mailer.js';
import { useTestDb } from '../test/db.js';
import { adminToken } from '../test/auth.js';

useTestDb();

const auth = () => ({ Authorization: `Bearer ${adminToken()}` });

/** Valid body per spec R2b.1 / C4. */
function validBody(overrides: Record<string, unknown> = {}) {
  return {
    consumer: {
      name: 'Ada Lovelace',
      docType: 'DNI',
      docNumber: '12345678',
      email: 'ada@example.com',
      phone: '+51999888777',
      address: 'Av. Siempre Viva 742, Lima',
      isMinor: false,
    },
    item: { kind: 'producto', description: 'Polo Docker talla M', amount: 80 },
    claim: {
      type: 'reclamo',
      detail: 'El polo llegó con el estampado descentrado y una mancha en la manga.',
      request: 'Cambio por uno nuevo sin defectos.',
    },
    orderId: 'A1B2C3D4',
    acceptsTerms: true,
    ...overrides,
  };
}

// --------------------------------------------------------------------------
// Models
// --------------------------------------------------------------------------

describe('Counter.nextSequence / formatCode (R2b.1 correlativo)', () => {
  it('two concurrent increments on the same key yield 1 and 2, no duplicates', async () => {
    const key = counterKeyFor(2026);
    const [a, b] = await Promise.all([nextSequence(key), nextSequence(key)]);
    expect([a, b].sort()).toEqual([1, 2]);
    expect(await nextSequence(key)).toBe(3);
    expect((await Counter.find()).length).toBe(1);
  });

  it('a different year key restarts at 1', async () => {
    await nextSequence(counterKeyFor(2026));
    await nextSequence(counterKeyFor(2026));
    expect(await nextSequence(counterKeyFor(2027))).toBe(1);
  });

  it('formatCode zero-pads to six digits', () => {
    expect(formatCode('LR', 2026, 1)).toBe('LR-2026-000001');
    expect(formatCode('LR', 2026, 123456)).toBe('LR-2026-123456');
    expect(formatCode('HR', 2027, 42)).toBe('HR-2027-000042');
  });

  it('Complaint.code is unique', async () => {
    const base = validBody();
    const doc = { code: 'LR-2026-000001', consumer: base.consumer, item: base.item, claim: base.claim };
    await Complaint.create(doc);
    await expect(Complaint.create(doc)).rejects.toMatchObject({ code: 11000 });
  });
});

// --------------------------------------------------------------------------
// Rate limit middleware (design §5.3) — injected clock
// --------------------------------------------------------------------------

describe('rateLimit middleware', () => {
  function appWith(limiter: ReturnType<typeof rateLimit>) {
    const app = express();
    app.post('/x', limiter, (_req, res) => {
      res.status(201).json({ ok: true });
    });
    app.use(errorHandler);
    return app;
  }

  it('lets `max` requests through, 429s the next one with Retry-After, and resets after the window', async () => {
    let clock = 1_000_000;
    const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, now: () => clock });
    const app = appWith(limiter);

    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/x');
      expect(res.status).toBe(201);
    }
    const blocked = await request(app).post('/x');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: { code: 'RATE_LIMITED', message: expect.any(String) } });
    expect(Number(blocked.headers['retry-after'])).toBe(3600);

    clock += 30 * 60 * 1000; // halfway: still blocked, Retry-After shrinks
    const stillBlocked = await request(app).post('/x');
    expect(stillBlocked.status).toBe(429);
    expect(Number(stillBlocked.headers['retry-after'])).toBe(1800);

    clock += 30 * 60 * 1000 + 1; // window elapsed
    const again = await request(app).post('/x');
    expect(again.status).toBe(201);
  });

  it('reset() forgets every client', async () => {
    const limiter = rateLimit({ windowMs: 1000, max: 1 });
    const app = appWith(limiter);
    expect((await request(app).post('/x')).status).toBe(201);
    expect((await request(app).post('/x')).status).toBe(429);
    limiter.reset();
    expect((await request(app).post('/x')).status).toBe(201);
  });
});

// --------------------------------------------------------------------------
// Mailer (design §5.4 / C6)
// --------------------------------------------------------------------------

describe('createMailer / sendComplaintEmail', () => {
  const smtpFull = {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    user: 'libro@example.com',
    pass: 'x',
    from: 'Libro <libro@example.com>',
  };

  it('returns null and warns the exact line when SMTP_HOST is missing', () => {
    const warn = vi.fn();
    const createTransport = vi.fn();
    const mailer = createMailer(
      { smtp: { ...smtpFull, host: undefined }, complaints: { email: 'r@example.com', codePrefix: 'LR', rateLimit: 5 } },
      { createTransport, warn },
    );
    expect(mailer).toBeNull();
    expect(warn).toHaveBeenCalledWith('complaints: SMTP not configured');
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('returns null when COMPLAINTS_EMAIL is missing even with SMTP_HOST (C6)', () => {
    const warn = vi.fn();
    const mailer = createMailer(
      { smtp: smtpFull, complaints: { email: undefined, codePrefix: 'LR', rateLimit: 5 } },
      { createTransport: vi.fn(), warn },
    );
    expect(mailer).toBeNull();
    expect(warn).toHaveBeenCalledWith('complaints: SMTP not configured');
  });

  it('builds a mailer with both set and sends to COMPLAINTS_EMAIL with cc to the consumer', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    const transport: MailTransport = { sendMail };
    const mailer = createMailer(
      { smtp: smtpFull, complaints: { email: 'reclamos@example.com', codePrefix: 'LR', rateLimit: 5 } },
      { createTransport: () => transport, warn: vi.fn() },
    ) as Mailer;
    expect(mailer).not.toBeNull();

    const base = validBody();
    const doc = await Complaint.create({ code: 'LR-2026-000007', consumer: base.consumer, item: base.item, claim: base.claim, orderId: 'A1B2C3D4' });
    expect(await sendComplaintEmail(mailer, doc)).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const message = sendMail.mock.calls[0]?.[0];
    expect(message).toMatchObject({
      from: 'Libro <libro@example.com>',
      to: 'reclamos@example.com',
      cc: 'ada@example.com',
    });
    expect(message.subject).toContain('LR-2026-000007');
    expect(message.text).toContain('Polo Docker talla M');
    expect(message.html).toContain('A1B2C3D4');
  });

  it('resolves false (never throws) when the transport fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mailer: Mailer = {
      transport: { sendMail: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) },
      from: 'a@b.c',
      complaintsEmail: 'r@example.com',
    };
    const base = validBody();
    const doc = await Complaint.create({ code: 'LR-2026-000008', consumer: base.consumer, item: base.item, claim: base.claim });
    expect(await sendComplaintEmail(mailer, doc)).toBe(false);
    errorSpy.mockRestore();
  });
});

// --------------------------------------------------------------------------
// POST /api/complaints (R2b.2)
// --------------------------------------------------------------------------

describe('POST /api/complaints without SMTP', () => {
  const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
  const app = createApp({ complaints: { mailer: null, limiter, now: () => new Date('2026-03-15T12:00:00Z') } });
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    limiter.reset();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('valid body → 201 { id, code, createdAt, emailSent:false }, stored with emailSent=false and warns', async () => {
    const res = await request(app).post('/api/complaints').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      code: 'LR-2026-000001',
      createdAt: expect.any(String),
      emailSent: false,
    });
    const doc = await Complaint.findById(res.body.id);
    expect(doc?.emailSent).toBe(false);
    expect(doc?.status).toBe('nuevo');
    expect(doc?.orderId).toBe('A1B2C3D4');
    expect(doc?.consumer.address).toBe('Av. Siempre Viva 742, Lima');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('complaints: SMTP not configured'));
  });

  it('consecutive complaints get consecutive codes for the same year', async () => {
    const first = await request(app).post('/api/complaints').send(validBody());
    const second = await request(app).post('/api/complaints').send(validBody());
    expect(first.body.code).toBe('LR-2026-000001');
    expect(second.body.code).toBe('LR-2026-000002');
  });

  it('a new year restarts the correlativo at 000001', async () => {
    const next = createApp({ complaints: { mailer: null, limiter: rateLimit({ windowMs: 1000, max: 10 }), now: () => new Date('2027-01-02T00:00:00Z') } });
    await request(app).post('/api/complaints').send(validBody());
    const res = await request(next).post('/api/complaints').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body.code).toBe('LR-2027-000001');
  });

  it('never stores client-sent status/emailSent/code', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({ ...validBody(), status: 'atendido', emailSent: true, code: 'HACK' });
    expect(res.status).toBe(201);
    const doc = await Complaint.findById(res.body.id);
    expect(doc?.status).toBe('nuevo');
    expect(doc?.emailSent).toBe(false);
    expect(doc?.code).toBe('LR-2026-000001');
  });

  it('optional fields may be omitted or blank (amount, orderId, guardianName)', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send(validBody({ item: { kind: 'servicio', description: 'Personalización' }, orderId: '' }));
    expect(res.status).toBe(201);
    const doc = await Complaint.findById(res.body.id);
    expect(doc?.orderId).toBeUndefined();
    expect(doc?.item.amount).toBeUndefined();
  });

  describe('zod validation (400 VALIDATION with details[])', () => {
    it('detail of 10 chars → field claim.detail', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .send(validBody({ claim: { type: 'reclamo', detail: '0123456789', request: 'Un cambio' } }));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
      expect(res.body.error.details).toHaveLength(1);
      expect(res.body.error.details[0].field).toBe('claim.detail');
      expect(await Complaint.countDocuments()).toBe(0);
    });

    it('missing keys are all reported', async () => {
      const res = await request(app).post('/api/complaints').send({});
      expect(res.status).toBe(400);
      const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['consumer', 'item', 'claim', 'acceptsTerms']));
    });

    it('acceptsTerms must be literally true', async () => {
      const res = await request(app).post('/api/complaints').send(validBody({ acceptsTerms: false }));
      expect(res.status).toBe(400);
      expect(res.body.error.details[0].field).toBe('acceptsTerms');
    });

    it('isMinor without guardianName → field guardianName; with it → 201', async () => {
      const body = validBody();
      body.consumer.isMinor = true;
      const bad = await request(app).post('/api/complaints').send(body);
      expect(bad.status).toBe(400);
      expect(bad.body.error.details[0].field).toBe('guardianName');

      const ok = await request(app).post('/api/complaints').send({ ...body, guardianName: 'Annabella Byron' });
      expect(ok.status).toBe(201);
      const doc = await Complaint.findById(ok.body.id);
      expect(doc?.guardianName).toBe('Annabella Byron');
    });

    it.each([
      ['consumer.name', { consumer: { ...validBody().consumer, name: 'A' } }],
      ['consumer.docNumber', { consumer: { ...validBody().consumer, docNumber: '12-34' } }],
      ['consumer.docType', { consumer: { ...validBody().consumer, docType: 'RUC' } }],
      ['consumer.email', { consumer: { ...validBody().consumer, email: 'not-an-email' } }],
      ['consumer.address', { consumer: { ...validBody().consumer, address: 'Ahí' } }],
      ['item.description', { item: { kind: 'producto', description: 'ab' } }],
      ['item.amount', { item: { kind: 'producto', description: 'Polo', amount: -1 } }],
      ['claim.type', { claim: { ...validBody().claim, type: 'sugerencia' } }],
      ['claim.request', { claim: { ...validBody().claim, request: 'ok' } }],
      ['orderId', { orderId: 'abc' }],
    ])('%s invalid → 400 naming that field', async (field, overrides) => {
      const res = await request(app).post('/api/complaints').send(validBody(overrides));
      expect(res.status).toBe(400);
      expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
    });
  });

  it('6th request in the window → 429 RATE_LIMITED and nothing persisted', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post('/api/complaints').send(validBody())).status).toBe(201);
    }
    const res = await request(app).post('/api/complaints').send(validBody());
    expect(res.status).toBe(429);
    expect(res.body).toEqual({ error: { code: 'RATE_LIMITED', message: expect.any(String) } });
    expect(res.headers['retry-after']).toBeDefined();
    expect(await Complaint.countDocuments()).toBe(5);
  });
});

describe('POST /api/complaints with a mailer', () => {
  it('sends to COMPLAINTS_EMAIL with cc consumer and answers emailSent:true', async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const mailer: Mailer = { transport: { sendMail }, from: 'libro@example.com', complaintsEmail: 'reclamos@example.com' };
    const app = createApp({ complaints: { mailer, limiter: rateLimit({ windowMs: 1000, max: 10 }) } });

    const res = await request(app).post('/api/complaints').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body.emailSent).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'reclamos@example.com', cc: 'ada@example.com', subject: expect.stringContaining(res.body.code) }),
    );
    const doc = await Complaint.findById(res.body.id);
    expect(doc?.emailSent).toBe(true);
  });

  it('SMTP failure still answers 201 with emailSent:false', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mailer: Mailer = {
      transport: { sendMail: vi.fn().mockRejectedValue(new Error('boom')) },
      from: 'libro@example.com',
      complaintsEmail: 'reclamos@example.com',
    };
    const app = createApp({ complaints: { mailer, limiter: rateLimit({ windowMs: 1000, max: 10 }) } });
    const res = await request(app).post('/api/complaints').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body.emailSent).toBe(false);
    expect((await Complaint.findById(res.body.id))?.emailSent).toBe(false);
    errorSpy.mockRestore();
  });
});

// --------------------------------------------------------------------------
// Admin (R2b.3 / C7)
// --------------------------------------------------------------------------

describe('admin complaints', () => {
  const app = createApp({ complaints: { mailer: null, limiter: rateLimit({ windowMs: 1000, max: 1000 }) } });

  async function seed(count: number, status: 'nuevo' | 'atendido' = 'nuevo'): Promise<string[]> {
    const base = validBody();
    const ids: string[] = [];
    const existing = await Complaint.countDocuments();
    for (let i = existing; i < existing + count; i++) {
      const createdAt = new Date(Date.UTC(2026, 0, 1 + i));
      const [inserted] = await Complaint.create(
        [
          {
            code: formatCode('LR', 2026, i + 1),
            consumer: base.consumer,
            item: base.item,
            claim: base.claim,
            status,
            createdAt,
            updatedAt: createdAt,
          },
        ],
        { timestamps: false },
      );
      ids.push(inserted!._id.toString());
    }
    return ids;
  }

  it('every route is 401 UNAUTHORIZED without a token', async () => {
    const [id] = await seed(1);
    for (const call of [
      request(app).get('/api/admin/complaints'),
      request(app).get(`/api/admin/complaints/${id}`),
      request(app).patch(`/api/admin/complaints/${id}/status`).send({ status: 'atendido' }),
    ]) {
      const res = await call;
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
    expect((await Complaint.findById(id))?.status).toBe('nuevo');
  });

  it('GET / lists newest first with code visible, default limit 50', async () => {
    await seed(3);
    const res = await request(app).get('/api/admin/complaints').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.map((c: { code: string }) => c.code)).toEqual(['LR-2026-000003', 'LR-2026-000002', 'LR-2026-000001']);
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      status: 'nuevo',
      emailSent: false,
      consumer: expect.objectContaining({ name: 'Ada Lovelace', docType: 'DNI', docNumber: '12345678' }),
      claim: expect.objectContaining({ type: 'reclamo' }),
      createdAt: expect.any(String),
    });
  });

  it('GET / paginates with ?limit and ?cursor (createdAt ISO, strictly older)', async () => {
    await seed(5);
    const page1 = await request(app).get('/api/admin/complaints?limit=2').set(auth());
    expect(page1.status).toBe(200);
    expect(page1.body.map((c: { code: string }) => c.code)).toEqual(['LR-2026-000005', 'LR-2026-000004']);

    const cursor = encodeURIComponent(page1.body[1].createdAt);
    const page2 = await request(app).get(`/api/admin/complaints?limit=2&cursor=${cursor}`).set(auth());
    expect(page2.body.map((c: { code: string }) => c.code)).toEqual(['LR-2026-000003', 'LR-2026-000002']);

    const cursor3 = encodeURIComponent(page2.body[1].createdAt);
    const page3 = await request(app).get(`/api/admin/complaints?limit=2&cursor=${cursor3}`).set(auth());
    expect(page3.body.map((c: { code: string }) => c.code)).toEqual(['LR-2026-000001']);
  });

  it('GET / filters by ?status= and rejects bad query values', async () => {
    await seed(2, 'nuevo');
    await seed(1, 'atendido');
    const attended = await request(app).get('/api/admin/complaints?status=atendido').set(auth());
    expect(attended.body).toHaveLength(1);
    expect(attended.body[0].status).toBe('atendido');

    const badStatus = await request(app).get('/api/admin/complaints?status=cerrado').set(auth());
    expect(badStatus.status).toBe(400);
    expect(badStatus.body.error.details[0].field).toBe('status');

    const badLimit = await request(app).get('/api/admin/complaints?limit=500').set(auth());
    expect(badLimit.status).toBe(400);
    expect(badLimit.body.error.details[0].field).toBe('limit');

    const badCursor = await request(app).get('/api/admin/complaints?cursor=yesterday').set(auth());
    expect(badCursor.status).toBe(400);
    expect(badCursor.body.error.details[0].field).toBe('cursor');
  });

  it('GET /:id returns the DTO; unknown and malformed ids → 404 NOT_FOUND', async () => {
    const [id] = await seed(1);
    const ok = await request(app).get(`/api/admin/complaints/${id}`).set(auth());
    expect(ok.status).toBe(200);
    expect(ok.body.code).toBe('LR-2026-000001');
    expect(ok.body.claim.detail).toContain('estampado');

    const missing = await request(app).get('/api/admin/complaints/64b64b64b64b64b64b64b64b').set(auth());
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const malformed = await request(app).get('/api/admin/complaints/not-an-id').set(auth());
    expect(malformed.status).toBe(404);
    expect(malformed.body.error.code).toBe('NOT_FOUND');
  });

  it('PATCH /:id/status changes nuevo → atendido and back; invalid status → 400', async () => {
    const [id] = await seed(1);
    const attended = await request(app).patch(`/api/admin/complaints/${id}/status`).set(auth()).send({ status: 'atendido' });
    expect(attended.status).toBe(200);
    expect(attended.body.status).toBe('atendido');
    expect((await Complaint.findById(id))?.status).toBe('atendido');

    const reopened = await request(app).patch(`/api/admin/complaints/${id}/status`).set(auth()).send({ status: 'nuevo' });
    expect(reopened.body.status).toBe('nuevo');

    const bad = await request(app).patch(`/api/admin/complaints/${id}/status`).set(auth()).send({ status: 'cerrado' });
    expect(bad.status).toBe(400);
    expect(bad.body.error.details[0].field).toBe('status');

    const missing = await request(app).patch('/api/admin/complaints/64b64b64b64b64b64b64b64b/status').set(auth()).send({ status: 'atendido' });
    expect(missing.status).toBe(404);
  });
});
