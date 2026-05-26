import { Client, type ClientOptions } from '@elastic/elasticsearch';

import { env } from '../../config/env';
import { logger } from '../../config/logger';

let client: Client | null = null;

export function isSearchConfigured(): boolean {
  return Boolean(env.ELASTICSEARCH_URL);
}

export function getSearchClient(): Client | null {
  if (client) return client;
  if (!isSearchConfigured()) return null;

  const opts: ClientOptions = {
    node: env.ELASTICSEARCH_URL!,
    tls: env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED ? undefined : { rejectUnauthorized: false },
  };
  if (env.ELASTICSEARCH_API_KEY) {
    opts.auth = { apiKey: env.ELASTICSEARCH_API_KEY };
  } else if (env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD) {
    opts.auth = { username: env.ELASTICSEARCH_USERNAME, password: env.ELASTICSEARCH_PASSWORD };
  }

  try {
    client = new Client(opts);
    logger.info({ url: env.ELASTICSEARCH_URL }, 'Elasticsearch client initialised');
  } catch (err) {
    logger.error({ err }, 'Failed to initialise Elasticsearch client; falling back to Mongo search');
    client = null;
  }
  return client;
}

export async function pingSearch(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const c = getSearchClient();
  if (!c) return { ok: false, error: 'NOT_CONFIGURED' };
  const start = Date.now();
  try {
    await c.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
