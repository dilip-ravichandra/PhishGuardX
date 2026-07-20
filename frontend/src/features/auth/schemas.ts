import { z } from 'zod';

// Mirrors backend/src/validators/auth.validator.ts - min 8 chars, at least
// one letter and one number. Kept in sync manually since Milestone 1 does
// not yet have a shared-validation package; see the milestone summary's
// assumptions.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least one letter and one number');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export type LoginFormValues = z.infer<typeof loginSchema>;
