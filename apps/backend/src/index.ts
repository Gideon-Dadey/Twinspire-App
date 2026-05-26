import 'dotenv/config';

import { env } from './config/env';
import { logger } from './config/logger';
import { startServer } from './server';

void startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Fatal error starting server');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  setTimeout(() => process.exit(1), 100).unref();
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
});

logger.info(
  { env: env.NODE_ENV, port: env.PORT, host: env.HOST },
  'TwinSpire backend bootstrap complete',
);
