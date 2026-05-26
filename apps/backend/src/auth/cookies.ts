import type { CookieOptions, Request, Response } from 'express';

import { env, isProd } from '../config/env';

import { ttlToMs } from './tokens';

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd || env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: env.API_PREFIX + '/auth',
    maxAge: ttlToMs(env.JWT_REFRESH_TTL),
    signed: true,
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: 0 });
}

export function getRefreshCookie(req: Request): string | null {
  const signed = req.signedCookies?.[env.REFRESH_COOKIE_NAME];
  if (typeof signed === 'string' && signed.length > 0) return signed;
  const plain = req.cookies?.[env.REFRESH_COOKIE_NAME];
  return typeof plain === 'string' && plain.length > 0 ? plain : null;
}
