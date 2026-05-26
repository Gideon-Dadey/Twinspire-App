import { authenticator } from 'otplib';

import {
  consumeBackupCode,
  generateBackupCodes,
  generateOneTimeToken,
  generateTotpSecret,
  verifyTotpToken,
} from './totp';

describe('TOTP', () => {
  it('produces a secret and a working keyuri', () => {
    const setup = generateTotpSecret('user@example.com');
    expect(setup.secret.length).toBeGreaterThanOrEqual(32);
    expect(/^[A-Z2-7]+$/.test(setup.secret)).toBe(true);
    expect(setup.uri).toMatch(/^otpauth:\/\/totp\/.+\?/);
    expect(setup.uri).toContain('issuer=TwinSpire');
  });

  it('verifies a freshly generated TOTP code', () => {
    const setup = generateTotpSecret('user@example.com');
    const code = authenticator.generate(setup.secret);
    expect(verifyTotpToken(code, setup.secret)).toBe(true);
  });

  it('rejects an invalid code', () => {
    const setup = generateTotpSecret('user@example.com');
    expect(verifyTotpToken('000000', setup.secret)).toBe(false);
  });
});

describe('backup codes', () => {
  it('generates 10 codes with matching hash count', () => {
    const { plain, hashes } = generateBackupCodes(10);
    expect(plain).toHaveLength(10);
    expect(hashes).toHaveLength(10);
    expect(new Set(plain).size).toBe(10);
    expect(new Set(hashes).size).toBe(10);
  });

  it('consumes a backup code and removes its hash', () => {
    const { plain, hashes } = generateBackupCodes(5);
    const first = plain[0];
    if (!first) throw new Error('expected at least one backup code');
    const remaining = consumeBackupCode(first, hashes);
    expect(remaining).not.toBeNull();
    expect(remaining).toHaveLength(4);
  });

  it('returns null when consuming an unknown code', () => {
    const { hashes } = generateBackupCodes(3);
    expect(consumeBackupCode('0000-0000', hashes)).toBeNull();
  });
});

describe('one-time tokens', () => {
  it('returns a base64url-ish plain token and a sha256 hex hash', () => {
    const { plain, hash } = generateOneTimeToken();
    expect(plain.length).toBeGreaterThan(20);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });
});
