import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async route handler so that any thrown / rejected error reaches the
 * Express error pipeline instead of becoming an unhandled promise rejection.
 */
export function asyncHandler<TReq extends Request = Request, TRes extends Response = Response>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown> | unknown,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req as TReq, res as TRes, next)).catch(next);
  };
}
