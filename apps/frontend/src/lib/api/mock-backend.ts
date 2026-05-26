/**
 * Client-only mock implementation of the TwinSpire backend. The auth +
 * dashboard surfaces in Phase 7 talk to a single API facade that picks
 * between this mock and the real `apiFetch` based on
 * `NEXT_PUBLIC_USE_MOCK_API`. The mock persists state to localStorage so
 * the experience survives reloads.
 *
 * IMPORTANT: this code only runs in the browser. Server components must
 * read data from the seeded mock data or `apiFetch` directly.
 */

import type { Address, Order, OrderStatus, Product, PublicUser } from '@twinspire/types';

import { getProductById } from '@/data/products';

import { ADMIN_PASSWORD, STAFF_SEED_USERS } from './admin-mock-data';
import {
  DEMO_ADDRESSES,
  DEMO_ORDERS,
  DEMO_PASSWORD,
  DEMO_USER,
  DEMO_USER_ID,
  DEMO_WISHLIST_PRODUCT_IDS,
  type MockUserRecord,
} from './mock-data';
import { mockKeys, readJson, removeKey, writeJson } from './mock-storage';
import type {
  AddressListResponse,
  AuthRegisterResponse,
  AuthSession,
  AuthSessionResponse,
  ChangePasswordInput,
  CreateAddressInput,
  LoginInput,
  MessageResponse,
  OrderListItem,
  OrderListResponse,
  RecentlyViewedResponse,
  RegisterInput,
  ResetPasswordInput,
  SocialLoginInput,
  TwoFactorSetupResult,
  UpdateAddressInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  WishlistItem,
  WishlistResponse,
} from './types';

const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export class MockApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}

function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Bump this whenever the seed shape changes (new staff accounts, new fixture
 * orders, etc.) so existing browsers re-apply the seeds. Older stores are
 * detected by a missing/lower `seedVersion` and the staff accounts +
 * passwords are force-rewritten — without nuking unrelated user data.
 */
const SEED_VERSION = 2;

function ensureSeeded(): void {
  const storedVersion = readJson<number | null>(mockKeys.seedVersion, null);
  const isStale = storedVersion === null || storedVersion < SEED_VERSION;

  const users = readJson<MockUserRecord[] | null>(mockKeys.users, null);
  if (!users || users.length === 0) {
    writeJson(mockKeys.users, [DEMO_USER, ...STAFF_SEED_USERS]);
    const passwords = readJson<Record<string, string>>(mockKeys.passwords, {});
    passwords[DEMO_USER_ID] = DEMO_PASSWORD;
    for (const staff of STAFF_SEED_USERS) passwords[staff.id] = ADMIN_PASSWORD;
    writeJson(mockKeys.passwords, passwords);
  } else {
    // Make sure staff seed accounts are present even on existing installs.
    const ids = new Set(users.map((u) => u.id));
    const merged = [...users];
    let mutated = false;
    for (const staff of STAFF_SEED_USERS) {
      if (!ids.has(staff.id)) {
        merged.push(staff);
        mutated = true;
      } else if (isStale) {
        // Replace any drifted staff record (e.g. older role/2FA shape) with the
        // canonical seed so admins keep working after a code update.
        const idx = merged.findIndex((u) => u.id === staff.id);
        if (idx >= 0) {
          merged[idx] = staff;
          mutated = true;
        }
      }
    }
    if (mutated) writeJson(mockKeys.users, merged);
    const passwords = readJson<Record<string, string>>(mockKeys.passwords, {});
    let pwMutated = false;
    for (const staff of STAFF_SEED_USERS) {
      if (!passwords[staff.id] || isStale) {
        passwords[staff.id] = ADMIN_PASSWORD;
        pwMutated = true;
      }
    }
    if (pwMutated) writeJson(mockKeys.passwords, passwords);
  }

  if (isStale) writeJson(mockKeys.seedVersion, SEED_VERSION);
  const addresses = readJson<Address[] | null>(mockKeys.addresses(DEMO_USER_ID), null);
  if (!addresses) writeJson(mockKeys.addresses(DEMO_USER_ID), DEMO_ADDRESSES);
  const orders = readJson<Order[] | null>(mockKeys.orders(DEMO_USER_ID), null);
  if (!orders) writeJson(mockKeys.orders(DEMO_USER_ID), DEMO_ORDERS);
  const wishlist = readJson<string[] | null>(mockKeys.wishlist(DEMO_USER_ID), null);
  if (!wishlist) writeJson(mockKeys.wishlist(DEMO_USER_ID), DEMO_WISHLIST_PRODUCT_IDS);
}

