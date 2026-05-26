import type { Server } from 'node:http';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './db';
import { connectRedis, disconnectRedis } from './services/cache';

const SHUTDOWN_TIMEOUT_MS = 10_000;

export async function startServer(): Promise<Server> {
  await connectDatabase();
  try {
    await connectRedis();
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed at boot — continuing in degraded mode');
  }

  const app = createApp();

  return new Promise<Server>((resolve) => {
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(
        { host: env.HOST, port: env.PORT, env: env.NODE_ENV, prefix: env.API_PREFIX },
        `TwinSpire API listening on http://${env.HOST}:${env.PORT}${env.API_PREFIX}`,
      );
      resolve(server);
    });

    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;
    server.requestTimeout = 30_000;

    const shutdown = (signal: NodeJS.Signals): void => {
      logger.info({ signal }, 'Received shutdown signal, draining connections');
      const forced = setTimeout(() => {
        logger.warn('Forced shutdown — connections did not drain in time');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS).unref();

      server.close(async (err) => {
        clearTimeout(forced);
        if (err) {
          logger.error({ err }, 'Error during server close');
          process.exit(1);
        }
        try {
          await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
        } catch (cleanupErr) {
          logger.error({ err: cleanupErr }, 'Error during cleanup');
        }
        logger.info('Server closed cleanly');
        process.exit(0);
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
