import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { LOGO_POSITIONS, PRODUCT_TYPES, Product, logoPositionsFor, toProductDTO } from '../models/Product.js';
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
}).superRefine((product, ctx) => {
  if (product.type === 'polo' && product.logoPositions?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['logoPositions'],
      message: 'Select at least one logo position',
    });
  }
});

type ProductWriteDTO = z.infer<typeof ProductWriteSchema>;

const PublishSchema = z.object({ published: z.boolean() });

const writableLogoPositions = (body: ProductWriteDTO) => logoPositionsFor(body.type, body.logoPositions);

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
    const product = await Product.create({
      _id: randomUUID(),
      name: body.name,
      price: body.price,
      type: body.type,
      colors: body.colors ?? [],
      sizes: body.sizes ?? [],
      logoPositions: writableLogoPositions(body),
      likes: 0,
      published: false,
    });
    res.status(201).json(toProductDTO(product));
  }),
);

// PUT /api/admin/products/:id — full replace of the writable fields;
// never touches likes, logo or published (R3.2)
productsAdminRouter.put(
  '/:id',
  validate(ProductWriteSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ProductWriteDTO;
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
        },
      },
      { new: true, runValidators: true },
    );
    if (!updated) throw new HttpError('NOT_FOUND', 'Product not found');
    res.json(toProductDTO(updated));
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
