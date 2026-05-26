import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';

import { env, isProd } from '../config/env';

import { globalRateLimiter } from './rate-limit';

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin not allowed (${origin})`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86_400,
};

const helmetOptions: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: isProd
    ? {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'https:'],
          frameAncestors: ["'none'"],
        },
      }
    : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
};

/**
 * Apply all baseline security + parsing middleware. The order is intentional:
 *  1. helmet first (set headers as early as possible)
 *  2. cors before parsers so preflight is cheap
 *  3. parsers (json, urlencoded, cookies)
 *  4. compression
 *  5. hpp + rate limiting
 */
export function applySecurity(app: Express): void {
  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());
  app.use(hpp());
  app.use(globalRateLimiter);
}
