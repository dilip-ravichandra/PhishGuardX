/**
 * Minimal structured logger.
 *
 * Kept intentionally simple for Milestone 0. Per the Implementation
 * Blueprint's logging conventions, this never logs secrets or request
 * bodies - only level-tagged, timestamped messages. It exists as a single
 * seam so a more capable logging library can be swapped in later without
 * touching call sites throughout the codebase.
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {})
  };
  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta)
};
