import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { env } from '../config/env';
import {
  changePasswordBodySchema,
  disable2faBodySchema,
  enable2faBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  requestPasswordResetBodySchema,
  resendVerifyBodySchema,
  resetPasswordBodySchema,
  sessionRevokeParamsSchema,
  socialLoginBodySchema,
  verifyEmailBodySchema,
} from '../modules/auth/auth.schemas';
import {
  addressBodySchema,
  addressParamsSchema,
  addressUpdateBodySchema,
  updatePreferencesBodySchema,
  updateProfileBodySchema,
} from '../modules/users/users.schemas';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

/* ---------- Schemas (referenced as `#/components/schemas/<Name>`) ---------- */

const errorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
      requestId: z.string().optional(),
    }),
  })
  .openapi('ApiError');

const successOf = <T extends z.ZodTypeAny>(data: T): z.ZodTypeAny =>
  z.object({
    success: z.literal(true),
    data,
    meta: z.record(z.string(), z.unknown()).optional(),
  });

const userSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    displayName: z.string().optional(),
    avatarUrl: z.string().optional(),
    role: z.enum(['customer', 'support', 'staff', 'manager', 'admin', 'superadmin']),
    status: z.enum(['pending', 'active', 'suspended', 'banned']),
    emailVerifiedAt: z.string().datetime().nullable(),
    twoFactorEnabled: z.boolean(),
    preferences: z.object({
      locale: z.string(),
      currency: z.string(),
      theme: z.enum(['light', 'dark', 'system']),
      marketingOptIn: z.boolean(),
      newsletter: z.boolean(),
    }),
    createdAt: z.string().datetime(),
  })
  .openapi('User');

const authTokensSchema = z
  .object({
    accessToken: z.string(),
    accessExpiresAt: z.string().datetime(),
    refreshExpiresAt: z.string().datetime(),
    user: userSchema,
  })
  .openapi('AuthTokens');

const addressSchema = z
  .object({
    id: z.string(),
    label: z.string().optional(),
    kind: z.enum(['shipping', 'billing', 'both']),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
    country: z.string(),
    countryCode: z.string(),
    isDefault: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi('Address');

registry.register('ApiError', errorSchema);
registry.register('User', userSchema);
registry.register('AuthTokens', authTokensSchema);
registry.register('Address', addressSchema);

/* ---------- Security scheme ---------- */

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: env.REFRESH_COOKIE_NAME,
});

