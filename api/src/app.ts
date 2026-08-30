import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { productsPublicRouter } from './routes/products.public.js';
import { ordersPublicRouter } from './routes/orders.public.js';
import { authRouter } from './routes/auth.js';
import { productsAdminRouter } from './routes/products.admin.js';
import { ordersAdminRouter } from './routes/orders.admin.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(): express.Express {
  const app = express();

  // NFR-4: exact-match allowlist from CORS_ORIGINS; other origins get no grant.
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());

  // Uploaded logos (R4.2/NFR-1): CSP sandbox neutralizes script-bearing SVGs,
  // nosniff pins the served type, immutable cache is safe because filenames
  // are unique per upload. express.static rejects `..` traversal itself; the
  // errorHandler maps that rejection onto the 404 envelope.
  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      setHeaders: (res) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }),
  );

  app.use('/api/products', productsPublicRouter);
  app.use('/api/orders', ordersPublicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin/products', productsAdminRouter);
  app.use('/api/admin/orders', ordersAdminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
