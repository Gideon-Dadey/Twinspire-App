import { HTTP_STATUS, type HttpStatus } from '@twinspire/utils';

export interface HttpErrorOptions {
  code?: string;
  details?: unknown;
  cause?: unknown;
  expose?: boolean;
}

/**
 * Application-level HTTP error. Always safe to expose to clients.
 *
 * Use the static factories (`HttpError.badRequest`, etc.) for common cases.
 */
export class HttpError extends Error {
  public readonly status: HttpStatus;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly expose: boolean;

  constructor(status: HttpStatus, message: string, opts: HttpErrorOptions = {}) {
    super(message, { cause: opts.cause });
    this.name = 'HttpError';
    this.status = status;
    this.code = opts.code ?? defaultCodeFor(status);
    this.details = opts.details;
    this.expose = opts.expose ?? status < 500;
  }

  static badRequest(message = 'Bad request', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.BAD_REQUEST, message, opts);
  }
  static unauthorized(message = 'Unauthorized', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.UNAUTHORIZED, message, opts);
  }
  static forbidden(message = 'Forbidden', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.FORBIDDEN, message, opts);
  }
  static notFound(message = 'Not found', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.NOT_FOUND, message, opts);
  }
  static conflict(message = 'Conflict', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.CONFLICT, message, opts);
  }
  static unprocessable(message = 'Unprocessable entity', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, opts);
  }
  static tooMany(message = 'Too many requests', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.TOO_MANY_REQUESTS, message, opts);
  }
  static internal(message = 'Internal server error', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, { ...opts, expose: false });
  }
  static serviceUnavailable(message = 'Service unavailable', opts?: HttpErrorOptions): HttpError {
    return new HttpError(HTTP_STATUS.SERVICE_UNAVAILABLE, message, opts);
  }
}

function defaultCodeFor(status: HttpStatus): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HTTP_STATUS.FORBIDDEN:
      return 'FORBIDDEN';
    case HTTP_STATUS.NOT_FOUND:
      return 'NOT_FOUND';
    case HTTP_STATUS.CONFLICT:
      return 'CONFLICT';
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'ERROR';
  }
}
