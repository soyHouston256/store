import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

export type ErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA'
  | 'INTERNAL';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA: 415,
  INTERNAL: 500,
};

/** Error carrying the API error envelope: `{ error: { code, message, details? } }`. */
export class HttpError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

/** Express 4 does not forward rejected promises — wrap async handlers. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/** 404 envelope for unknown routes. */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError('NOT_FOUND', 'Resource not found'));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Malformed JSON body' } });
    return;
  }

  // http-errors thrown by express internals (e.g. express.static rejects
  // `..` traversal with 403 ForbiddenError). Map 4xx onto the envelope:
  // 403 becomes 404 so a traversal attempt is indistinguishable from a
  // missing file (R4.2); other 4xx surface as VALIDATION.
  const status = (err as { statusCode?: unknown }).statusCode ?? (err as { status?: unknown }).status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    if (status === 403 || status === 404) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
      return;
    }
    res.status(status).json({ error: { code: 'VALIDATION', message: 'Invalid request' } });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
};
