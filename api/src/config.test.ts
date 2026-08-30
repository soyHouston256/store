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

  it('parses CORS_ORIGINS into an exact-match allowlist', () => {
    const config = loadConfig({
      ...FULL_ENV,
      CORS_ORIGINS: 'https://store.example.com, https://admin.example.com',
    });
    expect(config.corsOrigins).toEqual(['https://store.example.com', 'https://admin.example.com']);
  });
});
