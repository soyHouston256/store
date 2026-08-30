import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES, allowedNext, isValidTransition, type OrderStatus } from './statusFlow.js';

/**
 * Expected transition table (order-management design):
 * forward one step, backward one step, cancel only from
 * pendiente/confirmado/pagado; recibido is forward-only (its single exit
 * is finalizado — no backward, no cancel); finalizado and cancelado are
 * final.
 */
const EXPECTED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['pagado', 'pendiente', 'cancelado'],
  pagado: ['preparado', 'confirmado', 'cancelado'],
  preparado: ['enviado', 'pagado'],
  enviado: ['recibido', 'preparado'],
  recibido: ['finalizado'],
  finalizado: [],
  cancelado: [],
};

describe('ORDER_STATUSES', () => {
  it('lists every status in flow order, with cancelado last', () => {
    expect(ORDER_STATUSES).toEqual([
      'pendiente',
      'confirmado',
      'pagado',
      'preparado',
      'enviado',
      'recibido',
      'finalizado',
      'cancelado',
    ]);
  });
});

describe('allowedNext', () => {
  for (const from of ORDER_STATUSES) {
    it(`allowedNext('${from}') → [${EXPECTED_NEXT[from].join(', ')}]`, () => {
      expect([...allowedNext(from)].sort()).toEqual([...EXPECTED_NEXT[from]].sort());
    });
  }
});

describe('isValidTransition — full from→to matrix', () => {
  for (const from of ORDER_STATUSES) {
    for (const to of ORDER_STATUSES) {
      const expected = EXPECTED_NEXT[from].includes(to);
      it(`${from} → ${to} is ${expected ? 'valid' : 'invalid'}`, () => {
        expect(isValidTransition(from, to)).toBe(expected);
      });
    }
  }

  it('never allows a self-transition', () => {
    for (const status of ORDER_STATUSES) {
      expect(isValidTransition(status, status)).toBe(false);
    }
  });

  it('final statuses have no way out, not even backward', () => {
    for (const to of ORDER_STATUSES) {
      expect(isValidTransition('finalizado', to)).toBe(false);
      expect(isValidTransition('cancelado', to)).toBe(false);
    }
  });

  it('recibido is forward-only: finalizado is its single exit', () => {
    for (const to of ORDER_STATUSES) {
      expect(isValidTransition('recibido', to)).toBe(to === 'finalizado');
    }
  });
});
