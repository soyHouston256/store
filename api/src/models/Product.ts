import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const PRODUCT_TYPES = ['polo', 'taza', 'mousepad'] as const;
export type ProductKind = (typeof PRODUCT_TYPES)[number];

export const LOGO_POSITIONS = ['pocket', 'chest', 'back', 'front-back'] as const;
export type LogoPosition = (typeof LOGO_POSITIONS)[number];

const logoPositionSet = new Set<string>(LOGO_POSITIONS);

export function logoPositionsFor(type: ProductKind | undefined, positions?: readonly string[] | null): LogoPosition[] {
  if ((type ?? 'polo') !== 'polo') return [];
  const valid = (positions ?? []).filter((position): position is LogoPosition => logoPositionSet.has(position));
  return valid.length ? [...new Set(valid)] : [...LOGO_POSITIONS];
}

/**
 * `_id` is an explicit String path (Firestore-era ids like
 * "0utzWxB9wGfCW1G7P9JI" are preserved as-is); the `_id: false` schema
 * option stops mongoose from adding its default ObjectId `_id` (design §3).
 */
const ProductSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: PRODUCT_TYPES, required: true, default: 'polo' },
    image: { type: String }, // legacy Firebase Storage URL (read-only)
    logo: { type: String }, // "/uploads/<file>"
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    logoPositions: { type: [{ type: String, enum: LOGO_POSITIONS }], default: undefined },
    likes: { type: Number, default: 0, min: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false },
);

export type ProductAttrs = InferSchemaType<typeof ProductSchema>;
export type ProductDocument = HydratedDocument<ProductAttrs>;

export const Product = model('Product', ProductSchema);

/** Response shape used by every product endpoint (design §2 `ProductDTO`). */
export interface ProductDTO {
  id: string;
  name: string;
  price: number;
  type: ProductKind;
  colors: string[];
  sizes: string[];
  logoPositions: LogoPosition[];
  likes: number;
  published: boolean;
  image?: string;
  logo?: string;
}

export function toProductDTO(doc: ProductDocument): ProductDTO {
  return {
    id: doc._id,
    name: doc.name,
    price: doc.price,
    type: doc.type,
    colors: doc.colors ?? [],
    sizes: doc.sizes ?? [],
    logoPositions: logoPositionsFor(doc.type, doc.logoPositions),
    likes: doc.likes ?? 0,
    published: doc.published ?? false,
    ...(doc.image != null ? { image: doc.image } : {}),
    ...(doc.logo != null ? { logo: doc.logo } : {}),
  };
}
