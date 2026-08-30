import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { ORDER_STATUSES, type OrderStatus } from '../orders/statusFlow.js';

/**
 * Orders are business records: no TTL, only a `{createdAt: -1}` index for
 * the future admin orders screen (spec R8.1). Items are a denormalized
 * snapshot so an order stays correct if the product is later edited or
 * deleted. `_id` is a server-generated 8-char uppercase code so the
 * storefront WhatsApp message format keeps working (design §3).
 */
const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
    logoPosition: { type: String },
  },
  { _id: false },
);

const OrderUserSchema = new Schema(
  {
    dni: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    _id: { type: String, required: true },
    user: { type: OrderUserSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    // Workflow status (order-management design). Legacy documents stored
    // without the field hydrate as 'pendiente' via this schema default.
    status: { type: String, enum: ORDER_STATUSES, default: 'pendiente' },
  },
  { timestamps: true, _id: false },
);

OrderSchema.index({ createdAt: -1 });

export type OrderAttrs = InferSchemaType<typeof OrderSchema>;
export type OrderDocument = HydratedDocument<OrderAttrs>;

export const Order = model('Order', OrderSchema);

export interface OrderDTO {
  id: string;
  user: { dni: string; name: string; phone: string };
  items: Array<{
    productId: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    logoPosition?: string;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

/**
 * Public tracking view (order-tracking design): privacy-limited — never
 * exposes user data (dni/name/phone), productId, or per-item price.
 * `logo` is the referenced product's *current* public artwork (resolved at
 * request time by the route), omitted when the product has none or no
 * longer exists.
 *
 * A `finalizado` order is closed: tracking exposes only `{ id, status,
 * createdAt }` — no items, no total — so the landing shows a minimal
 * closure screen (`items`/`total` are omitted, not null).
 */
export interface OrderTrackingDTO {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items?: Array<{
    name: string;
    type: string;
    quantity: number;
    size?: string;
    color?: string;
    logoPosition?: string;
    logo?: string;
  }>;
  total?: number;
}

export function toOrderTrackingDTO(
  doc: OrderDocument,
  logoByProductId?: ReadonlyMap<string, string>,
): OrderTrackingDTO {
  if (doc.status === 'finalizado') {
    return {
      id: doc._id,
      status: doc.status,
      createdAt: (doc.createdAt as Date).toISOString(),
    };
  }
  return {
    id: doc._id,
    status: doc.status,
    createdAt: (doc.createdAt as Date).toISOString(),
    items: doc.items.map((item) => {
      const logo = logoByProductId?.get(item.productId);
      return {
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        ...(item.size != null ? { size: item.size } : {}),
        ...(item.color != null ? { color: item.color } : {}),
        ...(item.logoPosition != null ? { logoPosition: item.logoPosition } : {}),
        ...(logo != null ? { logo } : {}),
      };
    }),
    total: doc.total,
  };
}

export function toOrderDTO(doc: OrderDocument): OrderDTO {
  return {
    id: doc._id,
    user: { dni: doc.user.dni, name: doc.user.name, phone: doc.user.phone },
    items: doc.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      type: item.type,
      price: item.price,
      quantity: item.quantity,
      ...(item.size != null ? { size: item.size } : {}),
      ...(item.color != null ? { color: item.color } : {}),
      ...(item.logoPosition != null ? { logoPosition: item.logoPosition } : {}),
    })),
    total: doc.total,
    status: doc.status,
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}
