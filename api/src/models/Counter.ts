import { Schema, model } from 'mongoose';

/**
 * Atomic named sequences (design §5.1). One document per key, e.g.
 * `complaints-2026`; `nextSequence` is a single `findOneAndUpdate` with
 * `$inc` + `upsert`, so concurrent callers never observe the same value
 * and a new key (new year) starts at 1.
 */
const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { _id: false, versionKey: false },
);

export const Counter = model('Counter', CounterSchema);

export async function nextSequence(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
}
