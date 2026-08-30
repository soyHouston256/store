import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { HttpError } from './errorHandler.js';

/**
 * zod-driven request-body validation. On failure responds
 * 400 `VALIDATION` with `details` naming each offending field (R3.1 shape).
 * On success replaces `req.body` with the parsed (stripped) value, so
 * unknown/tampered fields (e.g. a client-sent `total`) never reach handlers.
 */
export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(body)',
        message: issue.message,
      }));
      next(new HttpError('VALIDATION', 'Invalid request body', details));
      return;
    }
    req.body = result.data;
    next();
  };
}
