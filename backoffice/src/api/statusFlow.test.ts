import { describe, expect, it } from 'vitest';
import {
  ALLOWED_NEXT,
  ORDER_FLOW,
  ORDER_STATUSES,
  canCancel,
  nextForward,
  previousBackward,
} from './statusFlow';

describe('statusFlow', () => {
  it('mirrors the server transition table exactly', () => {
    expect(ALLOWED_NEXT).toEqual({
      pendiente: ['confirmado', 'cancelado'],
      confirmado: ['pagado', 'pendiente', 'cancelado'],
      pagado: ['preparado', 'confirmado', 'cancelado'],
      preparado: ['enviado', 'pagado'],
      enviado: ['recibido', 'preparado'],
      recibido: ['finalizado'],
      finalizado: [],
      cancelado: [],
    });
  });

  it('lists the flow in order plus cancelado off-flow', () => {
    expect(ORDER_FLOW).toEqual([
      'pendiente',
      'confirmado',
      'pagado',
      'preparado',
      'enviado',
      'recibido',
      'finalizado',
    ]);
    expect(ORDER_STATUSES).toEqual([...ORDER_FLOW, 'cancelado']);
  });

  it('derives the forward step per status', () => {
    expect(nextForward('pendiente')).toBe('confirmado');
    expect(nextForward('confirmado')).toBe('pagado');
    expect(nextForward('pagado')).toBe('preparado');
    expect(nextForward('preparado')).toBe('enviado');
    expect(nextForward('enviado')).toBe('recibido');
    expect(nextForward('recibido')).toBe('finalizado');
    expect(nextForward('finalizado')).toBeNull();
    expect(nextForward('cancelado')).toBeNull();
  });

  it('derives the backward step per status', () => {
    expect(previousBackward('pendiente')).toBeNull();
    expect(previousBackward('confirmado')).toBe('pendiente');
    expect(previousBackward('pagado')).toBe('confirmado');
    expect(previousBackward('preparado')).toBe('pagado');
    expect(previousBackward('enviado')).toBe('preparado');
    expect(previousBackward('recibido')).toBeNull();
    expect(previousBackward('finalizado')).toBeNull();
    expect(previousBackward('cancelado')).toBeNull();
  });

  it('derives cancellability per status', () => {
    expect(canCancel('pendiente')).toBe(true);
    expect(canCancel('confirmado')).toBe(true);
    expect(canCancel('pagado')).toBe(true);
    expect(canCancel('preparado')).toBe(false);
    expect(canCancel('enviado')).toBe(false);
    expect(canCancel('recibido')).toBe(false);
    expect(canCancel('finalizado')).toBe(false);
    expect(canCancel('cancelado')).toBe(false);
  });
});
