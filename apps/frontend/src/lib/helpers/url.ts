/**
 * Build / mutate URLSearchParams for the catalog listing pages without forcing
 * a full re-render of the page. All helpers return new instances.
 */
export type SearchValue = string | number | boolean | undefined | null;
export type SearchInput = Record<string, SearchValue | SearchValue[] | undefined>;

export function buildSearchParams(input: SearchInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.filter((v) => v != null && v !== '').forEach((v) => params.append(key, String(v)));
    } else if (value !== '') {
      params.set(key, String(value));
    }
  }
  return params;
}

export function toUrlSearchParams(input: SearchInput): string {
  const sp = buildSearchParams(input);
  const str = sp.toString();
  return str ? `?${str}` : '';
}

export function readArrayParam(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').filter(Boolean);
}

export function readNumberParam(value: string | string[] | undefined): number | undefined {
  if (value == null) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  if (v === undefined) return undefined;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function readBooleanParam(value: string | string[] | undefined): boolean | undefined {
  if (value == null) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}

export function readStringParam(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
