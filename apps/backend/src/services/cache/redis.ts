import Redis, { type RedisOptions } from 'ioredis';

import { env, isTest } from '../../config/env';
import { logger } from '../../config/logger';

const log = logger.child({ component: 'redis' });

let client: Redis | null = null;

function buildClient(): Redis {
  const options: RedisOptions = {
    keyPrefix: env.REDIS_PREFIX,
    lazyConnect: true,
    enableAutoPipelining: true,
    maxRetriesPerRequest: 3,
    // Exponential backoff that quickly settles at 30s between attempts so a
    // missing Redis doesn't flood the logs in dev (still reconnects when the
    // server eventually comes online).
    retryStrategy: (times) => Math.min(200 * 2 ** times, 30_000),
    reconnectOnError: (err) => {
      if (err.message.includes('READONLY')) return true;
      return false;
    },
  };

  const instance = new Redis(env.REDIS_URL, options);

  // Track health so we don't spam an identical error every retry. The first
  // failure is logged at ERROR; subsequent identical failures drop to DEBUG
  // until a successful connect/ready event resets the gate.
  let lastErrorCode: string | undefined;
  let degradedLogged = false;

  instance.on('connect', () => {
    lastErrorCode = undefined;
    degradedLogged = false;
    log.info('Redis connected');
  });
  instance.on('ready', () => log.info('Redis ready'));
  instance.on('error', (err: Error & { code?: string }) => {
    const code = err.code ?? err.message;
    if (code === lastErrorCode) {
      log.debug({ err }, 'Redis error (suppressed, same as previous)');
      return;
    }
    lastErrorCode = code;
    if (code === 'ECONNREFUSED' && degradedLogged) {
      log.debug({ err }, 'Redis still unreachable');
      return;
    }
    if (code === 'ECONNREFUSED') {
      degradedLogged = true;
      log.warn({ code }, 'Redis unreachable — cache disabled, will keep retrying in background');
      return;
    }
    log.error({ err }, 'Redis error');
  });
  instance.on('end', () => log.warn('Redis connection ended'));
  instance.on('reconnecting', (delayMs: number) => {
    if (degradedLogged) {
      log.debug({ delayMs }, 'Redis reconnecting');
    } else {
      log.info({ delayMs }, 'Redis reconnecting');
    }
  });

  return instance;
}

/** Returns the singleton ioredis client. Lazy-connects on first use. */
export function getRedis(): Redis {
  if (!client) client = buildClient();
  return client;
}

/** Inject a custom client (used by tests with `ioredis-mock`). */
export function setRedisClient(instance: Redis): void {
  client = instance;
}

export async function connectRedis(): Promise<void> {
  if (isTest) return;
  const c = getRedis();
  if (c.status === 'ready' || c.status === 'connect') return;
  await c.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    client.disconnect();
  }
  client = null;
}

export async function pingRedis(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const c = getRedis();
    const res = await c.ping();
    return { ok: res === 'PONG', latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: (err as Error).message };
  }
}
