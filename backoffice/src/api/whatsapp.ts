import type { OrderDTO, OrderStatus } from './types';

/**
 * Normalize a phone for wa.me: strip non-digits; local Peruvian numbers
 * (9 digits or fewer, i.e. no country code) get the 51 prefix.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length <= 9 ? `51${digits}` : digits;
}

/**
 * Public storefront origin, used for the customer-facing tracking link.
 * BUILD-TIME value (vite bakes it in) — set VITE_STORE_URL when building
 * the docker image. `||` (not `??`): vite may define it as ''.
 */
export const STORE_URL: string = import.meta.env.VITE_STORE_URL || 'http://store.localhost';

/** Spanish notification message for the order's CURRENT status. */
export function whatsappMessage(order: OrderDTO): string {
  const { status } = order;
  const id = `*${order.id}*`;
  const name = order.user.name;
  const total = `S/ ${order.total}`;
  // Tracking link only while the order is in progress: once it's received,
  // finalized or cancelled the tracking page adds nothing for the customer.
  const tracking = `\nSigue tu pedido: ${STORE_URL}/pedido/${order.id}`;
  const templates: Record<OrderStatus, string> = {
    pendiente: `Hola ${name}! Recibimos tu pedido ${id} por ${total}. Te confirmamos pronto.`,
    confirmado: `Hola ${name}! Tu pedido ${id} está confirmado. Puedes proceder con el pago.${tracking}`,
    pagado: `Hola ${name}! Pago recibido, estamos preparando tu pedido ${id}.${tracking}`,
    preparado: `Hola ${name}! Tu pedido ${id} está listo para envío.${tracking}`,
    enviado: `Hola ${name}! Tu pedido ${id} va en camino!${tracking}`,
    recibido: `Hola ${name}! Gracias por tu compra!`,
    finalizado: `Hola ${name}! Tu pedido ${id} ha sido finalizado. ¡Gracias por tu compra, esperamos verte pronto!`,
    cancelado: `Hola ${name}. Tu pedido ${id} fue cancelado. Escríbenos si tienes alguna consulta.`,
  };
  return templates[status];
}

/** wa.me deep link with the status message pre-filled. */
export function whatsappUrl(order: OrderDTO): string {
  const phone = normalizePhone(order.user.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage(order))}`;
}
