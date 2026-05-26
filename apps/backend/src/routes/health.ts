import { Router } from 'express';

import type { HealthCheckResponse } from '@twinspire/types';

import { env } from '../config/env';
import { pingDatabase } from '../db';
import { pingRedis } from '../services/cache';
import { sendSuccess } from '../utils/response';

const router: Router = Router();
const startedAt = Date.now();

router.get('/health', (_req, res) => {
  const payload: HealthCheckResponse = {
    status: 'ok',
    uptime: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    environment: env.NODE_ENV,
    checks: { process: { status: 'ok' } },
  };
  sendSuccess(res, payload);
});

router.get('/health/ready', async (_req, res) => {
  const [db, cache] = await Promise.all([pingDatabase(), pingRedis()]);

  const overall: HealthCheckResponse['status'] = db.ok && cache.ok ? 'ok' : 'degraded';

  const payload: HealthCheckResponse = {
    status: overall,
    uptime: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    environment: env.NODE_ENV,
    checks: {
      process: { status: 'ok' },
      database: {
        status: db.ok ? 'ok' : 'down',
        latencyMs: db.latencyMs,
        ...(db.error ? { message: db.error } : {}),
      },
      cache: {
        status: cache.ok ? 'ok' : 'down',
        latencyMs: cache.latencyMs,
        ...(cache.error ? { message: cache.error } : {}),
      },
      search: { status: 'ok', message: 'Not wired until Phase 4' },
    },
  };

  const httpStatus = db.ok && cache.ok ? 200 : 503;
  sendSuccess(res, payload, httpStatus);
});

export default router;
