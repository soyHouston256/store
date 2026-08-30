import type { OrderDTO } from '../api/types';

const b64url = (obj: unknown) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Unsigned-but-well-formed JWT; the app only decodes the payload locally. */
export function makeToken(expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: 'admin', role: 'admin', exp })}.fakesig`;
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: 'ab12cd34',
    user: { dni: '12345678', name: 'María', phone: '987654321' },
    items: [
      {
        productId: 'p1',
        name: 'Polo azul',
        type: 'polo',
        price: 45,
        quantity: 2,
        size: 'M',
        color: '#1d4ed8',
        logoPosition: 'chest',
      },
      { productId: 'p2', name: 'Taza logo', type: 'taza', price: 25, quantity: 1 },
    ],
    total: 115,
    status: 'pendiente',
    createdAt: '2026-08-20T15:30:00.000Z',
    ...overrides,
  };
}

export function errorEnvelope(
  code: string,
  message: string,
  details?: { field: string; message: string }[],
) {
  return { error: { code, message, ...(details ? { details } : {}) } };
}
