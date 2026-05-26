export const APP_NAME = 'TwinSpire' as const;

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

/**
 * `GHS` is listed first so it's the default for any picker that lazily takes
 * the first entry. The other ISO currencies remain in the union to preserve
 * back-compat with historical orders and admin tooling.
 */
export const SUPPORTED_CURRENCIES = [
  'GHS',
  'USD',
  'EUR',
  'GBP',
  'NGN',
  'CAD',
  'AUD',
  'JPY',
  'INR',
  'CNY',
] as const;

export const DEFAULT_CURRENCY = 'GHS' as const;

export const SUPPORTED_LOCALES = ['en-GH', 'en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE'] as const;

export const DEFAULT_LOCALE = 'en-GH' as const;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export const ORDER_NUMBER_PREFIX = 'TS';
export const TICKET_NUMBER_PREFIX = 'TT';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
