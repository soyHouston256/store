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
  };
}

/** Eagerly-loaded singleton — importing this module fails fast on bad env. */
export const config: Config = loadConfig();
