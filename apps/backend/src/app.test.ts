import request from 'supertest';

import { createApp } from './app';

describe('API smoke', () => {
  const app = createApp();

  it('returns 200 OK and a HealthCheckResponse on /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        environment: expect.any(String),
        checks: expect.objectContaining({ process: { status: 'ok' } }),
      },
    });
  });

  it('echoes the X-Request-Id header when provided', async () => {
    const id = 'test-' + Math.random().toString(36).slice(2);
    const res = await request(app).get('/api/v1/health').set('X-Request-Id', id);
    expect(res.headers['x-request-id']).toBe(id);
  });

  it('returns a 404 envelope for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: expect.objectContaining({ code: 'NOT_FOUND' }),
    });
  });
});
