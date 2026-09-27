import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import {
  CLAIM_TYPES,
  Complaint,
  DOC_TYPES,
  ITEM_KINDS,
  counterKeyFor,
  formatCode,
} from '../models/Complaint.js';
import { nextSequence } from '../models/Counter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { rateLimit, type RateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { SMTP_NOT_CONFIGURED, sendComplaintEmail, type Mailer } from '../mail/mailer.js';

/** Rate-limit window for the public endpoint: `COMPLAINTS_RATE_LIMIT` per 60 min (C5). */
export const COMPLAINTS_WINDOW_MS = 60 * 60 * 1000;

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} es obligatorio` })
    .trim()
    .min(min, `${label} debe tener al menos ${min} caracteres`)
    .max(max, `${label} debe tener como máximo ${max} caracteres`);

/** Empty strings / null from the form count as "not provided" for optional fields. */
const blankToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

/**
 * ComplaintCreateDTO (spec R2b.1 validation, design/C4 field names). zod
 * strips unknown keys; `status`, `emailSent`, `code` and `ip` are never
 * client-writable.
 */
export const ComplaintCreateSchema = z
  .object({
    consumer: z.object({
      name: trimmed(2, 120, 'El nombre'),
      docType: z.enum(DOC_TYPES, { errorMap: () => ({ message: 'Tipo de documento inválido' }) }),
      docNumber: z
        .string({ required_error: 'El número de documento es obligatorio' })
        .trim()
        .regex(/^[A-Za-z0-9]{6,20}$/, 'El número de documento debe tener de 6 a 20 letras o dígitos'),
      email: z
        .string({ required_error: 'El correo es obligatorio' })
        .trim()
        .email('Ingresa un correo válido')
        .max(120, 'El correo debe tener como máximo 120 caracteres'),
      phone: trimmed(6, 20, 'El teléfono'),
      address: trimmed(5, 200, 'El domicilio'),
      isMinor: z.boolean().default(false),
    }),
    guardianName: z.preprocess(blankToUndefined, trimmed(2, 120, 'El nombre del apoderado').optional()),
    item: z.object({
      kind: z.enum(ITEM_KINDS, { errorMap: () => ({ message: 'Tipo de bien inválido' }) }),
      description: trimmed(3, 200, 'La descripción'),
      amount: z.preprocess(
        blankToUndefined,
        z
          .number({ invalid_type_error: 'El monto debe ser un número' })
          .nonnegative('El monto no puede ser negativo')
          .optional(),
      ),
    }),
    claim: z.object({
      type: z.enum(CLAIM_TYPES, { errorMap: () => ({ message: 'Elige reclamo o queja' }) }),
      detail: trimmed(20, 2000, 'El detalle'),
      request: trimmed(5, 1000, 'El pedido'),
    }),
    orderId: z.preprocess(
      blankToUndefined,
      z
        .string()
        .trim()
        .regex(/^[A-Z0-9]{8}$/, 'El código de pedido tiene 8 letras mayúsculas o dígitos')
        .optional(),
    ),
    acceptsTerms: z.literal(true, {
      errorMap: () => ({ message: 'Debes declarar que la información es veraz' }),
    }),
  })
  .superRefine((body, ctx) => {
    if (body.consumer.isMinor && !body.guardianName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guardianName'],
        message: 'El nombre del apoderado es obligatorio para menores de edad',
      });
    }
  });

export type ComplaintCreateDTO = z.infer<typeof ComplaintCreateSchema>;

export interface ComplaintsPublicDeps {
  /** `null` when SMTP is not configured (complaints stored with `emailSent: false`). */
  mailer: Mailer | null;
  limiter?: RateLimiter;
  /** Injectable clock: decides the correlativo's year. */
  now?: () => Date;
}

export function createComplaintsPublicRouter({
  mailer,
  limiter = rateLimit({ windowMs: COMPLAINTS_WINDOW_MS, max: config.complaints.rateLimit }),
  now = () => new Date(),
}: ComplaintsPublicDeps): Router {
  const router = Router();

  // POST /api/complaints — validate → rate limit → correlativo → persist → email (best effort) → 201
  // The limiter runs AFTER validation so only well-formed submissions consume
  // quota: a consumer fixing form errors must not get locked out for 60 min.
  router.post(
    '/',
    validate(ComplaintCreateSchema),
    limiter,
    asyncHandler(async (req, res) => {
      const body = req.body as ComplaintCreateDTO;
      const year = now().getFullYear();
      const seq = await nextSequence(counterKeyFor(year));
      const code = formatCode(config.complaints.codePrefix, year, seq);

      const complaint = await Complaint.create({
        code,
        consumer: body.consumer,
        ...(body.consumer.isMinor && body.guardianName ? { guardianName: body.guardianName } : {}),
        item: body.item,
        claim: body.claim,
        ...(body.orderId ? { orderId: body.orderId } : {}),
        ...(req.ip ? { ip: req.ip } : {}),
      });

      let emailSent = false;
      if (mailer) {
        emailSent = await sendComplaintEmail(mailer, complaint);
        if (emailSent) {
          complaint.emailSent = true;
          await complaint.save();
        }
      } else {
        console.warn(`${SMTP_NOT_CONFIGURED}; ${code} stored without email`);
      }

      res.status(201).json({
        id: complaint._id.toString(),
        code,
        createdAt: (complaint.createdAt as Date).toISOString(),
        emailSent,
      });
    }),
  );

  return router;
}
