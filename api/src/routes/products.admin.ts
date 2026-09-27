import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { CUTS, LOGO_POSITIONS, PRODUCT_TYPES, Product, cutsFor, logoPositionsFor, toProductDTO } from '../models/Product.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN, ensureUniqueSlug, slugify } from '../models/slug.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UPLOAD_ID_PATTERN, bestEffortUnlink, logoUploadSingle, uploadFilePath } from '../upload/multer.js';
import { validateLogoContent } from '../upload/logoStorage.js';

export const productsAdminRouter = Router();

// Every admin endpoint is JWT-guarded (R2.2).
productsAdminRouter.use(requireAuth);

/** ProductWriteDTO (design §2). zod strips unknown keys, so likes/logo/published in a body are ignored. */
const ProductWriteSchema = z.object({
  name: z.string().trim().min(1).max(80),
  price: z.number().finite().positive(),
  type: z.enum(PRODUCT_TYPES),
  colors: z.array(z.string().regex(/^#([0-9a-f]{3,8})$/i, 'Must be a hex color like #fff')).max(12).optional(),
  sizes: z.array(z.string().min(1).max(4)).max(8).optional(),
  logoPositions: z.array(z.enum(LOGO_POSITIONS)).max(LOGO_POSITIONS.length).optional(),
  // Phase 4 (R4.1 / C8): optional on write — POST generates it from `name`,
  // PUT keeps the stored one when omitted.
  slug: z
    .string()
    .trim()
    .min(1)
    .max(SLUG_MAX_LENGTH)
    .regex(SLUG_PATTERN, 'Use lowercase letters, digits and single hyphens')
    .optional(),
  cuts: z.array(z.enum(CUTS)).max(CUTS.length).optional(),
  soldOut: z.boolean().optional(),
}).superRefine((product, ctx) => {
  if (product.type === 'polo' && product.logoPositions?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['logoPositions'],
      message: 'Select at least one logo position',
    });
  }
  if (product.type === 'polo' && product.cuts?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cuts'],
      message: 'Select at least one cut',
    });
  }
  if (product.cuts && new Set(product.cuts).size !== product.cuts.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cuts'], message: 'Cuts must be unique' });
  }
});

type ProductWriteDTO = z.infer<typeof ProductWriteSchema>;

const PublishSchema = z.object({ published: z.boolean() });

const writableLogoPositions = (body: ProductWriteDTO) => logoPositionsFor(body.type, body.logoPositions);
// Non-polos are forced to `[]`; a polo without cuts defaults to ['hombre'].
const writableCuts = (body: ProductWriteDTO) => cutsFor(body.type, body.cuts);

const slugConflict = () =>
  new HttpError('CONFLICT', 'Slug already in use', [{ field: 'slug', message: 'Slug already in use' }]);

/** Mongo duplicate-key error (the partial unique index on `slug`). */
const isDuplicateKey = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;

/** 409 when another product (not `selfId`) already owns `slug`. */
async function assertSlugFree(slug: string, selfId?: string): Promise<void> {
  const owner = await Product.exists({ slug, ...(selfId !== undefined ? { _id: { $ne: selfId } } : {}) });
  if (owner) throw slugConflict();
}

/** Free slug derived from the product name, suffixed `-2`, `-3`… on collision. */
async function generateSlug(name: string): Promise<string> {
  const existing = (await Product.distinct('slug')) as unknown[];
  const taken = new Set(existing.filter((slug): slug is string => typeof slug === 'string'));
  return ensureUniqueSlug(slugify(name), taken);
}

// GET /api/admin/products — ALL products, unpublished included (R3 preamble)
productsAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const products = await Product.find({}).sort({ name: 1 });
    res.json(products.map(toProductDTO));
  }),
);

// GET /api/admin/products/:id
productsAdminRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError('NOT_FOUND', 'Product not found');
    res.json(toProductDTO(product));
  }),
);

