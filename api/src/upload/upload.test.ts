import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { config } from '../config.js';
import { Product } from '../models/Product.js';
import { useTestDb } from '../test/db.js';
import { adminToken } from '../test/auth.js';

useTestDb();
const app = createApp();

const auth = () => ({ Authorization: `Bearer ${adminToken()}` });

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const smallPng = Buffer.concat([PNG_MAGIC, Buffer.alloc(64, 1)]);
const validSvg = Buffer.from(
  '<?xml version="1.0" encoding="UTF-8"?>\n<!-- logo -->\n<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
);
const htmlAsSvg = Buffer.from(
  '<!DOCTYPE html>\n<html><body><script>alert("owned")</script></body></html>',
);

function uploadedFiles(): string[] {
  return existsSync(config.uploadDir) ? readdirSync(config.uploadDir) : [];
}

beforeEach(async () => {
  mkdirSync(config.uploadDir, { recursive: true });
  await Product.create({ _id: 'p-logo', name: 'Logo Polo', price: 25, type: 'polo', published: true });
});

afterEach(() => {
  for (const f of uploadedFiles()) rmSync(join(config.uploadDir, f), { force: true });
});

describe('POST /api/admin/products/:id/logo (R4.1)', () => {
  it('accepts a valid PNG: names the file from id+timestamp, sets logo, serves it', async () => {
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'anything ../weird.png', contentType: 'image/png' });
    expect(res.status).toBe(200);
    expect(res.body.logo).toMatch(/^\/uploads\/p-logo-\d+\.png$/);

    const files = uploadedFiles();
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^p-logo-\d+\.png$/); // client filename discarded

    const doc = await Product.findById('p-logo');
    expect(doc?.logo).toBe(res.body.logo);

    const served = await request(app).get(res.body.logo);
    expect(served.status).toBe(200);
  });

  it('accepts a valid SVG (prolog + comment tolerated)', async () => {
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', validSvg, { filename: 'logo.svg', contentType: 'image/svg+xml' });
    expect(res.status).toBe(200);
    expect(res.body.logo).toMatch(/^\/uploads\/p-logo-\d+\.svg$/);
  });

  it('250KB file → 413 FILE_TOO_LARGE, no file written, logo unchanged', async () => {
    const oversize = Buffer.concat([PNG_MAGIC, Buffer.alloc(250 * 1024, 1)]);
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', oversize, { filename: 'big.png', contentType: 'image/png' });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
    expect(uploadedFiles()).toHaveLength(0);
    const doc = await Product.findById('p-logo');
    expect(doc?.logo).toBeUndefined();
  });

  it('HTML smuggled as image/svg+xml → 415 and the file is unlinked (R4.1 scenario)', async () => {
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', htmlAsSvg, { filename: 'virus.svg', contentType: 'image/svg+xml' });
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA');
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('file claiming image/png without PNG magic bytes → 415 and unlinked', async () => {
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', Buffer.from('GIF89a not a png'), { filename: 'fake.png', contentType: 'image/png' });
    expect(res.status).toBe(415);
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('disallowed mimetype (image/jpeg) → 415, nothing written', async () => {
    const res = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(415);
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('id failing the format pre-check → 404 before multer writes anything', async () => {
    const res = await request(app)
      .post('/api/admin/products/bad.id!/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'logo.png', contentType: 'image/png' });
    expect(res.status).toBe(404);
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('unknown (but well-formed) product id → 404 and the written file is cleaned up', async () => {
    const res = await request(app)
      .post('/api/admin/products/no-such-product/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'logo.png', contentType: 'image/png' });
    expect(res.status).toBe(404);
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('missing file field → 400 VALIDATION; wrong field name → 400', async () => {
    const empty = await request(app).post('/api/admin/products/p-logo/logo').set(auth());
    expect(empty.status).toBe(400);

    const wrongField = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('file', smallPng, { filename: 'logo.png', contentType: 'image/png' });
    expect(wrongField.status).toBe(400);
    expect(uploadedFiles()).toHaveLength(0);
  });

  it('replacing a logo best-effort-unlinks the previous file (design §4)', async () => {
    const first = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'v1.png', contentType: 'image/png' });
    expect(first.status).toBe(200);

    await new Promise((r) => setTimeout(r, 5)); // ensure a distinct timestamp
    const second = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', validSvg, { filename: 'v2.svg', contentType: 'image/svg+xml' });
    expect(second.status).toBe(200);
    expect(second.body.logo).not.toBe(first.body.logo);

    const files = uploadedFiles();
    expect(files).toHaveLength(1); // old png gone
    expect(`/uploads/${files[0]}`).toBe(second.body.logo);
  });

  it('DELETE product best-effort-unlinks its logo file (R3.3/design §4)', async () => {
    const uploaded = await request(app)
      .post('/api/admin/products/p-logo/logo')
      .set(auth())
      .attach('logo', smallPng, { filename: 'logo.png', contentType: 'image/png' });
    expect(uploaded.status).toBe(200);
    expect(uploadedFiles()).toHaveLength(1);

    const res = await request(app).delete('/api/admin/products/p-logo').set(auth());
    expect(res.status).toBe(204);
    expect(uploadedFiles()).toHaveLength(0);
  });
});

describe('GET /uploads/* (R4.2, NFR-1)', () => {
  it('serves files with CSP sandbox, nosniff, inline disposition and immutable cache', async () => {
    writeFileSync(join(config.uploadDir, 'p-logo-1.svg'), validSvg);
    const res = await request(app).get('/uploads/p-logo-1.svg');
    expect(res.status).toBe(200);
    expect(res.headers['content-security-policy']).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-disposition']).toBe('inline');
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.headers['content-type']).toContain('image/svg+xml');
  });

  it('unknown file → 404 envelope', async () => {
    const res = await request(app).get('/uploads/nope.png');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('path traversal is rejected (encoded ..)', async () => {
    const res = await request(app).get('/uploads/%2e%2e%2fpackage.json');
    expect([400, 404]).toContain(res.status);
    expect(res.text).not.toContain('"store-api"');
  });

  it('path traversal is rejected (literal ..)', async () => {
    const res = await request(app).get('/uploads/../package.json');
    expect([400, 404]).toContain(res.status);
    expect(res.text).not.toContain('"store-api"');
  });
});
