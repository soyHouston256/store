import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { useTestDb } from './test/db.js';

useTestDb();
const app = createApp();

describe('app envelope behavior', () => {
  it('unknown route returns the 404 error envelope', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('zod failure returns 400 VALIDATION naming the offending fields (R3.1 shape)', async () => {
    const res = await request(app).post('/api/products/some-id/like').send({ delta: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'delta' })]),
    );
  });

  it('malformed JSON returns 400 VALIDATION envelope', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });
});
