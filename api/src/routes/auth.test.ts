import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { useTestDb } from '../test/db.js';
import { TEST_ADMIN_PASSWORD } from '../test/auth.js';

useTestDb();
const app = createApp();

describe('POST /api/auth/login (R2.1)', () => {
  it('returns a verifiable HS256 JWT and expiresIn on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: TEST_ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.expiresIn).toBe('12h');

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;
    expect(payload.sub).toBe('admin');
    expect(payload.role).toBe('admin');
    // Expiry honors JWT_EXPIRES_IN default 12h.
    expect(payload.exp! - payload.iat!).toBe(12 * 60 * 60);
  });

  it('wrong password → generic 401 that does not reveal which field failed', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message.toLowerCase()).not.toContain('password');
    expect(res.body.error.message.toLowerCase()).not.toContain('user');
  });

  it('unknown username → identical generic 401 body (flat response)', async () => {
    const wrongUser = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: TEST_ADMIN_PASSWORD });
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(wrongUser.status).toBe(401);
    expect(wrongUser.body).toEqual(wrongPassword.body);
  });

  it('missing fields → 400 VALIDATION naming them', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('username');
    expect(fields).toContain('password');
  });
});
