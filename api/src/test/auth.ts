import jwt from 'jsonwebtoken';

/** Test password matching the ADMIN_PASSWORD_HASH set in test/env.ts. */
export const TEST_ADMIN_PASSWORD = 'test-password';

/** Valid admin token signed with the test JWT_SECRET. */
export function adminToken(): string {
  return jwt.sign({ sub: 'admin', role: 'admin' }, process.env.JWT_SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

/** Correctly signed but already expired. */
export function expiredToken(): string {
  return jwt.sign({ sub: 'admin', role: 'admin' }, process.env.JWT_SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '-10s',
  });
}

/** Well-formed JWT signed with the wrong secret. */
export function badSignatureToken(): string {
  return jwt.sign({ sub: 'admin', role: 'admin' }, 'not-the-real-secret', {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}
