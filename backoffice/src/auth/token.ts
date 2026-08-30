const STORAGE_KEY = 'bo_token';

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

/** Decode a JWT payload locally (no signature verification — display/expiry only). */
export function decodePayload(token: string): JwtPayload | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = decodePayload(token);
  // Undecodable or exp-less tokens are treated as expired: we cannot trust them.
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now();
}

/** Returns the stored token, or null if absent/expired (expired ⇒ logged out + cleared). */
export function getToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return null;
  if (isExpired(token)) {
    clearToken();
    return null;
  }
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
