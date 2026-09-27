/**
 * devhaus phase-4 data migration (spec R4.4, design §7.2). Idempotent and
 * additive: it only fills fields that are missing, so re-running it is a
 * no-op (`{ cutsSet: 0, soldOutSet: 0, slugsSet: 0 }`).
 *
 *   1. `cuts`: `['hombre']` for polos (and legacy rows without `type`,
 *      which the schema reads as polo), `[]` for every other type.
 *   2. `soldOut: false` where missing.
 *   3. `slug` generated from `name` for rows without one, in
 *      `createdAt asc, _id asc` order, collisions suffixed `-2`, `-3`…
 *      against the slugs already stored.
 *   4. Partial unique index `slug_1` (same spec as the mongoose schema).
 *
 * Rollback (`--down`): `$unset` the three fields and drop `slug_1`.
 *
 * Usage:
 *   node dist/scripts/migrate-devhaus.js [--down]
 *   (dev) npx tsx src/scripts/migrate-devhaus.ts [--down]
 *   npm run migrate:devhaus [-- --down]
 * Requires MONGO_URI.
 */
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import type { AnyBulkWriteOperation } from 'mongoose';
import { Product } from '../models/Product.js';
import { ensureUniqueSlug, slugify } from '../models/slug.js';

export const SLUG_INDEX_NAME = 'slug_1';

export interface MigrateResult {
  cutsSet: number;
  soldOutSet: number;
  slugsSet: number;
}

export interface RollbackResult {
  unset: number;
  indexDropped: boolean;
}

/** Product documents are read raw so schema defaults never mask missing fields. */
const collection = () => Product.collection;

export async function migrateDevhaus(): Promise<MigrateResult> {
  const col = collection();

  // 1. cuts — a row without `type` is a legacy polo (schema default).
  const polos = await col.updateMany(
    { $or: [{ type: 'polo' }, { type: { $exists: false } }], cuts: { $exists: false } },
    { $set: { cuts: ['hombre'] } },
  );
  const others = await col.updateMany(
    { type: { $exists: true, $ne: 'polo' }, cuts: { $exists: false } },
    { $set: { cuts: [] } },
  );

  // 2. soldOut
  const soldOut = await col.updateMany({ soldOut: { $exists: false } }, { $set: { soldOut: false } });

  // 3. slug backfill
  const existing = (await col.distinct('slug', { slug: { $type: 'string' } })) as unknown[];
  const taken = new Set(existing.filter((slug): slug is string => typeof slug === 'string'));
  const missing = await col
    .find<{ _id: string; name?: string }>(
      { $or: [{ slug: { $exists: false } }, { slug: { $not: { $type: 'string' } } }] },
      { projection: { _id: 1, name: 1 }, sort: { createdAt: 1, _id: 1 } },
    )
    .toArray();

  const ops: AnyBulkWriteOperation[] = missing.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { slug: ensureUniqueSlug(slugify(doc.name ?? ''), taken) } },
    },
  }));
  let slugsSet = 0;
  if (ops.length) {
    const result = await col.bulkWrite(ops as never, { ordered: true });
    slugsSet = result.modifiedCount;
  }

  // 4. unique index — identical options to the schema's index so mongoose's
  // autoIndex and this call agree (createIndex is idempotent for equal specs).
  await col.createIndex(
    { slug: 1 },
    { unique: true, partialFilterExpression: { slug: { $type: 'string' } }, name: SLUG_INDEX_NAME },
  );

  return {
    cutsSet: polos.modifiedCount + others.modifiedCount,
    soldOutSet: soldOut.modifiedCount,
    slugsSet,
  };
}

export async function rollbackDevhaus(): Promise<RollbackResult> {
  const col = collection();
  const result = await col.updateMany(
    { $or: [{ cuts: { $exists: true } }, { slug: { $exists: true } }, { soldOut: { $exists: true } }] },
    { $unset: { cuts: '', slug: '', soldOut: '' } },
  );
  let indexDropped = false;
  try {
    await col.dropIndex(SLUG_INDEX_NAME);
    indexDropped = true;
  } catch (err) {
    // 27 = IndexNotFound (already rolled back) — anything else is real.
    if ((err as { code?: unknown }).code !== 27 && (err as { codeName?: unknown }).codeName !== 'IndexNotFound') {
      throw err;
    }
  }
  return { unset: result.modifiedCount, indexDropped };
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }
  const down = process.argv.includes('--down');

  await mongoose.connect(mongoUri);
  try {
    if (down) {
      const { unset, indexDropped } = await rollbackDevhaus();
      console.log(
        `migrate-devhaus --down: unset cuts/slug/soldOut on ${unset} product(s); index ${SLUG_INDEX_NAME} ${
          indexDropped ? 'dropped' : 'was not present'
        }.`,
      );
    } else {
      const { cutsSet, soldOutSet, slugsSet } = await migrateDevhaus();
      console.log(
        `migrate-devhaus: cuts set on ${cutsSet}, soldOut set on ${soldOutSet}, slug set on ${slugsSet} product(s); index ${SLUG_INDEX_NAME} ensured.`,
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Run only when executed directly (not when imported by the seed or tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
