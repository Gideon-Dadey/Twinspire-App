/**
 * Single source of truth for the in-memory access token used by `apiFetch`.
 * Storing the access token in memory (rather than localStorage) avoids XSS
 * exposure. The refresh token is held in the HTTP-only cookie set by the
 * backend (`setRefreshCookie`).
 */

let accessToken: string | null = null;
let accessExpiresAt: number | null = null;
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null, expiresAt?: string | null): void {
  accessToken = token;
  accessExpiresAt = expiresAt ? new Date(expiresAt).getTime() : null;
  for (const l of listeners) l(token);
}

export function clearAccessToken(): void {
  setAccessToken(null, null);
}

export function isAccessTokenExpired(skewMs = 5_000): boolean {
  if (!accessToken) return true;
  if (!accessExpiresAt) return false;
  return Date.now() + skewMs >= accessExpiresAt;
}

export function onAccessTokenChange(listener: (token: string | null) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
