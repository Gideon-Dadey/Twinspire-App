import type { Logger } from 'pino';

declare module 'express-serve-static-core' {
  interface Request {
    /** Per-request child logger attached by pino-http. */
    log: Logger;
  }
}

export {};
