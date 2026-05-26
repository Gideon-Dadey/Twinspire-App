import express, { type Express } from 'express';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { requestId } from './middleware/request-id';
import { applySecurity } from './middleware/security';
import { paypalWebhookRouter, stripeWebhookRouter } from './modules/payments';
import v1Router from './routes';

export function createApp(): Express {
  const app = express();

  app.use(requestId());
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customProps: (req) => ({ requestId: (req as { id?: string }).id }),
      serializers: {
        req(req) {
          return {
            id: (req as { id?: string }).id,
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
          };
        },
      },
    }),
  );

  // Webhook routes MUST be mounted before applySecurity() so Stripe gets the
  // raw request body for signature verification (json/body-parser would
  // otherwise consume the stream).
  app.use(`${env.API_PREFIX}/webhooks`, stripeWebhookRouter);
  app.use(`${env.API_PREFIX}/webhooks`, paypalWebhookRouter);

  applySecurity(app);

  app.use(env.API_PREFIX, v1Router);

  app.use(notFound());
  app.use(errorHandler);

  return app;
}
