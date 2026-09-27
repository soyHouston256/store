import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const PRODUCT_TYPES = ['polo', 'taza', 'mousepad'] as const;
export type ProductKind = (typeof PRODUCT_TYPES)[number];

export const LOGO_POSITIONS = ['pocket', 'chest', 'back', 'front-back'] as const;
export type LogoPosition = (typeof LOGO_POSITIONS)[number];

/** Polo cuts (spec 04 / R4.1). Non-polo products always have `cuts: []`. */
export const CUTS = ['hombre', 'mujer'] as const;
export type Cut = (typeof CUTS)[number];

const cutSet = new Set<string>(CUTS);

/**
 * Normalizes a product's cuts: non-polos never have cuts; a polo without an
 * explicit (valid) selection defaults to `['hombre']`. Duplicates and unknown
 * values are dropped; order of first appearance is kept.
 */
export function cutsFor(type: ProductKind | undefined, cuts?: readonly string[] | null): Cut[] {
  if ((type ?? 'polo') !== 'polo') return [];
  const valid = (cuts ?? []).filter((cut): cut is Cut => cutSet.has(cut));
  return valid.length ? [...new Set(valid)] : ['hombre'];
}

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
    // Phase 4 (R4.1): public URL handle. Optional at the schema level so
    // pre-migration documents still hydrate; `migrate-devhaus` backfills it.
    slug: { type: String, trim: true, lowercase: true },
    cuts: { type: [{ type: String, enum: CUTS }], default: undefined },
    soldOut: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false },
);

// Unique only among documents that actually carry a slug, so legacy rows
// (and the migration's backfill) never collide on a missing field.
// Must stay identical to `migrate-devhaus.ts` step 4 (same name `slug_1`).
ProductSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string' } } });

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
  /**
   * URL handle for `/producto/:slug` and `GET /api/products/:idOrSlug`.
   * Pre-migration documents without a stored slug are served with their
   * `_id` here (the lookup route resolves both), so the field is always a
   * usable, non-empty string.
   */
  slug: string;
  /** `[]` for non-polos; polos default to `['hombre']`. */
  cuts: Cut[];
  soldOut: boolean;
  /** ISO 8601. Storefront sorts "Novedades" by it and shows the "Nuevo" badge (< 30 days). */
  createdAt: string;
  image?: string;
  logo?: string;
}

/**
 * Legacy documents inserted raw (pre-`timestamps`) carry no `createdAt`;
 * they are served as the Unix epoch so the field is always present and
 * parseable (spec R3.2) and they sort last under "Novedades".
 */
const EPOCH_ISO = new Date(0).toISOString();

export function toProductDTO(doc: ProductDocument): ProductDTO {
  const createdAt = doc.createdAt instanceof Date && !Number.isNaN(doc.createdAt.getTime())
    ? doc.createdAt.toISOString()
    : EPOCH_ISO;
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
    slug: doc.slug || doc._id,
    cuts: cutsFor(doc.type, doc.cuts),
    soldOut: doc.soldOut ?? false,
    createdAt,
    ...(doc.image != null ? { image: doc.image } : {}),
    ...(doc.logo != null ? { logo: doc.logo } : {}),
  };
}
