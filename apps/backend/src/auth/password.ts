import bcrypt from 'bcryptjs';

import { STRONG_PASSWORD_REGEX } from '@twinspire/utils';

import { env } from '../config/env';

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'qwerty',
  'qwerty123',
  '12345678',
  '123456789',
  'letmein',
  'welcome',
  'admin123',
  'iloveyou',
  'monkey',
  'dragon',
]);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export interface PasswordStrengthResult {
  ok: boolean;
  reason?:
    | 'too_short'
    | 'too_long'
    | 'missing_lowercase'
    | 'missing_uppercase'
    | 'missing_digit'
    | 'missing_symbol'
    | 'common_password'
    | 'contains_personal_info';
}

export function checkPasswordStrength(
  password: string,
  personal: { email?: string; firstName?: string; lastName?: string } = {},
): PasswordStrengthResult {
  if (password.length < 12) return { ok: false, reason: 'too_short' };
  if (password.length > 128) return { ok: false, reason: 'too_long' };

  if (!/[a-z]/.test(password)) return { ok: false, reason: 'missing_lowercase' };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'missing_uppercase' };
  if (!/\d/.test(password)) return { ok: false, reason: 'missing_digit' };
  if (!/[^A-Za-z0-9]/.test(password)) return { ok: false, reason: 'missing_symbol' };

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return { ok: false, reason: 'missing_symbol' };
  }

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return { ok: false, reason: 'common_password' };

  for (const key of ['email', 'firstName', 'lastName'] as const) {
    const value = personal[key];
    if (value && value.length >= 4 && lower.includes(value.toLowerCase())) {
      return { ok: false, reason: 'contains_personal_info' };
    }
  }

  return { ok: true };
}
