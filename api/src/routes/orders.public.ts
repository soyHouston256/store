import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Order, toOrderDTO, toOrderTrackingDTO } from '../models/Order.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';

export const ordersPublicRouter = Router();

/**
 * OrderCreateDTO (design §3). zod strips unknown keys, so any
 * client-supplied `total` / `price` never reaches the handler.
 */
const OrderCreateSchema = z.object({
  user: z.object({
    dni: z.string().trim().min(1),
    name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        size: z.string().min(1).optional(),
        color: z.string().min(1).optional(),
        logoPosition: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

type OrderCreateDTO = z.infer<typeof OrderCreateSchema>;

/** 8-char uppercase order id, matching the storefront's WhatsApp format. */
function generateOrderId(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

// POST /api/orders — server recomputes prices/total from the DB (R8.1)
ordersPublicRouter.post(
  '/',
  validate(OrderCreateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as OrderCreateDTO;

    const items = [];
    let total = 0;
    for (const [index, item] of body.items.entries()) {
      const product = await Product.findOne({ _id: item.productId, published: true });
      if (!product) {
        throw new HttpError('VALIDATION', 'Order references an unavailable product', [
          { field: `items.${index}.productId`, message: `Product "${item.productId}" is not available` },
        ]);
      }
      total += product.price * item.quantity;
      items.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity: item.quantity,
        ...(item.size !== undefined ? { size: item.size } : {}),
        ...(item.color !== undefined ? { color: item.color } : {}),
        ...(item.logoPosition !== undefined ? { logoPosition: item.logoPosition } : {}),
      });
    }

    const order = await Order.create({
      _id: generateOrderId(),
      user: body.user,
      items,
      total,
    });

    res.status(201).json(toOrderDTO(order));
  }),
);

// GET /api/orders/:id/tracking — public tracking by code, privacy-limited
// (order-tracking design): never returns user data. Codes are stored
// uppercase; trim + uppercase is the only lookup leniency.
ordersPublicRouter.get(
  '/:id/tracking',
  asyncHandler(async (req, res) => {
    const id = (req.params.id ?? '').trim().toUpperCase();
    const order = await Order.findById(id);
    if (!order) {
      throw new HttpError('NOT_FOUND', 'Order not found');
    }

    // A finalized order returns only the minimal closure view — no items,
    // no total — so there is no artwork to resolve.
    if (order.status === 'finalizado') {
      res.json(toOrderTrackingDTO(order));
      return;
    }

    // Resolve each item's *current* product artwork in one query so the
    // storefront can render thumbnails. productId itself never leaves the
    // server; products with no artwork (or deleted ones) simply omit `logo`.
    const productIds = [...new Set(order.items.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select('logo image');
    const logoByProductId = new Map<string, string>();
    for (const product of products) {
      const logo = product.logo ?? product.image;
      if (logo != null) logoByProductId.set(product._id, logo);
    }

    res.json(toOrderTrackingDTO(order, logoByProductId));
  }),
);
