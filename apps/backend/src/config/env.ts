import { z } from 'zod';

const csv = (v: string) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  APP_NAME: z.string().default('TwinSpire'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_PREFIX: z.string().startsWith('/').default('/api/v1'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform(csv)
    .pipe(z.array(z.string().min(1))),

  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  LOG_PRETTY: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),

  DATABASE_URL: z.string().min(1).default('mongodb://localhost:27017/twinspire'),
  DATABASE_NAME: z.string().default('twinspire'),

  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  REDIS_PREFIX: z.string().default('twinspire:'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_TTL: z.string().default('30d'),
  JWT_ISSUER: z.string().default('twinspire'),
  JWT_AUDIENCE: z.string().default('twinspire-clients'),

  COOKIE_SECRET: z.string().min(16),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  REFRESH_COOKIE_NAME: z.string().default('ts_rt'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  PASSWORD_RESET_TTL_MIN: z.coerce.number().int().positive().default(30),
  EMAIL_VERIFY_TTL_HOURS: z.coerce.number().int().positive().default(24),

  TOTP_ISSUER: z.string().default('TwinSpire'),
  TOTP_WINDOW: z.coerce.number().int().min(0).max(4).default(1),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_PUBLIC_URL: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default('TwinSpire <no-reply@twinspire.dev>'),
  EMAIL_REPLY_TO: z.string().optional(),
  EMAIL_DRIVER: z.enum(['smtp', 'console', 'jsonfile']).default('console'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  OAUTH_REDIRECT_BASE: z.string().url().default('http://localhost:4000'),

  ENABLE_SWAGGER: z
    .string()
    .default('true')
    .transform((v) => v === 'true' || v === '1'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_API_VERSION: z.string().default('2024-10-28.acacia'),

  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  ELASTICSEARCH_URL: z.string().optional(),
  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),
  ELASTICSEARCH_API_KEY: z.string().optional(),
  ELASTICSEARCH_PRODUCT_INDEX: z.string().default('twinspire-products'),
  ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED: z
    .string()
    .default('true')
    .transform((v) => v === 'true' || v === '1'),

  TAX_RATE_DEFAULT: z.coerce.number().min(0).max(1).default(0),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().min(0).default(75),
  SHIPPING_FLAT_RATE: z.coerce.number().min(0).default(8.99),
  ORDER_CART_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  GUEST_CART_COOKIE: z.string().default('ts_cart'),
});

export type Env = z.infer<typeof envSchema>;

function buildEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\n[TwinSpire] Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = buildEnv();
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
