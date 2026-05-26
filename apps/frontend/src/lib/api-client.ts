import type { ApiResponse, ApiSuccess } from '@twinspire/types';

import { env } from '@/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Parsed and JSON-stringified automatically. */
  json?: unknown;
  /** Query string parameters appended to the URL. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Override base URL (defaults to NEXT_PUBLIC_API_URL). */
  baseUrl?: string;
  /** Abort the request after this many milliseconds. */
  timeoutMs?: number;
}

function buildUrl(path: string, query?: ApiRequestOptions['query'], baseUrl?: string): string {
  const base = (baseUrl ?? env.NEXT_PUBLIC_API_URL).replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${cleanPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.append(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { json, query, baseUrl, timeoutMs = 30_000, headers, ...rest } = options;

  const url = buildUrl(path, query, baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
      signal: controller.signal,
      credentials: rest.credentials ?? 'include',
    });

    const text = await response.text();
    const parsed: ApiResponse<T> = text
      ? (JSON.parse(text) as ApiResponse<T>)
      : ({ success: true, data: undefined as T } satisfies ApiSuccess<T>);

    if (parsed.success === false) {
      throw new ApiError(
        response.status,
        parsed.error.code,
        parsed.error.message,
        parsed.error.details,
        parsed.error.requestId,
      );
    }

    if (!response.ok) {
      throw new ApiError(response.status, 'HTTP_ERROR', `Request failed with status ${response.status}`);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', `Request timed out after ${timeoutMs}ms`);
    }
    throw new ApiError(0, 'NETWORK_ERROR', (error as Error).message);
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T,>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', json: body }),
  put: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', json: body }),
  patch: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', json: body }),
  delete: <T,>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
