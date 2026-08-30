import { Router } from 'express';
import { z } from 'zod';
import { Product, toProductDTO } from '../models/Product.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';

export const productsPublicRouter = Router();

// GET /api/products — published only, sorted by name (R1.1)
productsPublicRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const products = await Product.find({ published: true }).sort({ name: 1 });
    res.json(products.map(toProductDTO));
  }),
);

// GET /api/products/:id — 404 for unknown AND unpublished (R1.2)
productsPublicRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, published: true });
    if (!product) throw new HttpError('NOT_FOUND', 'Product not found');
    res.json(toProductDTO(product));
  }),
);

const LikeSchema = z.object({
  delta: z.union([z.literal(1), z.literal(-1)]),
});

// POST /api/products/:id/like — atomic $inc with a floor at 0 (R1.3)
productsPublicRouter.post(
  '/:id/like',
  validate(LikeSchema),
  asyncHandler(async (req, res) => {
    const { delta } = req.body as z.infer<typeof LikeSchema>;
    const id = req.params.id;

    const updated = await Product.findOneAndUpdate(
      {
        _id: id,
        published: true,
        // Floor at 0: an unlike only matches while likes > 0, so the
        // decrement is atomic and can never drive the counter negative.
        ...(delta < 0 ? { likes: { $gt: 0 } } : {}),
      },
      { $inc: { likes: delta } },
      { new: true },
    );

    if (updated) {
      res.json({ id: updated._id, likes: updated.likes });
      return;
    }

    if (delta < 0) {
      // The filter may have failed only because likes was already 0.
      const existing = await Product.findOne({ _id: id, published: true });
      if (existing) {
        res.json({ id: existing._id, likes: existing.likes });
        return;
      }
    }

    throw new HttpError('NOT_FOUND', 'Product not found');
  }),
);
