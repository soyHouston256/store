import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

const FULL_ENV = {
  MONGO_URI: 'mongodb://mongo:27017/store',
  JWT_SECRET: 's3cret',
  ADMIN_USER: 'admin',
  ADMIN_PASSWORD_HASH: '$2b$12$hash',
};

describe('loadConfig (NFR-2 fail-fast)', () => {
  it('throws naming JWT_SECRET when it is missing', () => {
    const { JWT_SECRET: _omit, ...env } = FULL_ENV;
    expect(() => loadConfig(env)).toThrowError(/JWT_SECRET/);
  });

  it('throws naming every missing admin credential', () => {
    expect(() => loadConfig({ MONGO_URI: 'mongodb://x/db', JWT_SECRET: 's' })).toThrowError(
      /ADMIN_USER.*ADMIN_PASSWORD_HASH|ADMIN_PASSWORD_HASH.*ADMIN_USER/,
    );
  });

  it('treats empty strings as missing', () => {
    expect(() => loadConfig({ ...FULL_ENV, JWT_SECRET: '  ' })).toThrowError(/JWT_SECRET/);
  });

  it('applies defaults for optional vars', () => {
    const config = loadConfig(FULL_ENV);
    expect(config.port).toBe(3000);
    expect(config.jwtExpiresIn).toBe('12h');
    expect(config.uploadDir).toBe('/data/uploads');
    expect(config.corsOrigins).toEqual([]);
  });

  it('treats every SMTP/COMPLAINTS variable as optional with documented defaults (R2b.2)', () => {
    const config = loadConfig(FULL_ENV);
    expect(config.smtp).toEqual({
      host: undefined,
      port: 587,
      secure: false,
      user: undefined,
      pass: undefined,
      from: undefined,
    });
    expect(config.complaints).toEqual({ email: undefined, codePrefix: 'LR', rateLimit: 5 });
  });

  it('reads the SMTP/COMPLAINTS variables when present (SMTP_FROM falls back to SMTP_USER)', () => {
    const config = loadConfig({
      ...FULL_ENV,
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'libro@example.com',
      SMTP_PASS: 'p4ss',
      COMPLAINTS_EMAIL: 'reclamos@example.com',
      COMPLAINTS_CODE_PREFIX: 'HR',
      COMPLAINTS_RATE_LIMIT: '10',
    });
    expect(config.smtp).toEqual({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      user: 'libro@example.com',
      pass: 'p4ss',
      from: 'libro@example.com',
    });
    expect(config.complaints).toEqual({ email: 'reclamos@example.com', codePrefix: 'HR', rateLimit: 10 });
  });

  it('rejects a non-numeric COMPLAINTS_RATE_LIMIT', () => {
    expect(() => loadConfig({ ...FULL_ENV, COMPLAINTS_RATE_LIMIT: 'many' })).toThrowError(
      /COMPLAINTS_RATE_LIMIT/,
    );
  });

  it('parses CORS_ORIGINS into an exact-match allowlist', () => {
    const config = loadConfig({
      ...FULL_ENV,
      CORS_ORIGINS: 'https://store.example.com, https://admin.example.com',
    });
    expect(config.corsOrigins).toEqual(['https://store.example.com', 'https://admin.example.com']);
  });
});
