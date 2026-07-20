import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import type { ApiErrorResponse } from '../types/api-response';

/**
 * Central error-handling middleware. Must be registered last, after all
 * routes. Converts both known AppErrors and unexpected exceptions into the
 * standard { success: false, error } envelope, and logs the failure without
 * leaking stack traces to the client in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';

  logger.error('Request failed', {
    path: req.path,
    method: req.method,
    statusCode,
    code,
    message: err instanceof Error ? err.message : String(err)
  });

  const body: ApiErrorResponse = {
    success: false,
    error: { message, code }
  };

  res.status(statusCode).json(body);
}

/**
 * 404 handler for unmatched routes, registered after all routes but
 * before the error handler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { message: `Route not found: ${req.method} ${req.path}`, code: 'ROUTE_NOT_FOUND' }
  };
  res.status(404).json(body);
}
