import { rateLimit, type Options } from 'express-rate-limit';

import { env } from '../config/env';

import type { Request } from 'express';


function ipKey(req: Request): string {
  return (req.ip ?? req.socket?.remoteAddress ?? 'unknown').toLowerCase();
}

const baseOptions: Partial<Options> = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
};

export const globalRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
});

/** Stricter limiter for auth-sensitive endpoints (login, register, password reset). */
export const authRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60_000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
    const ip = ipKey(req);
    return email ? `${ip}:${email}` : ip;
  },
});

/** Tightest limiter — for password reset / email verification *send* endpoints. */
export const sensitiveRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60_000,
  limit: 5,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
    return email || ipKey(req);
  },
});
