import { HttpError } from '../utils/http-error';

import type { NextFunction, Request, Response } from 'express';


export function notFound() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    next(HttpError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  };
}
