import type { Response } from 'express';

import type { ApiError, ApiSuccess } from '@twinspire/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
): Response {
  const body: ApiSuccess<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return res.status(status).json(body);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
): Response {
  return sendSuccess(res, data, 201, meta);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
  requestId?: string,
): Response {
  const body: ApiError = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };
  return res.status(status).json(body);
}
