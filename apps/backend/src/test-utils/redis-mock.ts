import IoRedisMock from 'ioredis-mock';

import { setRedisClient } from '../services/cache';

/**
 * Replace the real ioredis singleton with an in-memory mock for tests.
 * Returns the mock instance so individual tests can inspect / mutate state.
 */
export function installRedisMock(): IoRedisMock {
  const mock = new IoRedisMock();
  setRedisClient(mock as unknown as Parameters<typeof setRedisClient>[0]);
  return mock;
}

export async function clearRedisMock(client: IoRedisMock): Promise<void> {
  await client.flushall();
}
