import mongoose, { type ConnectOptions, type Mongoose } from 'mongoose';

import { env, isProd, isTest } from '../config/env';
import { logger } from '../config/logger';

const log = logger.child({ component: 'db' });

let connectionPromise: Promise<Mongoose> | null = null;

const baseOptions: ConnectOptions = {
  dbName: env.DATABASE_NAME,
  autoIndex: !isProd,
  autoCreate: !isProd,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 50,
  minPoolSize: 5,
  heartbeatFrequencyMS: 10_000,
  retryWrites: true,
  retryReads: true,
};

function registerListeners(): void {
  const conn = mongoose.connection;

  conn.on('connected', () => log.info({ host: conn.host, name: conn.name }, 'Mongo connected'));
  conn.on('disconnected', () => log.warn('Mongo disconnected'));
  conn.on('reconnected', () => log.info('Mongo reconnected'));
  conn.on('error', (err) => log.error({ err }, 'Mongo connection error'));
}

/**
 * Connect to MongoDB. Idempotent — calling more than once returns the same
 * in-flight (or settled) promise.
 */
export async function connectDatabase(overrideUri?: string): Promise<Mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  registerListeners();

  mongoose.set('strictQuery', true);
  // NOTE: We intentionally do NOT enable `sanitizeFilter` globally — it would
  // break every server-side query that uses Mongo operators (`$in`, `$or`,
  // `$gte`, etc.). Untrusted filters built from request input must be
  // sanitized explicitly per-call with `mongoose.sanitizeFilter()` or wrapped
  // in `mongoose.trusted()`.
  if (!isProd) {
    mongoose.set('debug', { color: true, shell: false });
  }

  const uri = overrideUri ?? env.DATABASE_URL;
  log.info({ host: maskUri(uri) }, 'Connecting to Mongo');

  connectionPromise = mongoose.connect(uri, baseOptions).catch((err: unknown) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  log.info('Disconnecting Mongo');
  await mongoose.disconnect();
  connectionPromise = null;
}

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    if (mongoose.connection.readyState !== 1) {
      return { ok: false, latencyMs: 0, error: 'not connected' };
    }
    const admin = mongoose.connection.db?.admin();
    if (!admin) return { ok: false, latencyMs: 0, error: 'no admin' };
    await admin.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: (err as Error).message };
  }
}

function maskUri(uri: string): string {
  try {
    const u = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'));
    if (u.password) u.password = '***';
    if (u.username) u.username = u.username.slice(0, 2) + '***';
    return u.host + u.pathname;
  } catch {
    return isTest ? uri : '<unparseable>';
  }
}

export { mongoose };
