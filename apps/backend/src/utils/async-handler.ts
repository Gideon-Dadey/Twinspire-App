import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async route handler so rejected promises are forwarded to
 * Express's error middleware. Express 4 doesn't catch async errors itself.
 */
export function asyncHandler<
  Req extends Request = Request,
  Res extends Response = Response,
>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<unknown> | unknown,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch(next);
  };
}
