import { logger } from '../../config/logger';

import { getRedis } from './redis';

const log = logger.child({ component: 'cache' });

export interface CacheSetOptions {
  /** TTL in seconds. */
  ttlSeconds?: number;
}

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await getRedis().get(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      log.warn({ err, key }, 'cache get failed');
      return null;
    }
  }

  async set(key: string, value: unknown, opts: CacheSetOptions = {}): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (opts.ttlSeconds && opts.ttlSeconds > 0) {
        await getRedis().set(key, payload, 'EX', opts.ttlSeconds);
      } else {
        await getRedis().set(key, payload);
      }
    } catch (err) {
      log.warn({ err, key }, 'cache set failed');
    }
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    try {
      return await getRedis().del(...keys);
    } catch (err) {
      log.warn({ err, keys }, 'cache del failed');
      return 0;
    }
  }

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const redis = getRedis();
    const value = await redis.incr(key);
    if (value === 1 && ttlSeconds && ttlSeconds > 0) {
      await redis.expire(key, ttlSeconds);
    }
    return value;
  }

  /** Cache-aside helper — returns cached value or computes & writes one. */
  async wrap<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    if (value !== undefined) await this.set(key, value, { ttlSeconds });
    return value;
  }

  /** Single-shot lock via SET NX EX. Returns the lock token, or null if not acquired. */
  async acquireLock(key: string, ttlSeconds: number): Promise<string | null> {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const res = await getRedis().set(key, token, 'EX', ttlSeconds, 'NX');
    return res === 'OK' ? token : null;
  }

  async releaseLock(key: string, token: string): Promise<void> {
    const script =
      'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';
    try {
      await getRedis().eval(script, 1, key, token);
    } catch (err) {
      log.warn({ err, key }, 'cache releaseLock failed');
    }
  }
}

export const cacheService = new CacheService();