function toPublicUser(record: MockUserRecord, addresses: Address[]): PublicUser {
  return {
    id: record.id,
    email: record.email,
    emailVerifiedAt: record.emailVerifiedAt,
    phone: record.phone,
    phoneVerifiedAt: record.phoneVerifiedAt,
    firstName: record.firstName,
    lastName: record.lastName,
    displayName: record.displayName,
    avatarUrl: record.avatarUrl,
    role: record.role,
    status: record.status,
    twoFactorEnabled: record.twoFactorEnabled,
    lastLoginAt: record.lastLoginAt,
    preferences: record.preferences,
    addresses,
    loyaltyPoints: record.loyaltyPoints,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: null,
  };
}

function readUsers(): MockUserRecord[] {
  ensureSeeded();
  return readJson<MockUserRecord[]>(mockKeys.users, []);
}

function writeUsers(users: MockUserRecord[]): void {
  writeJson(mockKeys.users, users);
}

function findUserByEmail(email: string): MockUserRecord | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

function findUserById(id: string): MockUserRecord | undefined {
  return readUsers().find((u) => u.id === id);
}

function readPasswords(): Record<string, string> {
  return readJson<Record<string, string>>(mockKeys.passwords, {});
}

function writePasswords(map: Record<string, string>): void {
  writeJson(mockKeys.passwords, map);
}

function readAddresses(userId: string): Address[] {
  return readJson<Address[]>(mockKeys.addresses(userId), []);
}

function writeAddresses(userId: string, addresses: Address[]): void {
  writeJson(mockKeys.addresses(userId), addresses);
}

function readWishlist(userId: string): string[] {
  return readJson<string[]>(mockKeys.wishlist(userId), []);
}

function writeWishlist(userId: string, ids: string[]): void {
  writeJson(mockKeys.wishlist(userId), ids);
}

function readRecent(userId: string): Array<{ productId: string; viewedAt: string }> {
  return readJson<Array<{ productId: string; viewedAt: string }>>(
    mockKeys.recentlyViewed(userId),
    [],
  );
}

function writeRecent(userId: string, items: Array<{ productId: string; viewedAt: string }>): void {
  writeJson(mockKeys.recentlyViewed(userId), items.slice(0, 30));
}

function readOrders(userId: string): Order[] {
  return readJson<Order[]>(mockKeys.orders(userId), []);
}

function writeOrders(userId: string, orders: Order[]): void {
  writeJson(mockKeys.orders(userId), orders);
}

function readSessions(userId: string): AuthSession[] {
  return readJson<AuthSession[]>(mockKeys.sessions(userId), []);
}

function writeSessions(userId: string, sessions: AuthSession[]): void {
  writeJson(mockKeys.sessions(userId), sessions);
}

function readPendingTwoFactor(userId: string): { secret: string; backupCodes: string[] } | null {
  return readJson<{ secret: string; backupCodes: string[] } | null>(
    mockKeys.pendingTwoFactor(userId),
    null,
  );
}

function writePendingTwoFactor(userId: string, payload: { secret: string; backupCodes: string[] } | null): void {
  if (payload === null) {
    removeKey(mockKeys.pendingTwoFactor(userId));
  } else {
    writeJson(mockKeys.pendingTwoFactor(userId), payload);
  }
}

function readTwoFactor(userId: string): { secret: string; backupCodes: string[] } | null {
  return readJson<{ secret: string; backupCodes: string[] } | null>(mockKeys.twoFactor(userId), null);
}

function writeTwoFactor(userId: string, payload: { secret: string; backupCodes: string[] } | null): void {
  if (payload === null) {
    removeKey(mockKeys.twoFactor(userId));
  } else {
    writeJson(mockKeys.twoFactor(userId), payload);
  }
}

function newSession(userId: string, deviceLabel?: string, current = true): AuthSession {
  const created = nowIso();
  const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();
  return {
    id: randomId('sess'),
    userId,
    deviceLabel: deviceLabel ?? 'Web browser',
    ipAddress: '127.0.0.1',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    lastUsedAt: created,
    createdAt: created,
    expiresAt: expires,
    isCurrent: current,
  };
}

