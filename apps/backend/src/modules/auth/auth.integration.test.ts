import { authenticator } from 'otplib';
import request from 'supertest';

import { createApp } from '../../app';
import { generateOneTimeToken } from '../../auth/totp';
import { Session } from '../../models/session.model';
import { User } from '../../models/user.model';
import { cacheService } from '../../services/cache';
import { setEmailTransport } from '../../services/email';
import {
  clearCollections,
  startInMemoryMongo,
  stopInMemoryMongo,
} from '../../test-utils/mongo-memory';
import { clearRedisMock, installRedisMock } from '../../test-utils/redis-mock';

interface CapturedEmail {
  to: string;
  subject: string;
  html: string;
}

function extractCookie(res: { headers: Record<string, unknown> }, name: string): string | null {
  const raw = res.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return match.split(';')[0] ?? null;
}

describe('Auth integration', () => {
  const app = createApp();
  const captured: CapturedEmail[] = [];
  let redis: ReturnType<typeof installRedisMock>;

  beforeAll(async () => {
    await startInMemoryMongo();
    redis = installRedisMock();
    setEmailTransport({
      async send(msg) {
        captured.push({
          to: Array.isArray(msg.to) ? (msg.to[0] ?? '') : msg.to,
          subject: msg.subject,
          html: msg.html,
        });
        return { id: `test-${captured.length}`, accepted: [String(msg.to)] };
      },
    });
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
    await clearRedisMock(redis);
    captured.length = 0;
  });

  const credentials = {
    email: 'alex@example.com',
    password: 'CorrectHorse!Battery1Staple',
    firstName: 'Alex',
    lastName: 'Tester',
  };

  /** Register + verify via the same Redis store the controller uses. */
  async function registerAndVerify(): Promise<void> {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);
    if (res.status !== 201) throw new Error(`register failed: ${res.status}`);

    const user = await User.findOne({ email: credentials.email });
    if (!user) throw new Error('user not created');

    const oneTime = generateOneTimeToken();
    await cacheService.set('auth:verify:' + oneTime.hash, user._id.toString(), {
      ttlSeconds: 3600,
    });
    const verify = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: oneTime.plain });
    if (verify.status !== 200) throw new Error(`verify failed: ${verify.status}`);
  }

  async function loginWithCookies(): Promise<{ accessToken: string; refreshCookie: string }> {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
    const cookie = extractCookie(res, 'ts_rt');
    if (!cookie) throw new Error('refresh cookie not set');
    return { accessToken: res.body.data.accessToken as string, refreshCookie: cookie };
  }

  describe('register + verify', () => {
    it('registers a new user and sends a verification email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(credentials);
      expect(res.status).toBe(201);
      const user = await User.findOne({ email: credentials.email });
      expect(user).not.toBeNull();
      expect(user?.status).toBe('pending');
      expect(captured).toHaveLength(1);
      expect(captured[0]?.subject).toMatch(/verify/i);
    });

    it('rejects duplicate registrations', async () => {
      await request(app).post('/api/v1/auth/register').send(credentials);
      const dupe = await request(app).post('/api/v1/auth/register').send(credentials);
      expect(dupe.status).toBe(409);
      expect(dupe.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('rejects weak passwords', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...credentials, password: 'NoSymbolsHere1' });
      expect(res.status).toBe(422);
    });

    it('verifies an email via the issued token', async () => {
      await registerAndVerify();
      const user = await User.findOne({ email: credentials.email });
      expect(user?.status).toBe('active');
      expect(user?.emailVerifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await registerAndVerify();
    });

    it('logs in with correct credentials and returns tokens', async () => {
      const { accessToken, refreshCookie } = await loginWithCookies();
      expect(accessToken).toEqual(expect.any(String));
      expect(refreshCookie).toContain('ts_rt=');
    });

    it('rejects bad passwords', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: credentials.email, password: 'wrong-password' });
      expect(res.status).toBe(401);
    });
  });

  describe('refresh rotation + reuse detection', () => {
    beforeEach(async () => {
      await registerAndVerify();
    });

    it('rotates refresh tokens on every call', async () => {
      const { refreshCookie } = await loginWithCookies();

      const first = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .send({});
      expect(first.status).toBe(200);
      const newCookie = extractCookie(first, 'ts_rt');
      expect(newCookie).not.toBe(refreshCookie);

      const second = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', newCookie!)
        .send({});
      expect(second.status).toBe(200);

      const revoked = await Session.countDocuments({ revokedAt: { $ne: null } });
      expect(revoked).toBeGreaterThanOrEqual(2);
    });

    it('revokes every live session when an old refresh token is replayed', async () => {
      const { refreshCookie } = await loginWithCookies();

      const ok = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .send({});
      expect(ok.status).toBe(200);

      const replay = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .send({});
      expect(replay.status).toBe(401);
      expect(replay.body.error.code).toBe('REFRESH_REUSE');

      const live = await Session.countDocuments({ revokedAt: null });
      expect(live).toBe(0);
    });
  });

  describe('password reset', () => {
    it('issues a reset link and lets the user log in with the new password', async () => {
      await registerAndVerify();

      const requestReset = await request(app)
        .post('/api/v1/auth/password/reset/request')
        .send({ email: credentials.email });
      expect(requestReset.status).toBe(204);

      const user = await User.findOne({ email: credentials.email });
      const oneTime = generateOneTimeToken();
      await cacheService.set('auth:reset:' + oneTime.hash, user!._id.toString(), {
        ttlSeconds: 600,
      });

      const reset = await request(app)
        .post('/api/v1/auth/password/reset')
        .send({ token: oneTime.plain, password: 'AnotherStrong!Password1' });
      expect(reset.status).toBe(204);

      const oldLogin = await request(app).post('/api/v1/auth/login').send({
        email: credentials.email,
        password: credentials.password,
      });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app).post('/api/v1/auth/login').send({
        email: credentials.email,
        password: 'AnotherStrong!Password1',
      });
      expect(newLogin.status).toBe(200);
    });
  });

  describe('2FA setup', () => {
    it('completes the full setup flow and enforces TOTP on subsequent logins', async () => {
      await registerAndVerify();
      const { accessToken } = await loginWithCookies();

      const setup = await request(app)
        .post('/api/v1/auth/2fa/setup')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(setup.status).toBe(200);
      const secret = setup.body.data.secret as string;

      const code = authenticator.generate(secret);
      const confirm = await request(app)
        .post('/api/v1/auth/2fa/confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ totpCode: code });
      expect(confirm.status).toBe(200);
      expect(confirm.body.data.backupCodes).toHaveLength(10);

      const missing = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: credentials.email, password: credentials.password });
      expect(missing.status).toBe(401);
      expect(missing.body.error.code).toBe('TOTP_REQUIRED');

      const fresh = authenticator.generate(secret);
      const withTotp = await request(app).post('/api/v1/auth/login').send({
        email: credentials.email,
        password: credentials.password,
        totpCode: fresh,
      });
      expect(withTotp.status).toBe(200);
    });
  });

  describe('protected endpoints + RBAC', () => {
    it('returns the current user on /users/me with a valid token', async () => {
      await registerAndVerify();
      const { accessToken } = await loginWithCookies();

      const me = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(me.status).toBe(200);
      expect(me.body.data.user.email).toBe(credentials.email);
    });

    it('rejects /users/me without a token', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('rejects /users/me with an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });
  });

});
