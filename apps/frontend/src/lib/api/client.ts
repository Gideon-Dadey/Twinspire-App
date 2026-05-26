/**
 * Authenticated wrapper around `apiFetch`. Attaches the in-memory access
 * token, refreshes it once on `401`, and re-issues the failing request.
 */

import { ApiError, apiFetch, type ApiRequestOptions } from '@/lib/api-client';

import { clearAccessToken, getAccessToken, setAccessToken } from './access-token';
import type { AuthSessionResponse } from './types';

let refreshInflight: Promise<AuthSessionResponse | null> | null = null;

async function refresh(): Promise<AuthSessionResponse | null> {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const result = await apiFetch<AuthSessionResponse>('/auth/refresh', {
        method: 'POST',
        json: {},
      });
      setAccessToken(result.accessToken, result.accessExpiresAt);
      return result;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

function withAuthHeader(options: ApiRequestOptions): ApiRequestOptions {
  const token = getAccessToken();
  if (!token) return options;
  return {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function authedFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    return await apiFetch<T>(path, withAuthHeader(options));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && getAccessToken()) {
      const refreshed = await refresh();
      if (refreshed) {
        return apiFetch<T>(path, withAuthHeader(options));
      }
    }
    throw error;
  }
}

export const authedApi = {
  get: <T,>(path: string, options?: ApiRequestOptions) =>
    authedFetch<T>(path, { ...options, method: 'GET' }),
  post: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    authedFetch<T>(path, { ...options, method: 'POST', json: body }),
  put: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    authedFetch<T>(path, { ...options, method: 'PUT', json: body }),
  patch: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    authedFetch<T>(path, { ...options, method: 'PATCH', json: body }),
  delete: <T,>(path: string, options?: ApiRequestOptions) =>
    authedFetch<T>(path, { ...options, method: 'DELETE' }),
};
