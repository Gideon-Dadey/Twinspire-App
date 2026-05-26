
import { verifyAccessToken } from '../auth/tokens';
import { HttpError } from '../utils/http-error';

import type { NextFunction, Request, Response } from 'express';

const BEARER_REGEX = /^Bearer\s+(\S+)$/i;

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (typeof header !== 'string') return null;
  const match = BEARER_REGEX.exec(header);
  return match?.[1] ?? null;
}

/**
 * Strict authentication — rejects the request if a valid access token is not
 * present. On success, attaches `req.auth` and forwards.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) return next(HttpError.unauthorized('Missing access token', { code: 'MISSING_TOKEN' }));

  try {
    const claims = verifyAccessToken(token);
    req.auth = {
      userId: claims.sub,
      email: claims.email,
      role: claims.role,
      sessionId: claims.sid,
    };
    next();
  } catch (err) {
    next(
      HttpError.unauthorized('Invalid or expired access token', {
        code: 'INVALID_TOKEN',
        cause: err,
      }),
    );
  }
}

/**
 * Soft authentication — sets `req.auth` if a valid token is present, but does
 * not reject the request when no token (or an invalid token) is supplied.
 * Useful for endpoints that personalise responses for signed-in users.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) return next();
  try {
    const claims = verifyAccessToken(token);
    req.auth = {
      userId: claims.sub,
      email: claims.email,
      role: claims.role,
      sessionId: claims.sid,
    };
  } catch {
    // Silent — leave req.auth unset.
  }
  next();
}
