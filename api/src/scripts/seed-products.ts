/**
 * Idempotent product seed (NFR-5).
 *
 * Reads the repo-root `products.json` and
 * bulk-upserts them with **$setOnInsert only**: a product that already
 * exists is left completely untouched, so re-running the seed NEVER
 * duplicates products nor overwrites admin edits (name, price, publish
 * state, uploaded logo, likes — nothing is clobbered). Only ids missing
 * from the database are inserted, with seed defaults `type: 'polo'` for
 * legacy rows and `published: true`. Phase 4 (R4.4): new rows also get
 * `slug` (unique against the DB), `cuts` and `soldOut: false`, and the CLI
 * runs `migrateDevhaus()` afterwards so pre-existing rows are backfilled.
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
import { CUTS, LOGO_POSITIONS, PRODUCT_TYPES, Product, cutsFor, logoPositionsFor } from '../models/Product.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN, ensureUniqueSlug, slugify } from '../models/slug.js';
import { migrateDevhaus, type MigrateResult } from './migrate-devhaus.js';

const SeedProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // coerce: kept for robustness against legacy exports with string prices
  price: z.coerce.number().nonnegative(),
  slug: z.string().max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN).optional(),
  cuts: z.array(z.enum(CUTS)).max(CUTS.length).optional(),
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

export interface SeedAndMigrateResult extends SeedResult {
  migration: MigrateResult;
}

/**
 * Upsert seed items. $setOnInsert-only: existing docs are never modified.
 * Slugs are resolved against the slugs already stored (plus the batch
 * itself) so the insert never trips the unique index.
 */
export async function seedProducts(items: SeedProduct[]): Promise<SeedResult> {
  const parsed = items.map((item) => SeedProductSchema.parse(item));
  const existing = (await Product.distinct('slug')) as unknown[];
  const taken = new Set(existing.filter((slug): slug is string => typeof slug === 'string'));
  const result = await Product.bulkWrite(
    parsed.map((p) => {
      const type = p.type ?? 'polo';
      return {
        updateOne: {
          filter: { _id: p.id },
          update: {
            $setOnInsert: {
              name: p.name,
              price: p.price,
              ...(p.image !== undefined ? { image: p.image } : {}),
              colors: p.colors ?? [],
              sizes: p.sizes ?? [],
              logoPositions: logoPositionsFor(type, p.logoPositions),
              likes: p.likes ?? 0,
              type,
              published: true,
              slug: ensureUniqueSlug(p.slug ?? slugify(p.name), taken),
              cuts: cutsFor(type, p.cuts),
              soldOut: false,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: false },
  );
  return {
    inserted: result.upsertedCount,
    skippedExisting: parsed.length - result.upsertedCount,
  };
}

/** Seed, then backfill phase-4 fields on rows that predate them (R4.4). */
export async function seedAndMigrate(items: SeedProduct[]): Promise<SeedAndMigrateResult> {
  const seed = await seedProducts(items);
  const migration = await migrateDevhaus();
  return { ...seed, migration };
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
    const { inserted, skippedExisting, migration } = await seedAndMigrate(items);
    console.log(
      `Seeded from ${file}: ${inserted} inserted, ${skippedExisting} already present (left untouched).`,
    );
    console.log(
      `migrate-devhaus: cuts set on ${migration.cutsSet}, soldOut set on ${migration.soldOutSet}, slug set on ${migration.slugsSet} product(s).`,
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
