import {
  signAccessToken,
  signRefreshToken,
  tokenExpiry,
  ttlToMs,
  verifyAccessToken,
  verifyRefreshToken,
} from './tokens';

describe('tokens', () => {
  describe('ttlToMs', () => {
    it.each([
      ['15m', 15 * 60_000],
      ['30d', 30 * 86_400_000],
      ['2h', 2 * 3_600_000],
      ['500ms', 500],
      ['1000', 1000],
    ])('parses %s', (ttl, expected) => {
      expect(ttlToMs(ttl)).toBe(expected);
    });

    it('rejects invalid TTLs', () => {
      expect(() => ttlToMs('1week')).toThrow();
    });
  });

  describe('access tokens', () => {
    it('signs and verifies an access token', () => {
      const token = signAccessToken({
        sub: 'user-1',
        email: 'a@b.com',
        role: 'customer',
        sid: 'session-1',
      });
      const claims = verifyAccessToken(token);
      expect(claims.sub).toBe('user-1');
      expect(claims.email).toBe('a@b.com');
      expect(claims.role).toBe('customer');
      expect(claims.sid).toBe('session-1');
      expect(claims.type).toBe('access');
    });

    it('rejects a refresh token when expecting access', () => {
      const { token } = signRefreshToken({ sub: 'user-1', sid: 'session-1' });
      expect(() => verifyAccessToken(token)).toThrow();
    });
  });

  describe('refresh tokens', () => {
    it('signs with a generated jti', () => {
      const { token, jti } = signRefreshToken({ sub: 'user-1', sid: 'session-1' });
      expect(jti).toHaveLength(32);
      const claims = verifyRefreshToken(token);
      expect(claims.jti).toBe(jti);
      expect(claims.type).toBe('refresh');
    });
  });

  it('tokenExpiry returns a future Date matching the TTL', () => {
    const before = Date.now();
    const exp = tokenExpiry('15m', before);
    expect(exp.getTime()).toBe(before + 15 * 60_000);
  });
});
