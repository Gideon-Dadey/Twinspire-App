import { authenticator } from 'otplib';
import QRCode from 'qrcode';

import { env } from '../config/env';

import { generateNumericCode, generateRandomToken, sha256Hex } from './crypto';

authenticator.options = {
  step: 30,
  window: env.TOTP_WINDOW,
  digits: 6,
};

export interface TotpSetup {
  secret: string;
  uri: string;
  qrDataUrl: string;
}

export interface BackupCodes {
  /** Plaintext codes to show the user once. */
  plain: string[];
  /** Hashes to store. */
  hashes: string[];
}

export function generateTotpSecret(label: string): TotpSetup & { qrDataUrl: string } {
  const secret = authenticator.generateSecret(32);
  const uri = authenticator.keyuri(label, env.TOTP_ISSUER, secret);
  return { secret, uri, qrDataUrl: '' };
}

export async function generateTotpQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 1, width: 256 });
}

export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: token.trim(), secret });
  } catch {
    return false;
  }
}

/** Generate 10 single-use backup codes (formatted XXXX-XXXX) + their hashes. */
export function generateBackupCodes(count = 10): BackupCodes {
  const plain: string[] = [];
  const hashes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = `${generateNumericCode(4)}-${generateNumericCode(4)}`;
    plain.push(code);
    hashes.push(sha256Hex(code));
  }
  return { plain, hashes };
}

/** Consume the first matching backup code; returns the new hash array or null. */
export function consumeBackupCode(code: string, hashes: string[]): string[] | null {
  const target = sha256Hex(code.trim());
  const idx = hashes.indexOf(target);
  if (idx === -1) return null;
  return [...hashes.slice(0, idx), ...hashes.slice(idx + 1)];
}

/** One-time random verification code (e.g. for email-based 2FA fallback). */
export function generateOneTimeCode(): { plain: string; hash: string } {
  const plain = generateNumericCode(6);
  return { plain, hash: sha256Hex(plain) };
}

/** Random recovery token (e.g. for password reset / email verification). */
export function generateOneTimeToken(): { plain: string; hash: string } {
  const plain = generateRandomToken(32);
  return { plain, hash: sha256Hex(plain) };
}
