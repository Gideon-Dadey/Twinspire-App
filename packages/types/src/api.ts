/** Standard API response envelope. */
export interface ApiSuccess<TData> {
  success: true;
  data: TData;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiError;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
  checks: Record<string, { status: 'ok' | 'degraded' | 'down'; latencyMs?: number; message?: string }>;
}
