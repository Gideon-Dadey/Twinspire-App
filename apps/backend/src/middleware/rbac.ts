import { HttpError } from '../utils/http-error';

import type { UserRole } from '@twinspire/types';
import type { NextFunction, Request, RequestHandler, Response } from 'express';



/**
 * Role hierarchy. Higher values can do everything that lower values can.
 * Use `requireRole('manager')` rather than `requireRole('admin', 'manager', 'superadmin')`.
 */
const ROLE_RANK: Record<UserRole, number> = {
  customer: 0,
  support: 10,
  staff: 20,
  manager: 30,
  admin: 40,
  superadmin: 50,
};

export function requireRole(min: UserRole): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(HttpError.unauthorized('Authentication required'));
    if (ROLE_RANK[req.auth.role] < ROLE_RANK[min]) {
      return next(
        HttpError.forbidden(`Role '${min}' or higher required`, { code: 'INSUFFICIENT_ROLE' }),
      );
    }
    return next();
  };
}

export function requireAnyRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(HttpError.unauthorized('Authentication required'));
    if (!roles.includes(req.auth.role)) {
      return next(
        HttpError.forbidden(`One of [${roles.join(', ')}] required`, { code: 'INSUFFICIENT_ROLE' }),
      );
    }
    return next();
  };
}

/**
 * Allow either staff (role ≥ given threshold) OR the resource owner (matched
 * by extracting an id from the request via the supplied selector).
 *
 * Useful for endpoints like GET /users/:id where customers can view themselves
 * and staff can view anyone.
 */
export function requireSelfOrRole(
  selectOwnerId: (req: Request) => string | undefined,
  staffMin: UserRole = 'staff',
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(HttpError.unauthorized('Authentication required'));
    const ownerId = selectOwnerId(req);
    if (ownerId && ownerId === req.auth.userId) return next();
    if (ROLE_RANK[req.auth.role] >= ROLE_RANK[staffMin]) return next();
    return next(HttpError.forbidden('Not permitted', { code: 'NOT_RESOURCE_OWNER' }));
  };
}

/**
 * Permission key based guard. Permissions are typically loaded into the JWT
 * by name (e.g. `products:write`). We don't put them in the access token by
 * default to keep tokens small — instead this guard does a lazy lookup via
 * the user's role definition. For tight inner loops, consider denormalising
 * permissions onto the token.
 */
export function requirePermission(permission: string): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(HttpError.unauthorized('Authentication required'));

    try {
      const { resolveUserPermissions } = await import('../services/rbac.service');
      const perms = await resolveUserPermissions(req.auth.userId, req.auth.role);
      if (!perms.has(permission)) {
        return next(
          HttpError.forbidden(`Permission '${permission}' required`, {
            code: 'INSUFFICIENT_PERMISSION',
          }),
        );
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export { ROLE_RANK };
