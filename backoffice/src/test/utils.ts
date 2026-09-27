import type { ComplaintDTO, OrderDTO } from '../api/types';

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
        cut: 'hombre',
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

export function makeComplaint(overrides: Partial<ComplaintDTO> = {}): ComplaintDTO {
  return {
    id: '64b64b64b64b64b64b64b001',
    code: 'LR-2026-000001',
    consumer: {
      name: 'Ada Lovelace',
      docType: 'DNI',
      docNumber: '12345678',
      email: 'ada@example.com',
      phone: '999888777',
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
    status: 'nuevo',
    emailSent: false,
    createdAt: '2026-03-15T12:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
    ...overrides,
  };
}
