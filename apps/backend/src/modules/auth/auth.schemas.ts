import { EMAIL_REGEX, PHONE_REGEX } from '@twinspire/utils';
import { z } from 'zod';


export const emailSchema = z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Invalid email');

export const passwordSchema = z.string().min(12).max(128);

export const registerBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone').optional(),
  marketingOptIn: z.boolean().optional().default(false),
  newsletter: z.boolean().optional().default(false),
});
export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  totpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Invalid 2FA code')
    .optional(),
  backupCode: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, 'Invalid backup code format')
    .optional(),
  deviceLabel: z.string().trim().max(80).optional(),
});
export type LoginBody = z.infer<typeof loginBodySchema>;

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(20).optional(),
  })
  .default({});

export const logoutBodySchema = z
  .object({
    everywhere: z.boolean().optional().default(false),
  })
  .default({});

export const verifyEmailBodySchema = z.object({
  token: z.string().min(20).max(200),
});

export const resendVerifyBodySchema = z.object({
  email: emailSchema,
});

export const requestPasswordResetBodySchema = z.object({
  email: emailSchema,
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const enable2faBodySchema = z.object({
  totpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Invalid 2FA code'),
});

export const disable2faBodySchema = z.object({
  password: z.string().min(1).max(128),
});

export const socialLoginBodySchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  idToken: z.string().min(20).optional(),
  accessToken: z.string().min(20).optional(),
});

export const sessionRevokeParamsSchema = z.object({
  sessionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid session id'),
});
