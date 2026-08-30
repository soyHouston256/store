/**
 * Order status workflow (order-management design):
 *
 *   pendiente → confirmado → pagado → preparado → enviado → recibido → finalizado
 *
 * plus `cancelado`. Allowed transitions: one step forward, one step
 * backward (admin fixing a mistake), or to `cancelado` — but only from
 * pendiente/confirmado/pagado. `recibido` is forward-only: its single
 * exit is `finalizado` (no backward step, no cancel). `finalizado` and
 * `cancelado` are final: nothing leaves them, not even a backward step.
 */

/** Every status, in flow order, with the off-flow `cancelado` last. */
export const ORDER_STATUSES = [
  'pendiente',
  'confirmado',
  'pagado',
  'preparado',
  'enviado',
  'recibido',
  'finalizado',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The sequential flow (excludes `cancelado`, which sits outside it). */
const FLOW: readonly OrderStatus[] = ORDER_STATUSES.slice(0, -1);

const CANCELABLE_FROM: ReadonlySet<OrderStatus> = new Set(['pendiente', 'confirmado', 'pagado']);
const FINAL: ReadonlySet<OrderStatus> = new Set(['finalizado', 'cancelado']);
/** Statuses that may only advance — no backward step out of them. */
const FORWARD_ONLY: ReadonlySet<OrderStatus> = new Set(['recibido']);

/** Statuses an order in `from` may move to. Empty for final statuses. */
export function allowedNext(from: OrderStatus): OrderStatus[] {
  if (FINAL.has(from)) return [];
  const index = FLOW.indexOf(from);
  const next: OrderStatus[] = [];
  const forward = FLOW[index + 1];
  if (forward !== undefined) next.push(forward);
  if (!FORWARD_ONLY.has(from)) {
    const backward = FLOW[index - 1];
    if (backward !== undefined) next.push(backward);
  }
  if (CANCELABLE_FROM.has(from)) next.push('cancelado');
  return next;
}

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedNext(from).includes(to);
}
