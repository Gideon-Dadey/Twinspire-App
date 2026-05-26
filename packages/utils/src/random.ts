import { ORDER_NUMBER_PREFIX, TICKET_NUMBER_PREFIX } from './constants';

const ALPHANUMERIC_UPPER = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a short, non-cryptographic, human-friendly random id.
 * Avoids ambiguous characters (0/O, 1/I/L).
 */
export function shortId(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHANUMERIC_UPPER[Math.floor(Math.random() * ALPHANUMERIC_UPPER.length)];
  }
  return out;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${ORDER_NUMBER_PREFIX}${yy}${mm}-${shortId(8)}`;
}

export function generateTicketNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  return `${TICKET_NUMBER_PREFIX}${yy}-${shortId(6)}`;
}
