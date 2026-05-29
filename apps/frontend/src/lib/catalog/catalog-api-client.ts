import { MockApiError } from '@/lib/api/mock-backend';

async function parseError(res: Response): Promise<MockApiError> {
  const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
  return new MockApiError(
    res.status,
    body.code ?? 'REQUEST_FAILED',
    body.message ?? res.statusText,
  );
}

export async function catalogApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/mock/catalog${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function catalogQueryString(
  query: Record<string, string | number | boolean | undefined | null>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== '') sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}
