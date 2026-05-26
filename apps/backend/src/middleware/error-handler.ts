import { ZodError } from 'zod';

import { isProd } from '../config/env';
import { logger } from '../config/logger';
import { HttpError } from '../utils/http-error';
import { sendError } from '../utils/response';

import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  expose: boolean;
}

function normalize(err: unknown): NormalizedError {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details,
      expose: err.expose,
    };
  }

  if (err instanceof ZodError) {
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        code: i.code,
        message: i.message,
      })),
      expose: true,
    };
  }

  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    return {
      status: 400,
      code: 'INVALID_JSON',
      message: 'Invalid JSON payload',
      expose: true,
    };
  }

  const status =
    typeof (err as { status?: number })?.status === 'number'
      ? (err as { status: number }).status
      : 500;

  return {
    status,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    expose: false,
  };
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const normalized = normalize(err);
  const log = (req.log ?? logger).child({ requestId: req.id });

  if (normalized.status >= 500) {
    log.error({ err, status: normalized.status }, 'Unhandled error');
  } else {
    log.warn({ err, status: normalized.status }, 'Client error');
  }

  const message =
    normalized.expose || !isProd ? normalized.message : 'An unexpected error occurred';

  sendError(
    res,
    normalized.status,
    normalized.code,
    message,
    normalized.details,
    typeof req.id === 'string' ? req.id : undefined,
  );
};
