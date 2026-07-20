/**
 * Centralized, typed access to Vite environment variables. Mirrors the
 * backend's config/env.ts pattern so both services follow the same
 * convention for reading configuration.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'PhishGuardX',
  isDevelopment: import.meta.env.VITE_ENV !== 'production'
} as const;
