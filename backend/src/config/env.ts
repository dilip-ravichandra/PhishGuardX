import 'dotenv/config';

/**
 * Centralized, typed access to environment variables.
 *
 * Milestone 0 only read boot-level variables. Milestone 1 adds the
 * database connection string and JWT signing secrets, since auth now
 * depends on both. Variables still unused by any milestone (threat-intel
 * API keys, AI_SERVICE_URL, etc.) remain undocumented here on purpose -
 * validating them now would fail the server for features that don't
 * exist yet, violating the "implement only the requested milestone" rule.
 */
interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
  logLevel: string;
  mongodbUri: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  port: Number(requireEnv('PORT', '4000')),
  nodeEnv: (requireEnv('NODE_ENV', 'development') as AppConfig['nodeEnv']),
  corsOrigin: requireEnv('CORS_ORIGIN', 'http://localhost:5173'),
  logLevel: requireEnv('LOG_LEVEL', 'info'),
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/phishguardx'),
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiry: requireEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: requireEnv('JWT_REFRESH_EXPIRY', '7d')
  }
};

