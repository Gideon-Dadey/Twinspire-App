import 'dotenv/config';

import { env, isProd } from '../config/env';
import { logger } from '../config/logger';
import { connectDatabase, disconnectDatabase, mongoose } from '../db';

const log = logger.child({ component: 'reset-db' });

async function main(): Promise<void> {
  if (isProd) {
    log.error('Refusing to reset database in production');
    process.exit(2);
  }

  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    log.error('No database handle available');
    process.exit(1);
  }

  log.warn({ db: env.DATABASE_NAME }, 'Dropping entire database');
  await db.dropDatabase();

  log.info('Database dropped');
  await disconnectDatabase();
}

main().catch(async (err: unknown) => {
  log.error({ err }, 'Reset failed');
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
