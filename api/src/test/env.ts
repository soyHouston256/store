// vitest setup: required env vars so importing config.ts never fail-fasts
// in tests (the fail-fast path itself is unit-tested via loadConfig()).
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/test-unused';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
// Real bcrypt hash (cost 4, fast) of 'test-password' — auth tests log in with it.
process.env.ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ?? '$2b$04$sWnDWm/qxD9CRQQZ.ZTPnOkZWsHa2e6y4Svm4SKlwbtUvitssZC4q';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? 'http://localhost:5173';
// Unique per test file: upload tests assert on directory contents.
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR ?? mkdtempSync(join(tmpdir(), 'store-uploads-'));
