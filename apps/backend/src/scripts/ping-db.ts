import 'dotenv/config';

import { connectDatabase, disconnectDatabase, pingDatabase } from '../db/connection';
import { logger } from '../config/logger';

const log = logger.child({ component: 'ping-db' });

async function main(): Promise<void> {
  const started = Date.now();
  log.info('Connecting to MongoDB…');
  await connectDatabase();
  const ping = await pingDatabase();
  log.info({ ping, totalMs: Date.now() - started }, 'Mongo reachable');
  await disconnectDatabase();
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    log.error({ err }, 'Failed to reach MongoDB');
    process.exit(1);
  });
