import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Generate a URL-safe random token of `bytes` length (defaults to 32 → 43 chars base64url). */
export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Generate a short numeric code (e.g. for SMS or backup codes). */
export function generateNumericCode(digits = 6): string {
  if (digits < 1 || digits > 12) {
    throw new RangeError('digits must be between 1 and 12');
  }
  const max = 10 ** digits;
  const buf = randomBytes(4);
  const n = buf.readUInt32BE(0) % max;
  return String(n).padStart(digits, '0');
}

/** Stable SHA-256 hex hash — used for refresh-token storage. */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Constant-time string equality. */
export function safeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
