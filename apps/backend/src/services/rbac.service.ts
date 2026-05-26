
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';

import { cacheService } from './cache';

import type { UserRole } from '@twinspire/types';

const CACHE_TTL_SECONDS = 60;

/**
 * Resolve the permission set for a user. Roles → permissionIds → permission.key.
 * Cached briefly to keep tight request paths fast; cache key includes the role
 * slug so role changes invalidate naturally.
 */
export async function resolveUserPermissions(_userId: string, role: UserRole): Promise<Set<string>> {
  return cacheService
    .wrap<string[]>(`rbac:role:${role}`, CACHE_TTL_SECONDS, async () => {
      const roleDoc = await Role.findOne({ slug: role }).lean();
      if (!roleDoc) return [];
      const perms = await Permission.find({ _id: { $in: roleDoc.permissionIds } })
        .select('key')
        .lean();
      return perms.map((p) => p.key);
    })
    .then((arr) => new Set(arr ?? []));
}

export async function invalidatePermissionsCache(role: UserRole): Promise<void> {
  await cacheService.del(`rbac:role:${role}`);
}