// POST /api/admin/products — server id, draft by default (R3.1)
productsAdminRouter.post(
  '/',
  validate(ProductWriteSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ProductWriteDTO;
    let slug: string;
    if (body.slug !== undefined) {
      await assertSlugFree(body.slug);
      slug = body.slug;
    } else {
      slug = await generateSlug(body.name);
    }
    try {
      const product = await Product.create({
        _id: randomUUID(),
        name: body.name,
        price: body.price,
        type: body.type,
        colors: body.colors ?? [],
        sizes: body.sizes ?? [],
        logoPositions: writableLogoPositions(body),
        slug,
        cuts: writableCuts(body),
        soldOut: body.soldOut ?? false,
        likes: 0,
        published: false,
      });
      res.status(201).json(toProductDTO(product));
    } catch (err) {
      // Race between the pre-check and the insert: the unique index wins.
      if (isDuplicateKey(err)) throw slugConflict();
      throw err;
    }
  }),
);

// PUT /api/admin/products/:id — full replace of the writable fields;
// never touches likes, logo or published (R3.2)
productsAdminRouter.put(
  '/:id',
  validate(ProductWriteSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ProductWriteDTO;
    if (body.slug !== undefined) await assertSlugFree(body.slug, req.params.id);
    try {
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: body.name,
            price: body.price,
            type: body.type,
            colors: body.colors ?? [],
            sizes: body.sizes ?? [],
            logoPositions: writableLogoPositions(body),
            cuts: writableCuts(body),
            // Omitted → keep the stored value (slug); soldOut defaults to false.
            ...(body.slug !== undefined ? { slug: body.slug } : {}),
            soldOut: body.soldOut ?? false,
          },
        },
        { new: true, runValidators: true },
      );
      if (!updated) throw new HttpError('NOT_FOUND', 'Product not found');
      res.json(toProductDTO(updated));
    } catch (err) {
      if (isDuplicateKey(err)) throw slugConflict();
      throw err;
    }
  }),
);

// DELETE /api/admin/products/:id — 204; logo file unlinked best-effort (R3.3)
productsAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) throw new HttpError('NOT_FOUND', 'Product not found');
    if (deleted.logo) await bestEffortUnlink(uploadFilePath(deleted.logo));
    res.status(204).end();
  }),
);

// PATCH /api/admin/products/:id/publish — set published (R3.4)
productsAdminRouter.patch(
  '/:id/publish',
  validate(PublishSchema),
  asyncHandler(async (req, res) => {
    const { published } = req.body as z.infer<typeof PublishSchema>;
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: { published } }, { new: true });
    if (!updated) throw new HttpError('NOT_FOUND', 'Product not found');
    res.json(toProductDTO(updated));
  }),
);

// POST /api/admin/products/:id/logo — multipart field "logo" (R4.1, design §4)
productsAdminRouter.post(
  '/:id/logo',
  // Id format gate BEFORE multer runs: the id becomes part of the filename.
  (req, _res, next) => {
    if (!UPLOAD_ID_PATTERN.test(req.params.id ?? '')) {
      next(new HttpError('NOT_FOUND', 'Product not found'));
      return;
    }
    next();
  },
  logoUploadSingle(),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new HttpError('VALIDATION', 'Missing "logo" file field', [
        { field: 'logo', message: 'A PNG or SVG file is required' },
      ]);
    }

    // Content sniff after write: PNG magic bytes / SVG root element (R4.1).
    if (!(await validateLogoContent(file.path, file.mimetype))) {
      await bestEffortUnlink(file.path);
      throw new HttpError('UNSUPPORTED_MEDIA', 'File content does not match an allowed logo format');
    }

    const logoUrl = `/uploads/${file.filename}`;
    // new:false → we get the PREVIOUS doc, whose old logo we clean up.
    const previous = await Product.findByIdAndUpdate(req.params.id, { $set: { logo: logoUrl } }, { new: false });
    if (!previous) {
      await bestEffortUnlink(file.path);
      throw new HttpError('NOT_FOUND', 'Product not found');
    }
    if (previous.logo && previous.logo !== logoUrl) {
      await bestEffortUnlink(uploadFilePath(previous.logo));
    }

    previous.logo = logoUrl;
    res.json(toProductDTO(previous));
  }),
);
