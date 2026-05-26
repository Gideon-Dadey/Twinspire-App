/**
 * Tiny localStorage-backed key-value store used by the mock backend so the
 * client behaves like a real persistent API across reloads.
 *
 * All read/write helpers gracefully degrade when `window` is undefined
 * (server-side rendering) by returning the provided fallback or no-ops.
 */

const isClient = typeof window !== 'undefined';

export function readJson<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or serialization errors are non-fatal for the mock backend */
  }
}

export function removeKey(key: string): void {
  if (!isClient) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function clearKeys(prefix: string): void {
  if (!isClient) return;
  try {
    const remove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) remove.push(key);
    }
    for (const k of remove) window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export const mockKeys = {
  users: 'twinspire.mock.users',
  session: 'twinspire.mock.session',
  passwords: 'twinspire.mock.passwords',
  seedVersion: 'twinspire.mock.seed-version',
  sessions: (userId: string) => `twinspire.mock.sessions.${userId}`,
  addresses: (userId: string) => `twinspire.mock.addresses.${userId}`,
  orders: (userId: string) => `twinspire.mock.orders.${userId}`,
  wishlist: (userId: string) => `twinspire.mock.wishlist.${userId}`,
  recentlyViewed: (userId: string) => `twinspire.mock.recently-viewed.${userId}`,
  twoFactor: (userId: string) => `twinspire.mock.2fa.${userId}`,
  pendingTwoFactor: (userId: string) => `twinspire.mock.2fa-pending.${userId}`,
  resetTokens: 'twinspire.mock.reset-tokens',
  verifyTokens: 'twinspire.mock.verify-tokens',
} as const;
