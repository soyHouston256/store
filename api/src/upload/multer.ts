import fs from 'node:fs';
import path from 'node:path';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../middleware/errorHandler.js';

/** Allowed logo mimetypes mapped to the extension the server assigns (design §4). */
const EXT_BY_MIMETYPE: Record<string, string> = {
  'image/png': '.png',
  'image/svg+xml': '.svg',
};

/**
 * Product ids that may receive uploads. Checked BEFORE multer runs so a
 * hostile id can never influence the on-disk filename (design §4).
 */
export const UPLOAD_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdir(config.uploadDir, { recursive: true }, (err) => cb(err, config.uploadDir));
  },
  filename: (req, file, cb) => {
    // Client filename is discarded entirely; extension comes from the
    // already-validated mimetype and the id from the pre-checked route param.
    const ext = EXT_BY_MIMETYPE[file.mimetype];
    if (!ext) {
      cb(new HttpError('UNSUPPORTED_MEDIA', 'Only PNG and SVG logos are accepted'), '');
      return;
    }
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in EXT_BY_MIMETYPE) {
      cb(null, true);
      return;
    }
    cb(new HttpError('UNSUPPORTED_MEDIA', 'Only PNG and SVG logos are accepted'));
  },
});

/**
 * `upload.single('logo')` with multer errors mapped onto the API envelope:
 * size limit → 413 FILE_TOO_LARGE, any other multer complaint (wrong field
 * name, extra files…) → 400 VALIDATION. multer removes partially written
 * files itself, so a 413 leaves nothing on disk (R4.1).
 */
export function logoUploadSingle(): RequestHandler {
  const single = upload.single('logo');
  return (req, res, next) => {
    single(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          next(new HttpError('FILE_TOO_LARGE', 'Logo must be 200KB or smaller'));
          return;
        }
        next(new HttpError('VALIDATION', `Invalid upload: ${err.message}`, [
          { field: 'logo', message: err.message },
        ]));
        return;
      }
      next(err);
    });
  };
}

/** Resolve a stored `/uploads/...` URL to its on-disk path — basename only, never a client path. */
export function uploadFilePath(logoUrl: string): string {
  return path.join(config.uploadDir, path.basename(logoUrl));
}

/** Delete a file, swallowing (but logging) any error — cleanup must never fail a request. */
export async function bestEffortUnlink(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Could not remove upload "${filePath}":`, err);
    }
  }
}
