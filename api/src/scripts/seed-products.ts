/**
 * Idempotent product seed (NFR-5).
 *
 * Reads the repo-root `products.json` and
 * bulk-upserts them with **$setOnInsert only**: a product that already
 * exists is left completely untouched, so re-running the seed NEVER
 * duplicates products nor overwrites admin edits (name, price, publish
 * state, uploaded logo, likes — nothing is clobbered). Only ids missing
 * from the database are inserted, with seed defaults `type: 'polo'` for
 * legacy rows and `published: true`.
 *
 * Note: this deliberately uses $setOnInsert where design §3 sketched
 * $set — $set would clobber admin edits on every re-run, violating NFR-5.
 *
 * Usage:
 *   node dist/scripts/seed-products.js [path/to/products.json]
 *   (dev) npx tsx src/scripts/seed-products.ts [path/to/products.json]
 * Requires MONGO_URI. Optional SEED_FILE overrides the default path.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { z } from 'zod';
import { LOGO_POSITIONS, PRODUCT_TYPES, Product, logoPositionsFor } from '../models/Product.js';

const SeedProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // coerce: the legacy Firestore export holds one price as a string ("60")
  price: z.coerce.number().nonnegative(),
  image: z.string().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  logoPositions: z.array(z.enum(LOGO_POSITIONS)).optional(),
  likes: z.coerce.number().int().nonnegative().optional(),
  type: z.enum(PRODUCT_TYPES).optional(),
});

export type SeedProduct = z.input<typeof SeedProductSchema>;

export interface SeedResult {
  inserted: number;
  skippedExisting: number;
}

/**
 * Upsert seed items. $setOnInsert-only: existing docs are never modified.
 */
export async function seedProducts(items: SeedProduct[]): Promise<SeedResult> {
  const parsed = items.map((item) => SeedProductSchema.parse(item));
  const result = await Product.bulkWrite(
    parsed.map((p) => ({
      updateOne: {
        filter: { _id: p.id },
        update: {
          $setOnInsert: {
            name: p.name,
            price: p.price,
            ...(p.image !== undefined ? { image: p.image } : {}),
            colors: p.colors ?? [],
            sizes: p.sizes ?? [],
            logoPositions: logoPositionsFor(p.type ?? 'polo', p.logoPositions),
            likes: p.likes ?? 0,
            type: p.type ?? 'polo',
            published: true,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
  return {
    inserted: result.upsertedCount,
    skippedExisting: parsed.length - result.upsertedCount,
  };
}

/** Default seed source: repo-root products.json (../../.. from src|dist /scripts). */
export function defaultSeedFile(): string {
  return fileURLToPath(new URL('../../../products.json', import.meta.url));
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }
  const file = process.argv[2] ?? process.env.SEED_FILE ?? defaultSeedFile();
  const items = JSON.parse(await readFile(file, 'utf8')) as SeedProduct[];

  await mongoose.connect(mongoUri);
  try {
    const { inserted, skippedExisting } = await seedProducts(items);
    console.log(
      `Seeded from ${file}: ${inserted} inserted, ${skippedExisting} already present (left untouched).`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

// Run only when executed directly (not when imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
