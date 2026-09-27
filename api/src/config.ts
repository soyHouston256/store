/**
 * Typed environment configuration. Fails fast at boot (NFR-2): if any
 * required variable is missing, loading throws an error naming every
 * missing variable.
 */

export interface Config {
  mongoUri: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  adminUser: string;
  adminPasswordHash: string;
  uploadDir: string;
  corsOrigins: string[];
  /**
   * Outgoing mail for the Libro de Reclamaciones (spec R2b.2 / design §5.4).
   * All optional: without `SMTP_HOST` no transport is ever created and
   * complaints are stored with `emailSent: false`.
   */
  smtp: {
    host?: string;
    port: number;
    secure: boolean;
    user?: string;
    pass?: string;
    from?: string;
  };
  complaints: {
    /** Destination mailbox of the Libro; mailer is active only with host AND email (C6). */
    email?: string;
    /** Correlativo prefix: `LR-2026-000001` (C5). */
    codePrefix: string;
    /** Max `POST /api/complaints` per IP per 60 min window (C5). */
    rateLimit: number;
  };
}

const REQUIRED = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD_HASH'] as const;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const missing = REQUIRED.filter((name) => {
    const value = env[name];
    return value === undefined || value.trim() === '';
  });
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'The API refuses to start without them.',
    );
  }

  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }

  const smtpPort = Number(env.SMTP_PORT ?? 587);
  if (!Number.isInteger(smtpPort) || smtpPort <= 0 || smtpPort > 65535) {
    throw new Error(`Invalid SMTP_PORT: ${env.SMTP_PORT}`);
  }

  const complaintsRateLimit = Number(env.COMPLAINTS_RATE_LIMIT ?? 5);
  if (!Number.isInteger(complaintsRateLimit) || complaintsRateLimit <= 0) {
    throw new Error(`Invalid COMPLAINTS_RATE_LIMIT: ${env.COMPLAINTS_RATE_LIMIT}`);
  }

  return {
    mongoUri: env.MONGO_URI as string,
    port,
    jwtSecret: env.JWT_SECRET as string,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '12h',
    adminUser: env.ADMIN_USER as string,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH as string,
    uploadDir: env.UPLOAD_DIR ?? '/data/uploads',
    corsOrigins: (env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    smtp: {
      host: optional(env.SMTP_HOST),
      port: smtpPort,
      secure: (env.SMTP_SECURE ?? 'false').trim().toLowerCase() === 'true',
      user: optional(env.SMTP_USER),
      pass: optional(env.SMTP_PASS),
      from: optional(env.SMTP_FROM) ?? optional(env.SMTP_USER),
    },
    complaints: {
      email: optional(env.COMPLAINTS_EMAIL),
      codePrefix: optional(env.COMPLAINTS_CODE_PREFIX) ?? 'LR',
      rateLimit: complaintsRateLimit,
    },
  };
}

/** Empty/whitespace-only env values count as unset. */
function optional(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Eagerly-loaded singleton — importing this module fails fast on bad env. */
export const config: Config = loadConfig();
