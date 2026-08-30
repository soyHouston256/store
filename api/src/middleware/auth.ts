import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './errorHandler.js';

/**
 * Bearer-token guard for `/api/admin/*` (R2.2). Missing, malformed,
 * expired and bad-signature tokens are indistinguishable to the caller:
 * every failure is the same 401 UNAUTHORIZED envelope.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    next(new HttpError('UNAUTHORIZED', 'Authentication required'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    next();
  } catch {
    next(new HttpError('UNAUTHORIZED', 'Authentication required'));
  }
};
