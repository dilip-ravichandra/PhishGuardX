import { body, type ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Password rule: minimum 8 characters, at least one letter and one number.
 * Volume 2 (15.7) specifies "Minimum password requirements" without a
 * concrete rule; this is a reasonable, documented default rather than an
 * invented feature - see the milestone summary's "Assumptions" section.
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const registerValidators: ValidationChain[] = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(PASSWORD_PATTERN)
    .withMessage('Password must contain at least one letter and one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

export const loginValidators: ValidationChain[] = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

/** Collects express-validator results and turns the first failure into a ValidationError. */
export function handleValidationErrors(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const firstError = result.array()[0];
    next(new ValidationError(firstError.msg));
    return;
  }
  next();
}
