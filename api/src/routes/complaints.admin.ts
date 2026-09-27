import { Router } from 'express';
import { isValidObjectId, type FilterQuery } from 'mongoose';
import { z } from 'zod';
import {
  COMPLAINT_STATUSES,
  Complaint,
  toComplaintDTO,
  type ComplaintAttrs,
} from '../models/Complaint.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const complaintsAdminRouter = Router();

// Every admin endpoint is JWT-guarded, same as orders.admin.
complaintsAdminRouter.use(requireAuth);

const StatusEnum = z.enum(COMPLAINT_STATUSES);
const StatusPatchSchema = z.object({ status: StatusEnum });

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

const ListQuerySchema = z.object({
  status: StatusEnum.optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  /** ISO `createdAt` of the last row seen — returns strictly older rows. */
  cursor: z
    .string()
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

function queryError(issues: z.ZodIssue[]): HttpError {
  return new HttpError(
    'VALIDATION',
    'Invalid query',
    issues.map((issue) => ({ field: issue.path.join('.') || '(query)', message: issue.message })),
  );
}

/** Unknown / malformed ids read as "not found" instead of a CastError 500. */
async function findComplaintOr404(id: string) {
  const complaint = isValidObjectId(id) ? await Complaint.findById(id) : null;
  if (!complaint) throw new HttpError('NOT_FOUND', 'Complaint not found');
  return complaint;
}

// GET /api/admin/complaints?status=&limit=&cursor= — newest first, cursor paginated (C7)
complaintsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = ListQuerySchema.safeParse(req.query);
    if (!parsed.success) throw queryError(parsed.error.issues);
    const { status, limit, cursor } = parsed.data;

    const filter: FilterQuery<ComplaintAttrs> = {};
    if (status) filter.status = status;
    if (cursor) filter.createdAt = { $lt: cursor };

    const complaints = await Complaint.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit);
    res.json(complaints.map(toComplaintDTO));
  }),
);

// GET /api/admin/complaints/:id
complaintsAdminRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const complaint = await findComplaintOr404(req.params.id ?? '');
    res.json(toComplaintDTO(complaint));
  }),
);

// PATCH /api/admin/complaints/:id/status — nuevo ⇄ atendido (no workflow constraints)
complaintsAdminRouter.patch(
  '/:id/status',
  validate(StatusPatchSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body as z.infer<typeof StatusPatchSchema>;
    const id = req.params.id ?? '';
    await findComplaintOr404(id);
    const updated = await Complaint.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!updated) throw new HttpError('NOT_FOUND', 'Complaint not found');
    res.json(toComplaintDTO(updated));
  }),
);
