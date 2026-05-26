import { z } from 'zod';

const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : v === 'true' || v === '1'));

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('TwinSpire'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('USD'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('en-US'),
  /**
   * Flip to `false` once the backend is reachable; Phase 7 ships with a
   * client-only mock backend so the auth + dashboard surfaces are fully
   * usable without the API.
   */
  NEXT_PUBLIC_USE_MOCK_API: booleanish.default(true),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid client env:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid client env. See logs above.');
}

export const env = parsed.data;
export type ClientEnv = z.infer<typeof clientSchema>;
