import { v4 as uuidv4 } from 'uuid';

import type { NextFunction, Request, Response } from 'express';

const HEADER = 'x-request-id';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const incoming = req.headers[HEADER];
    const id =
      typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128
        ? incoming
        : uuidv4();
    req.id = id;
    res.setHeader(HEADER, id);
    next();
  };
}
