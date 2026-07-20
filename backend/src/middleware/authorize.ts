import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { UserRole } from '../models/user.model';

/**
 * Returns middleware that only allows the given roles through. Must be
 * placed after `authenticate` in the middleware chain, since it reads
 * req.user. Implements the RBAC table in Volume 2, Section 15.6 -
 * "user" and "admin" only; the "Future Analyst" / "Future Enterprise
 * Admin" roles from that table are out of scope for this milestone.
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Your role does not permit this action'));
      return;
    }

    next();
  };
}
