import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env';

import { generateRandomToken } from './crypto';
import type { AccessTokenClaims, RefreshTokenClaims } from './types';

/* ---------- TTL helpers ---------- */

const TTL_REGEX = /^(\d+)\s*(ms|s|m|h|d)$/i;

/** Convert "15m" / "30d" / "12345" into milliseconds. */
export function ttlToMs(ttl: string): number {
  if (/^\d+$/.test(ttl)) return Number(ttl);
  const match = TTL_REGEX.exec(ttl.trim());
  if (!match) throw new Error(`Invalid TTL value: ${ttl}`);
  const [, raw, unit] = match;
  const value = Number(raw);
  switch (unit?.toLowerCase()) {
    case 'ms':
      return value;
    case 's':
      return value * 1_000;
    case 'm':
      return value * 60_000;
    case 'h':
      return value * 3_600_000;
    case 'd':
      return value * 86_400_000;
    default:
      throw new Error(`Invalid TTL unit: ${unit ?? ''}`);
  }
}

/* ---------- Signing ---------- */

const baseOptions: SignOptions = {
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  algorithm: 'HS256',
};

export function signAccessToken(claims: Omit<AccessTokenClaims, 'type'>): string {
  return jwt.sign({ ...claims, type: 'access' } satisfies AccessTokenClaims, env.JWT_ACCESS_SECRET, {
    ...baseOptions,
    expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(claims: Omit<RefreshTokenClaims, 'type' | 'jti'> & { jti?: string }): {
  token: string;
  jti: string;
} {
  const jti = claims.jti ?? generateRandomToken(24);
  const token = jwt.sign(
    { ...claims, jti, type: 'refresh' } satisfies RefreshTokenClaims,
    env.JWT_REFRESH_SECRET,
    { ...baseOptions, expiresIn: env.JWT_REFRESH_TTL as SignOptions['expiresIn'] },
  );
  return { token, jti };
}

/* ---------- Verification ---------- */

function decodeAndAssert<T extends JwtPayload>(token: string, secret: string): T {
  const decoded = jwt.verify(token, secret, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ['HS256'],
  });
  if (typeof decoded === 'string') {
    throw new Error('Token payload was a string, expected an object');
  }
  return decoded as T;
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const claims = decodeAndAssert<AccessTokenClaims & JwtPayload>(token, env.JWT_ACCESS_SECRET);
  if (claims.type !== 'access') {
    throw new Error('Token type mismatch (expected access)');
  }
  return claims;
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  const claims = decodeAndAssert<RefreshTokenClaims & JwtPayload>(token, env.JWT_REFRESH_SECRET);
  if (claims.type !== 'refresh') {
    throw new Error('Token type mismatch (expected refresh)');
  }
  return claims;
}

/* ---------- Misc ---------- */

export function tokenExpiry(ttl: string, from = Date.now()): Date {
  return new Date(from + ttlToMs(ttl));
}
