import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError, asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Compared against whenever the username is unknown, so a wrong username
 * costs the same bcrypt work as a wrong password (flat timing, NFR-6/R2.1).
 * Never matches: it hashes a random value nobody can submit.
 */
const DUMMY_HASH = bcrypt.hashSync(`dummy-${Date.now()}-${Math.random()}`, 12);

// POST /api/auth/login — single env-configured admin (R2.1)
authRouter.post(
  '/login',
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof LoginSchema>;

    const userMatches = username === config.adminUser;
    const hash = userMatches ? config.adminPasswordHash : DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(password, hash);

    if (!userMatches || !passwordMatches) {
      // One generic message — never reveal which field failed.
      throw new HttpError('UNAUTHORIZED', 'Invalid credentials');
    }

    const token = jwt.sign({ sub: 'admin', role: 'admin' }, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    });
    res.json({ token, expiresIn: config.jwtExpiresIn });
  }),
);