/* ---------- Health ---------- */

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Liveness probe',
  responses: {
    200: {
      description: 'Service is up',
      content: { 'application/json': { schema: successOf(z.object({ status: z.string() })) } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/health/ready',
  tags: ['Health'],
  summary: 'Readiness probe (DB, cache, search)',
  responses: {
    200: { description: 'All upstream checks healthy' },
    503: { description: 'One or more upstream dependencies degraded' },
  },
});

/* ---------- Auth ---------- */

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new customer account',
  request: { body: { content: { 'application/json': { schema: registerBodySchema } } } },
  responses: {
    201: {
      description: 'Account created — verification email sent',
      content: {
        'application/json': {
          schema: successOf(z.object({ userId: z.string(), email: z.string().email() })),
        },
      },
    },
    409: {
      description: 'Email already registered',
      content: { 'application/json': { schema: errorSchema } },
    },
    422: {
      description: 'Validation or weak password',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Log in with email + password (and 2FA when enabled)',
  request: { body: { content: { 'application/json': { schema: loginBodySchema } } } },
  responses: {
    200: {
      description: 'Logged in. Refresh token set as a signed HTTP-only cookie.',
      content: { 'application/json': { schema: successOf(authTokensSchema) } },
    },
    401: {
      description: 'Invalid credentials or 2FA required',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Rotate the refresh token + issue a new access token',
  security: [{ cookieAuth: [] }],
  request: { body: { content: { 'application/json': { schema: refreshBodySchema } } } },
  responses: {
    200: {
      description: 'New tokens issued',
      content: { 'application/json': { schema: successOf(authTokensSchema) } },
    },
    401: { description: 'Refresh token missing/invalid/reused' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Revoke the current session (or every session via `everywhere`)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: logoutBodySchema } } } },
  responses: { 204: { description: 'Logged out' } },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Return the authenticated user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Authenticated user',
      content: { 'application/json': { schema: successOf(z.object({ user: userSchema })) } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth'],
  summary: 'Verify an email address using a one-time token',
  request: { body: { content: { 'application/json': { schema: verifyEmailBodySchema } } } },
  responses: { 200: { description: 'Email verified' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/resend-verify',
  tags: ['Auth'],
  summary: 'Resend the email verification link',
  request: { body: { content: { 'application/json': { schema: resendVerifyBodySchema } } } },
  responses: { 204: { description: 'Verification email requested' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/password/reset/request',
  tags: ['Auth'],
  summary: 'Request a password-reset email',
  request: { body: { content: { 'application/json': { schema: requestPasswordResetBodySchema } } } },
  responses: { 204: { description: 'Reset email requested (always 204)' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/password/reset',
  tags: ['Auth'],
  summary: 'Reset the password using a one-time token',
  request: { body: { content: { 'application/json': { schema: resetPasswordBodySchema } } } },
  responses: { 204: { description: 'Password reset' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/password/change',
  tags: ['Auth'],
  summary: 'Change the current user password',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: changePasswordBodySchema } } } },
  responses: { 204: { description: 'Password changed; all sessions revoked' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/2fa/setup',
  tags: ['Auth — 2FA'],
  summary: 'Begin 2FA setup — returns a TOTP secret + QR code',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: '2FA setup payload',
      content: {
        'application/json': {
          schema: successOf(
            z.object({ secret: z.string(), uri: z.string(), qrDataUrl: z.string() }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/2fa/confirm',
  tags: ['Auth — 2FA'],
  summary: 'Confirm 2FA setup; returns backup codes (shown once)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: enable2faBodySchema } } } },
  responses: {
    200: {
      description: '2FA enabled with backup codes',
      content: {
        'application/json': { schema: successOf(z.object({ backupCodes: z.array(z.string()) })) },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/2fa/disable',
  tags: ['Auth — 2FA'],
  summary: 'Disable 2FA (requires password)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: disable2faBodySchema } } } },
  responses: { 204: { description: '2FA disabled' } },
});

registry.registerPath({
  method: 'get',
  path: '/auth/sessions',
  tags: ['Auth — Sessions'],
  summary: 'List active sessions for the current user',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'List of active sessions' } },
});

registry.registerPath({
  method: 'delete',
  path: '/auth/sessions/{sessionId}',
  tags: ['Auth — Sessions'],
  summary: 'Revoke a specific session',
  security: [{ bearerAuth: [] }],
  request: { params: sessionRevokeParamsSchema },
  responses: { 204: { description: 'Session revoked' } },
});

registry.registerPath({
  method: 'post',
  path: '/auth/social',
  tags: ['Auth'],
  summary: 'Log in with a verified social identity (Google, Facebook, Apple)',
  request: { body: { content: { 'application/json': { schema: socialLoginBodySchema } } } },
  responses: {
    200: {
      description: 'Logged in',
      content: { 'application/json': { schema: successOf(authTokensSchema) } },
    },
  },
});

/* ---------- Users ---------- */

registry.registerPath({
  method: 'get',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Return the authenticated user profile',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profile',
      content: { 'application/json': { schema: successOf(z.object({ user: userSchema })) } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update the current user profile',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: updateProfileBodySchema } } } },
  responses: { 200: { description: 'Updated profile' } },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me/preferences',
  tags: ['Users'],
  summary: 'Update notification + display preferences',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: updatePreferencesBodySchema } } } },
  responses: { 200: { description: 'Updated preferences' } },
});

registry.registerPath({
  method: 'delete',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Soft-delete the current user account',
  security: [{ bearerAuth: [] }],
  responses: { 204: { description: 'Account scheduled for deletion' } },
});

registry.registerPath({
  method: 'get',
  path: '/users/me/addresses',
  tags: ['Users — Addresses'],
  summary: 'List addresses',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Addresses' } },
});

registry.registerPath({
  method: 'post',
  path: '/users/me/addresses',
  tags: ['Users — Addresses'],
  summary: 'Create a new address',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: addressBodySchema } } } },
  responses: { 201: { description: 'Address created' } },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me/addresses/{addressId}',
  tags: ['Users — Addresses'],
  summary: 'Update an address',
  security: [{ bearerAuth: [] }],
  request: { params: addressParamsSchema, body: { content: { 'application/json': { schema: addressUpdateBodySchema } } } },
  responses: { 200: { description: 'Address updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/users/me/addresses/{addressId}',
  tags: ['Users — Addresses'],
  summary: 'Delete an address',
  security: [{ bearerAuth: [] }],
  request: { params: addressParamsSchema },
  responses: { 204: { description: 'Address deleted' } },
});

registry.registerPath({
  method: 'post',
  path: '/users/me/addresses/{addressId}/default',
  tags: ['Users — Addresses'],
  summary: 'Make an address the default for the user',
  security: [{ bearerAuth: [] }],
  request: { params: addressParamsSchema },
  responses: { 200: { description: 'Default address updated' } },
});

/* ---------- Document builder ---------- */

export function buildOpenApiDocument(): ReturnType<OpenApiGeneratorV31['generateDocument']> {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'TwinSpire API',
      version: process.env.npm_package_version ?? '0.1.0',
      description: 'TwinSpire commerce backend — authentication, identity, catalog, and orders.',
      contact: { name: 'TwinSpire Engineering', email: 'engineering@twinspire.dev' },
      license: { name: 'UNLICENSED' },
    },
    servers: [{ url: `${env.OAUTH_REDIRECT_BASE}${env.API_PREFIX}`, description: 'Default' }],
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Liveness & readiness probes' },
      { name: 'Auth', description: 'Registration, login, refresh, password & social' },
      { name: 'Auth — 2FA', description: 'Two-factor authentication management' },
      { name: 'Auth — Sessions', description: 'Active session management' },
      { name: 'Users', description: 'Profile & preferences' },
      { name: 'Users — Addresses', description: 'Saved shipping & billing addresses' },
    ],
  });
}
