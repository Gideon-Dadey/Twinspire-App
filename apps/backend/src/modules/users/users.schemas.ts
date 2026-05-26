import { PHONE_REGEX } from '@twinspire/utils';
import { z } from 'zod';


export const updateProfileBodySchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  displayName: z.string().trim().max(120).optional(),
  phone: z.string().regex(PHONE_REGEX).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
});

export const updatePreferencesBodySchema = z.object({
  locale: z.string().min(2).max(16).optional(),
  currency: z.string().length(3).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  marketingOptIn: z.boolean().optional(),
  newsletter: z.boolean().optional(),
});

export const addressBodySchema = z.object({
  label: z.string().max(64).optional(),
  kind: z.enum(['shipping', 'billing', 'both']).default('both'),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().regex(PHONE_REGEX),
  email: z.string().email().optional(),
  company: z.string().max(120).optional(),
  line1: z.string().min(1).max(240),
  line2: z.string().max(240).optional(),
  city: z.string().min(1).max(120),
  state: z.string().max(120).optional(),
  postalCode: z.string().min(1).max(32),
  country: z.string().min(1).max(120),
  countryCode: z.string().length(2),
  isDefault: z.boolean().optional(),
});
export type AddressBody = z.infer<typeof addressBodySchema>;

export const addressUpdateBodySchema = addressBodySchema.partial();

export const addressParamsSchema = z.object({
  addressId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid address id'),
});

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
});