function tokenPayload(user: PublicUser): AuthSessionResponse {
  return {
    accessToken: `mock.access.${randomId('jwt')}.${user.id}`,
    accessExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
    user,
  };
}

function getCurrentSessionUserId(): string | null {
  return readJson<string | null>(mockKeys.session, null);
}

function setCurrentSessionUserId(id: string | null): void {
  if (id === null) {
    removeKey(mockKeys.session);
  } else {
    writeJson(mockKeys.session, id);
  }
}

function orderListItem(order: Order): OrderListItem {
  const previewImages = order.items
    .map((it) => it.image?.url)
    .filter((u): u is string => Boolean(u))
    .slice(0, 3);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.placedAt,
    total: order.totals.total,
    itemCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
    previewImages,
  };
}

function fakeBackupCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    const a = Math.floor(1000 + Math.random() * 9000);
    const b = Math.floor(1000 + Math.random() * 9000);
    return `${a}-${b}`;
  });
}

function fakeOtpSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let out = '';
  for (let i = 0; i < 32; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export const mockBackend = {
  // ---- auth ----
  async register(input: RegisterInput): Promise<AuthRegisterResponse> {
    await delay();
    if (input.password.length < 12) {
      throw new MockApiError(422, 'WEAK_PASSWORD', 'Password must be at least 12 characters');
    }
    const existing = findUserByEmail(input.email);
    if (existing) {
      throw new MockApiError(409, 'EMAIL_IN_USE', 'An account with that email already exists');
    }
    const id = randomId('usr');
    const record: MockUserRecord = {
      id,
      email: input.email.toLowerCase().trim(),
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: `${input.firstName} ${input.lastName}`.trim(),
      phone: input.phone,
      role: 'customer',
      status: 'pending',
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      twoFactorEnabled: false,
      lastLoginAt: null,
      preferences: {
        locale: 'en-US',
        currency: 'USD',
        theme: 'system',
        marketingOptIn: input.marketingOptIn ?? false,
        newsletter: input.newsletter ?? false,
      },
      loyaltyPoints: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const users = readUsers();
    users.push(record);
    writeUsers(users);
    const passwords = readPasswords();
    passwords[id] = input.password;
    writePasswords(passwords);
    writeAddresses(id, []);
    writeOrders(id, []);
    writeWishlist(id, []);

    return {
      user: toPublicUser(record, []),
      message: 'Account created. Check your inbox to verify your email.',
    };
  },

  async login(input: LoginInput): Promise<AuthSessionResponse> {
    await delay();
    const user = findUserByEmail(input.email);
    if (!user) {
      throw new MockApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }
    const passwords = readPasswords();
    if (passwords[user.id] !== input.password) {
      throw new MockApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }
    if (user.twoFactorEnabled) {
      const code = input.totpCode?.trim();
      const backup = input.backupCode?.trim();
      if (!code && !backup) {
        throw new MockApiError(401, 'TOTP_REQUIRED', 'Two-factor authentication is required');
      }
      if (code && !/^\d{6}$/.test(code)) {
        throw new MockApiError(401, 'INVALID_TOTP', 'Two-factor code must be 6 digits');
      }
      if (backup) {
        const tf = readTwoFactor(user.id);
        if (!tf || !tf.backupCodes.includes(backup)) {
          throw new MockApiError(401, 'INVALID_BACKUP_CODE', 'Backup code is invalid');
        }
        const remaining = tf.backupCodes.filter((c) => c !== backup);
        writeTwoFactor(user.id, { ...tf, backupCodes: remaining });
      }
    }
    const updated: MockUserRecord = {
      ...user,
      lastLoginAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeUsers(readUsers().map((u) => (u.id === user.id ? updated : u)));
    setCurrentSessionUserId(user.id);
    const sessions = readSessions(user.id).map((s) => ({ ...s, isCurrent: false }));
    sessions.push(newSession(user.id, input.deviceLabel));
    writeSessions(user.id, sessions);
    return tokenPayload(toPublicUser(updated, readAddresses(user.id)));
  },

  async refresh(): Promise<AuthSessionResponse> {
    await delay(100);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'MISSING_REFRESH', 'Not authenticated');
    const user = findUserById(userId);
    if (!user) throw new MockApiError(401, 'USER_NOT_FOUND', 'User not found');
    return tokenPayload(toPublicUser(user, readAddresses(user.id)));
  },

  async logout(everywhere = false): Promise<void> {
    await delay(80);
    const userId = getCurrentSessionUserId();
    if (userId) {
      if (everywhere) {
        writeSessions(userId, []);
      } else {
        writeSessions(
          userId,
          readSessions(userId).filter((s) => !s.isCurrent),
        );
      }
    }
    setCurrentSessionUserId(null);
  },

  async me(): Promise<{ user: PublicUser }> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const user = findUserById(userId);
    if (!user) throw new MockApiError(404, 'USER_NOT_FOUND', 'User not found');
    return { user: toPublicUser(user, readAddresses(user.id)) };
  },

  async verifyEmail(_input: { token: string }): Promise<MessageResponse> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) {
      // For the mock, verify the demo user
      const users = readUsers();
      const target = users[0];
      if (target) {
        target.emailVerifiedAt = nowIso();
        target.status = 'active';
        writeUsers(users);
      }
      return { message: 'Email verified successfully' };
    }
    const users = readUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) throw new MockApiError(404, 'USER_NOT_FOUND', 'User not found');
    target.emailVerifiedAt = nowIso();
    target.status = 'active';
    target.updatedAt = nowIso();
    writeUsers(users);
    return { message: 'Email verified successfully' };
  },

  async resendVerifyEmail(_email: string): Promise<void> {
    await delay();
  },

  async requestPasswordReset(_email: string): Promise<void> {
    await delay();
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await delay();
    if (input.password.length < 12) {
      throw new MockApiError(422, 'WEAK_PASSWORD', 'Password is too weak');
    }
    // For the mock we just rotate the demo password if no user mapping exists
    const passwords = readPasswords();
    const userId = getCurrentSessionUserId() ?? DEMO_USER_ID;
    passwords[userId] = input.password;
    writePasswords(passwords);
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const passwords = readPasswords();
    if (passwords[userId] !== input.currentPassword) {
      throw new MockApiError(401, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
    }
    if (input.newPassword.length < 12) {
      throw new MockApiError(422, 'WEAK_PASSWORD', 'New password must be at least 12 characters');
    }
    passwords[userId] = input.newPassword;
    writePasswords(passwords);
    setCurrentSessionUserId(null);
  },

  async begin2faSetup(): Promise<TwoFactorSetupResult> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const secret = fakeOtpSecret();
    const backupCodes = fakeBackupCodes();
    writePendingTwoFactor(userId, { secret, backupCodes });
    const otpauthUrl = `otpauth://totp/TwinSpire:${findUserById(userId)?.email ?? 'demo'}?secret=${secret}&issuer=TwinSpire`;
    return { secret, otpauthUrl, backupCodes };
  },

  async confirm2faSetup(totpCode: string): Promise<{ twoFactorEnabled: boolean; backupCodes: string[] }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const pending = readPendingTwoFactor(userId);
    if (!pending) throw new MockApiError(400, 'NO_SETUP_PENDING', 'Run 2FA setup first');
    if (!/^\d{6}$/.test(totpCode)) {
      throw new MockApiError(401, 'INVALID_TOTP', 'Two-factor code must be 6 digits');
    }
    writeTwoFactor(userId, pending);
    writePendingTwoFactor(userId, null);
    const users = readUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.twoFactorEnabled = true;
      target.updatedAt = nowIso();
      writeUsers(users);
    }
    return { twoFactorEnabled: true, backupCodes: pending.backupCodes };
  },

  async disable2fa(password: string): Promise<void> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const passwords = readPasswords();
    if (passwords[userId] !== password) {
      throw new MockApiError(401, 'INVALID_PASSWORD', 'Password is incorrect');
    }
    writeTwoFactor(userId, null);
    writePendingTwoFactor(userId, null);
    const users = readUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.twoFactorEnabled = false;
      target.updatedAt = nowIso();
      writeUsers(users);
    }
  },

  async listSessions(): Promise<{ sessions: AuthSession[] }> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    return { sessions: readSessions(userId) };
  },

  async revokeSession(sessionId: string): Promise<void> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const sessions = readSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) throw new MockApiError(404, 'SESSION_NOT_FOUND', 'Session not found');
    const next = sessions.filter((s) => s.id !== sessionId);
    writeSessions(userId, next);
    if (session.isCurrent) setCurrentSessionUserId(null);
  },

  async socialLogin(input: SocialLoginInput): Promise<AuthSessionResponse> {
    await delay();
    const email = `${input.provider}-demo@twinspire.dev`;
    let user = findUserByEmail(email);
    if (!user) {
      user = {
        id: randomId('usr'),
        email,
        firstName: input.provider[0]?.toUpperCase() + (input.provider.slice(1) ?? ''),
        lastName: 'Buyer',
        displayName: `${input.provider} buyer`,
        role: 'customer',
        status: 'active',
        emailVerifiedAt: nowIso(),
        phoneVerifiedAt: null,
        twoFactorEnabled: false,
        lastLoginAt: nowIso(),
        preferences: {
          locale: 'en-US',
          currency: 'USD',
          theme: 'system',
          marketingOptIn: false,
          newsletter: false,
        },
        loyaltyPoints: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      const users = readUsers();
      users.push(user);
      writeUsers(users);
      writeAddresses(user.id, []);
      writeOrders(user.id, []);
      writeWishlist(user.id, []);
    }
    setCurrentSessionUserId(user.id);
    const sessions = readSessions(user.id).map((s) => ({ ...s, isCurrent: false }));
    sessions.push(newSession(user.id, `Sign-in with ${input.provider}`));
    writeSessions(user.id, sessions);
    return tokenPayload(toPublicUser(user, readAddresses(user.id)));
  },

  // ---- users ----
  async updateProfile(input: UpdateProfileInput): Promise<{ user: PublicUser }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const users = readUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) throw new MockApiError(404, 'USER_NOT_FOUND', 'User not found');
    Object.assign(target, input);
    target.updatedAt = nowIso();
    if (!target.displayName) {
      target.displayName = `${target.firstName} ${target.lastName}`.trim();
    }
    writeUsers(users);
    return { user: toPublicUser(target, readAddresses(userId)) };
  },

  async updatePreferences(input: UpdatePreferencesInput): Promise<{ user: PublicUser }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const users = readUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) throw new MockApiError(404, 'USER_NOT_FOUND', 'User not found');
    target.preferences = { ...target.preferences, ...input };
    target.updatedAt = nowIso();
    writeUsers(users);
    return { user: toPublicUser(target, readAddresses(userId)) };
  },

  async deleteAccount(): Promise<void> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    setCurrentSessionUserId(null);
    writeSessions(userId, []);
    const users = readUsers().filter((u) => u.id !== userId);
    writeUsers(users);
  },

  async listAddresses(): Promise<AddressListResponse> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    return { addresses: readAddresses(userId) };
  },

  async createAddress(input: CreateAddressInput): Promise<{ address: Address }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const existing = readAddresses(userId);
    const address: Address = {
      id: randomId('addr'),
      userId,
      ...input,
      isDefault: input.isDefault ?? existing.length === 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };
    let next = existing;
    if (address.isDefault) {
      next = existing.map((a) => ({ ...a, isDefault: false }));
    }
    writeAddresses(userId, [...next, address]);
    return { address };
  },

  async updateAddress(id: string, input: UpdateAddressInput): Promise<{ address: Address }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const list = readAddresses(userId);
    const target = list.find((a) => a.id === id);
    if (!target) throw new MockApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found');
    const updated: Address = { ...target, ...input, updatedAt: nowIso() };
    let next = list.map((a) => (a.id === id ? updated : a));
    if (input.isDefault === true) {
      next = next.map((a) => ({ ...a, isDefault: a.id === id }));
    }
    writeAddresses(userId, next);
    return { address: updated };
  },

  async deleteAddress(id: string): Promise<void> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const list = readAddresses(userId);
    const target = list.find((a) => a.id === id);
    if (!target) throw new MockApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found');
    const remaining = list.filter((a) => a.id !== id);
    if (target.isDefault && remaining.length > 0) {
      const first = remaining[0];
      if (first) first.isDefault = true;
    }
    writeAddresses(userId, remaining);
  },

  async setDefaultAddress(id: string): Promise<{ address: Address }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const list = readAddresses(userId);
    const target = list.find((a) => a.id === id);
    if (!target) throw new MockApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found');
    const next = list.map((a) => ({ ...a, isDefault: a.id === id, updatedAt: nowIso() }));
    writeAddresses(userId, next);
    const updated = next.find((a) => a.id === id);
    if (!updated) throw new MockApiError(500, 'INTERNAL', 'Failed to update default address');
    return { address: updated };
  },

  // ---- orders ----
  async listOrders(options: { page?: number; perPage?: number; status?: OrderStatus } = {}): Promise<OrderListResponse> {
    await delay(80);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const all = readOrders(userId);
    const filtered = options.status ? all.filter((o) => o.status === options.status) : all;
    const page = Math.max(1, options.page ?? 1);
    const perPage = Math.max(1, Math.min(50, options.perPage ?? 10));
    const start = (page - 1) * perPage;
    const slice = filtered.slice(start, start + perPage);
    return {
      items: slice.map(orderListItem),
      total: filtered.length,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
    };
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    await delay(80);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const target = readOrders(userId).find((o) => o.id === id || o.orderNumber === id);
    if (!target) throw new MockApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    return { order: target };
  },

  async cancelOrder(id: string): Promise<{ order: Order }> {
    await delay();
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const orders = readOrders(userId);
    const target = orders.find((o) => o.id === id);
    if (!target) throw new MockApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(target.status)) {
      throw new MockApiError(409, 'ORDER_NOT_CANCELLABLE', 'This order can no longer be cancelled');
    }
    target.status = 'cancelled';
    target.cancelledAt = nowIso();
    target.updatedAt = nowIso();
    target.timeline.push({ status: 'cancelled', occurredAt: target.cancelledAt });
    writeOrders(userId, orders);
    return { order: target };
  },

  // ---- wishlist ----
  async getWishlist(): Promise<WishlistResponse> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const ids = readWishlist(userId);
    const items: WishlistItem[] = [];
    for (const id of ids) {
      const product = getProductById(id);
      if (product) {
        items.push({ id: `wi-${id}`, productId: id, product, addedAt: nowIso() });
      }
    }
    return { items, total: items.length };
  },

  async addWishlistItem(productId: string): Promise<{ productId: string }> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    const ids = readWishlist(userId);
    if (!ids.includes(productId)) ids.unshift(productId);
    writeWishlist(userId, ids);
    return { productId };
  },

  async removeWishlistItem(productId: string): Promise<void> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    writeWishlist(
      userId,
      readWishlist(userId).filter((id) => id !== productId),
    );
  },

  async clearWishlist(): Promise<void> {
    await delay(60);
    const userId = getCurrentSessionUserId();
    if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Not authenticated');
    writeWishlist(userId, []);
  },

  async recentlyViewed(): Promise<RecentlyViewedResponse> {
    await delay(40);
    const userId = getCurrentSessionUserId();
    if (!userId) return { items: [] };
    const items = readRecent(userId)
      .map((entry) => {
        const product: Product | undefined = getProductById(entry.productId);
        return product ? { ...entry, product } : null;
      })
      .filter(
        (entry): entry is { productId: string; viewedAt: string; product: Product } => entry !== null,
      );
    return { items };
  },

  async trackView(productId: string): Promise<void> {
    await delay(40);
    const userId = getCurrentSessionUserId();
    if (!userId) return;
    const list = readRecent(userId).filter((entry) => entry.productId !== productId);
    list.unshift({ productId, viewedAt: nowIso() });
    writeRecent(userId, list);
  },

  // ---- demo helpers ----
  async _resetDemoData(): Promise<void> {
    writeUsers([DEMO_USER]);
    const passwords = { [DEMO_USER_ID]: DEMO_PASSWORD };
    writePasswords(passwords);
    writeAddresses(DEMO_USER_ID, DEMO_ADDRESSES);
    writeOrders(DEMO_USER_ID, DEMO_ORDERS);
    writeWishlist(DEMO_USER_ID, DEMO_WISHLIST_PRODUCT_IDS);
    writeSessions(DEMO_USER_ID, []);
    writeTwoFactor(DEMO_USER_ID, null);
    setCurrentSessionUserId(null);
  },
};
