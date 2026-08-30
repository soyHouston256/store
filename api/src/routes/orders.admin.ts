import { Router } from 'express';
import { z } from 'zod';
import type { FilterQuery } from 'mongoose';
import { Order, toOrderDTO, type OrderAttrs } from '../models/Order.js';
import { ORDER_STATUSES, allowedNext, isValidTransition, type OrderStatus } from '../orders/statusFlow.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const ordersAdminRouter = Router();

// Every admin endpoint is JWT-guarded, same as products.admin.
ordersAdminRouter.use(requireAuth);

const StatusEnum = z.enum(ORDER_STATUSES);

const StatusPatchSchema = z.object({ status: StatusEnum });

/**
 * Legacy orders were stored before the `status` field existed; the schema
 * default makes them hydrate as 'pendiente', but a raw Mongo filter on
 * `status` would miss them. This predicate treats a missing field as
 * 'pendiente' at the query level too.
 */
function statusFilter(status: OrderStatus): FilterQuery<OrderAttrs> {
  return status === 'pendiente'
    ? { $or: [{ status: 'pendiente' }, { status: { $exists: false } }] }
    : { status };
}

// GET /api/admin/orders — all orders, newest first, optional ?status= filter
ordersAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let filter: FilterQuery<OrderAttrs> = {};
    if (req.query.status !== undefined) {
      const parsed = StatusEnum.safeParse(req.query.status);
      if (!parsed.success) {
        throw new HttpError('VALIDATION', 'Invalid status filter', [
          { field: 'status', message: `Must be one of: ${ORDER_STATUSES.join(', ')}` },
        ]);
      }
      filter = statusFilter(parsed.data);
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders.map(toOrderDTO));
  }),
);

// GET /api/admin/orders/:id
ordersAdminRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new HttpError('NOT_FOUND', 'Order not found');
    res.json(toOrderDTO(order));
  }),
);

// PATCH /api/admin/orders/:id/status — validated workflow transition.
//
// Race safety: after load+validate, the update is a findOneAndUpdate whose
// filter re-asserts the observed current status (compare-and-swap). If a
// concurrent request changed the status in between, the filter matches
// nothing, we re-read, and answer 404/400 from the fresh state — so two
// concurrent identical transitions yield exactly one 200.
ordersAdminRouter.patch(
  '/:id/status',
  validate(StatusPatchSchema),
  asyncHandler(async (req, res) => {
    const { status: requested } = req.body as z.infer<typeof StatusPatchSchema>;
    const id = req.params.id;

    const invalidTransition = (current: OrderStatus): HttpError =>
      new HttpError(
        'VALIDATION',
        `Invalid status transition from '${current}' to '${requested}'`,
        [
          {
            field: 'status',
            message: allowedNext(current).length
              ? `From '${current}' the order can only move to: ${allowedNext(current).join(', ')}`
              : `'${current}' is a final status`,
          },
        ],
      );

    const order = await Order.findById(id);
    if (!order) throw new HttpError('NOT_FOUND', 'Order not found');

    // Schema default: a legacy doc without the field reads as 'pendiente'.
    const current = order.status;
    if (!isValidTransition(current, requested)) throw invalidTransition(current);

    const updated = await Order.findOneAndUpdate(
      { _id: id, ...statusFilter(current) },
      { $set: { status: requested } },
      { new: true, runValidators: true },
    );
    if (updated) {
      res.json(toOrderDTO(updated));
      return;
    }

    // Precondition failed: the status changed under us (or the order vanished).
    const fresh = await Order.findById(id);
    if (!fresh) throw new HttpError('NOT_FOUND', 'Order not found');
    throw invalidTransition(fresh.status);
  }),
);
