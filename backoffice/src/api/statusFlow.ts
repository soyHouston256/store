import type { OrderStatus } from './types';

/** The 7 forward-flow statuses, in order. `cancelado` is off-flow. */
export const ORDER_FLOW: OrderStatus[] = [
  'pendiente',
  'confirmado',
  'pagado',
  'preparado',
  'enviado',
  'recibido',
  'finalizado',
];

export const ORDER_STATUSES: OrderStatus[] = [...ORDER_FLOW, 'cancelado'];

/** Mirror of the server-enforced transition table (api). Keep in sync. */
export const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['pagado', 'pendiente', 'cancelado'],
  pagado: ['preparado', 'confirmado', 'cancelado'],
  preparado: ['enviado', 'pagado'],
  enviado: ['recibido', 'preparado'],
  recibido: ['finalizado'],
  finalizado: [],
  cancelado: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  pagado: 'Pagado',
  preparado: 'Preparado',
  enviado: 'Enviado',
  recibido: 'Recibido',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

/** Button label for moving forward INTO the given status. */
export const FORWARD_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmado: 'Confirmar',
  pagado: 'Marcar pagado',
  preparado: 'Marcar preparado',
  enviado: 'Marcar enviado',
  recibido: 'Marcar recibido',
  finalizado: 'Finalizar pedido',
};

function flowIndex(status: OrderStatus): number {
  return ORDER_FLOW.indexOf(status);
}

/** The forward step allowed from `status`, or null if none. */
export function nextForward(status: OrderStatus): OrderStatus | null {
  const current = flowIndex(status);
  if (current === -1) return null;
  return ALLOWED_NEXT[status].find((s) => flowIndex(s) > current) ?? null;
}

/** The backward step allowed from `status`, or null if none. */
export function previousBackward(status: OrderStatus): OrderStatus | null {
  const current = flowIndex(status);
  if (current === -1) return null;
  return ALLOWED_NEXT[status].find((s) => s !== 'cancelado' && flowIndex(s) < current) ?? null;
}

export function canCancel(status: OrderStatus): boolean {
  return ALLOWED_NEXT[status].includes('cancelado');
}
