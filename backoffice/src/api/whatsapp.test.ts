import { describe, expect, it } from 'vitest';
import { normalizePhone, whatsappMessage, whatsappUrl } from './whatsapp';
import { ORDER_STATUSES } from './statusFlow';
import { makeOrder } from '../test/utils';

describe('normalizePhone', () => {
  it('strips non-digits', () => {
    expect(normalizePhone('987 654 321')).toBe('51987654321');
    expect(normalizePhone('987-654-321')).toBe('51987654321');
  });

  it('prefixes 51 for local numbers (9 digits or fewer)', () => {
    expect(normalizePhone('987654321')).toBe('51987654321');
  });

  it('keeps numbers that already carry a country code', () => {
    expect(normalizePhone('+51 987 654 321')).toBe('51987654321');
    expect(normalizePhone('51987654321')).toBe('51987654321');
  });
});

describe('whatsappMessage', () => {
  // VITE_STORE_URL is unset in tests → code falls back to this origin.
  const trackingLine = 'Sigue tu pedido: http://store.localhost/pedido/ab12cd34';

  it('has a template per status with name and no "undefined"', () => {
    for (const status of ORDER_STATUSES) {
      const message = whatsappMessage(makeOrder({ status }));
      expect(message).toContain('María');
      expect(message).not.toContain('undefined');
      expect(message.length).toBeGreaterThan(10);
    }
  });

  it('formats the order id in WhatsApp bold wherever it appears', () => {
    for (const status of ORDER_STATUSES) {
      const message = whatsappMessage(makeOrder({ status }));
      if (message.includes('ab12cd34')) {
        expect(message).toContain('*ab12cd34*');
      }
    }
  });

  it('pendiente mentions the bold order id and total', () => {
    const message = whatsappMessage(makeOrder({ status: 'pendiente' }));
    expect(message).toContain('*ab12cd34*');
    expect(message).toContain('S/ 115');
    expect(message).toContain('Te confirmamos pronto');
  });

  it('confirmado invites to pay', () => {
    const message = whatsappMessage(makeOrder({ status: 'confirmado' }));
    expect(message).toContain('confirmado');
    expect(message).toContain('pago');
  });

  it('in-progress statuses carry the tracking link on its own line', () => {
    for (const status of ['confirmado', 'pagado', 'preparado', 'enviado'] as const) {
      const message = whatsappMessage(makeOrder({ status }));
      expect(message).toContain(`\n${trackingLine}`);
    }
  });

  it('terminal statuses (and pendiente) omit the tracking link', () => {
    // pendiente: nothing to track until the order is confirmed;
    // recibido/finalizado/cancelado: the order is done, tracking adds nothing.
    for (const status of ['pendiente', 'recibido', 'finalizado', 'cancelado'] as const) {
      const message = whatsappMessage(makeOrder({ status }));
      expect(message).not.toContain('Sigue tu pedido');
    }
  });

  it('recibido thanks for the purchase', () => {
    expect(whatsappMessage(makeOrder({ status: 'recibido' }))).toContain('Gracias por tu compra');
  });

  it('finalizado closes with thanks and mentions the order id', () => {
    const message = whatsappMessage(makeOrder({ status: 'finalizado' }));
    expect(message).toContain('*ab12cd34*');
    expect(message).toContain('finalizado');
    expect(message).toContain('Gracias por tu compra');
    expect(message).toContain('esperamos verte pronto');
  });
});

describe('whatsappUrl', () => {
  it('builds a wa.me link with normalized phone and encoded text', () => {
    const order = makeOrder({ status: 'pendiente' });
    const url = whatsappUrl(order);
    expect(url.startsWith('https://wa.me/51987654321?text=')).toBe(true);
    expect(url).not.toContain(' ');
    const encoded = url.split('?text=')[1];
    expect(decodeURIComponent(encoded)).toBe(whatsappMessage(order));
  });
});
