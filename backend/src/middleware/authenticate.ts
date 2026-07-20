import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { UnauthorizedError } from '../utils/errors';

const BEARER_PREFIX = 'Bearer ';

/**
 * Verifies the Authorization header's access token and attaches the
 * decoded payload to req.user. Runs before any controller on protected
 * routes, per AUTH-06 ("Authorization middleware executes before
 * controllers").
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length);

  try {
    req.user = jwtService.verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}
