import { ZodError, type ZodTypeAny, type z } from 'zod';

import { HttpError } from '../utils/http-error';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  headers?: ZodTypeAny;
}

export interface Validated<S extends ValidateSchemas> {
  body: S['body'] extends ZodTypeAny ? z.infer<S['body']> : unknown;
  query: S['query'] extends ZodTypeAny ? z.infer<S['query']> : unknown;
  params: S['params'] extends ZodTypeAny ? z.infer<S['params']> : unknown;
  headers: S['headers'] extends ZodTypeAny ? z.infer<S['headers']> : unknown;
}

/**
 * Parses `req.body`, `req.query`, and `req.params` against the given Zod
 * schemas. On success, replaces each with the parsed (transformed) value.
 *
 * Throws `HttpError(422)` with a structured `details` array on validation
 * failure. The global error handler renders that as the standard error
 * envelope.
 */
export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.headers) schemas.headers.parse(req.headers);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          HttpError.unprocessable('Validation failed', {
            code: 'VALIDATION_ERROR',
            details: err.issues.map((i) => ({
              path: i.path.join('.'),
              code: i.code,
              message: i.message,
            })),
          }),
        );
        return;
      }
      next(err);
    }
  };
}
