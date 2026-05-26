import { z } from 'zod';

const EMAIL = z
  .string({ required_error: 'Email is required' })
  .min(1, 'Email is required')
  .email('Enter a valid email');

const PASSWORD_LOGIN = z.string({ required_error: 'Password is required' }).min(1, 'Password is required');

const PASSWORD_STRONG = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .refine((v) => /[A-Z]/.test(v), 'Add an uppercase letter')
  .refine((v) => /[a-z]/.test(v), 'Add a lowercase letter')
  .refine((v) => /\d/.test(v), 'Add a number')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'Add a symbol');

export const loginSchema = z.object({
  email: EMAIL,
  password: PASSWORD_LOGIN,
  rememberMe: z.boolean().optional().default(false),
  totpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/u, 'Two-factor code must be 6 digits')
    .optional()
    .or(z.literal('')),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name is required').max(80),
    lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name is required').max(80),
    email: EMAIL,
    password: PASSWORD_STRONG,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    marketingOptIn: z.boolean().optional().default(false),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: EMAIL,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: PASSWORD_STRONG,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: PASSWORD_STRONG,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
