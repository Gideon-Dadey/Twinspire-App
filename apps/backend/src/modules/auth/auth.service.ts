import { Types } from 'mongoose';

import {
  generateOneTimeToken,
  hashPassword,
  sha256Hex,
  signAccessToken,
  signRefreshToken,
  tokenExpiry,
  verifyPassword,
  verifyRefreshToken,
  type IssuedTokens,
} from '../../auth';
import {
  consumeBackupCode,
  generateBackupCodes,
  generateTotpQrDataUrl,
  generateTotpSecret,
  verifyTotpToken,
} from '../../auth/totp';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Session } from '../../models/session.model';
import { User, type UserDocument } from '../../models/user.model';
import { auditService } from '../../services/audit.service';
import { cacheService } from '../../services/cache';
import { emailService } from '../../services/email';
import { invalidatePermissionsCache } from '../../services/rbac.service';
import { HttpError } from '../../utils/http-error';

import type { Request } from 'express';

const log = logger.child({ component: 'auth-service' });

interface ClientContext {
  ip?: string;
  userAgent?: string;
  deviceLabel?: string;
}

function contextFromRequest(req: Request, deviceLabel?: string): ClientContext {
  return {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    deviceLabel,
  };
}

const VERIFY_TOKEN_PREFIX = 'auth:verify:';
const RESET_TOKEN_PREFIX = 'auth:reset:';

export class AuthService {
  /* =========================================================================
     REGISTRATION
     ========================================================================= */

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    marketingOptIn?: boolean;
    newsletter?: boolean;
  }): Promise<{ userId: string; email: string }> {
    const existing = await User.findOne({ email: input.email }).lean();
    if (existing) {
      throw HttpError.conflict('Email already registered', { code: 'EMAIL_TAKEN' });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'customer',
      status: 'pending',
      preferences: {
        locale: 'en-US',
        currency: 'USD',
        theme: 'system',
        marketingOptIn: input.marketingOptIn ?? false,
        newsletter: input.newsletter ?? false,
      },
    });

    await this.sendVerifyEmail(user);

    void auditService.write({
      action: 'create',
      targetType: 'User',
      targetId: user._id,
      actorId: user._id,
      actorRole: 'customer',
      metadata: { reason: 'self-register' },
    });

    return { userId: user._id.toString(), email: user.email };
  }

  /* =========================================================================
     EMAIL VERIFICATION
     ========================================================================= */

  async sendVerifyEmail(user: UserDocument): Promise<void> {
    if (user.emailVerifiedAt) return;
    const { plain, hash } = generateOneTimeToken();
    const ttlSec = env.EMAIL_VERIFY_TTL_HOURS * 3600;
    await cacheService.set(VERIFY_TOKEN_PREFIX + hash, user._id.toString(), { ttlSeconds: ttlSec });

    const verifyUrl = `${env.APP_URL}/verify-email?token=${plain}`;
    await emailService.sendVerifyEmail({
      email: user.email,
      firstName: user.firstName,
      verifyUrl,
    });
  }

  async verifyEmail(token: string): Promise<{ userId: string }> {
    const hash = sha256Hex(token);
    const userId = await cacheService.get<string>(VERIFY_TOKEN_PREFIX + hash);
    if (!userId) {
      throw HttpError.badRequest('Verification link is invalid or expired', {
        code: 'INVALID_VERIFY_TOKEN',
      });
    }

    const user = await User.findById(userId);
    if (!user) throw HttpError.notFound('User not found');

    user.emailVerifiedAt = new Date();
    if (user.status === 'pending') user.status = 'active';
    await user.save();
    await cacheService.del(VERIFY_TOKEN_PREFIX + hash);

    await emailService.sendWelcome({ email: user.email, firstName: user.firstName });

    return { userId: user._id.toString() };
  }

  async resendVerifyEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user || user.emailVerifiedAt) return;
    await this.sendVerifyEmail(user);
  }

  /* =========================================================================
     LOGIN
     ========================================================================= */

  async login(
    input: {
      email: string;
      password: string;
      totpCode?: string;
      backupCode?: string;
      deviceLabel?: string;
    },
    req: Request,
  ): Promise<IssuedTokens & { user: SanitizedUser; twoFactorRequired: false }> {
    const user = await User.findOne({ email: input.email })
      .select('+passwordHash +twoFactorSecret +twoFactorBackupCodes')
      .exec();

    if (!user) {
      throw HttpError.unauthorized('Invalid credentials', { code: 'INVALID_CREDENTIALS' });
    }

    if (user.isLocked()) {
      throw HttpError.tooMany('Account temporarily locked. Try again later.', {
        code: 'ACCOUNT_LOCKED',
      });
    }

    if (user.status === 'banned') {
      throw HttpError.forbidden('Account is banned', { code: 'ACCOUNT_BANNED' });
    }
    if (user.status === 'suspended') {
      throw HttpError.forbidden('Account is suspended', { code: 'ACCOUNT_SUSPENDED' });
    }

    const passwordOk = await verifyPassword(input.password, user.passwordHash ?? '');
    if (!passwordOk) {
      await user.recordFailedLogin();
      void auditService.write({
        action: 'login_failed',
        targetType: 'User',
        targetId: user._id,
        actorIp: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw HttpError.unauthorized('Invalid credentials', { code: 'INVALID_CREDENTIALS' });
    }

    if (user.twoFactorEnabled) {
      const totpProvided = input.totpCode ?? input.backupCode;
      if (!totpProvided) {
        throw HttpError.unauthorized('Two-factor authentication required', {
          code: 'TOTP_REQUIRED',
        });
      }

      const totpOk = await this.verifyTwoFactor(user, input.totpCode, input.backupCode);
      if (!totpOk) {
        await user.recordFailedLogin();
        throw HttpError.unauthorized('Invalid two-factor code', { code: 'INVALID_TOTP' });
      }
    }

    const tokens = await this.issueSession(user, contextFromRequest(req, input.deviceLabel));
    await user.recordSuccessfulLogin(req.ip);

    void auditService.write({
      action: 'login',
      targetType: 'User',
      targetId: user._id,
      actorId: user._id,
      actorRole: user.role,
      actorIp: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      ...tokens,
      user: sanitizeUser(user),
      twoFactorRequired: false,
    };
  }

  /* =========================================================================
     REFRESH (with rotation + reuse detection)
     ========================================================================= */

  async refresh(rawRefreshToken: string, req: Request): Promise<IssuedTokens & { user: SanitizedUser }> {
    let claims;
    try {
      claims = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw HttpError.unauthorized('Invalid refresh token', { code: 'INVALID_REFRESH' });
    }

    const tokenHash = sha256Hex(rawRefreshToken);
    const session = await Session.findOne({ _id: claims.sid }).select('+tokenHash').exec();

    if (!session) {
      throw HttpError.unauthorized('Session not found', { code: 'SESSION_NOT_FOUND' });
    }

    const tokenMismatch = session.tokenHash !== tokenHash;
    const sessionRevoked = session.revokedAt !== null;

    if (tokenMismatch || sessionRevoked) {
      // Either the token doesn't match the stored hash (forged/tampered) or
      // the session was already rotated/revoked and somebody is replaying its
      // original refresh token. Both indicate refresh-token reuse — burn every
      // live session for this user as a precaution.
      log.warn(
        { userId: claims.sub, sessionId: claims.sid, tokenMismatch, sessionRevoked },
        'refresh token reuse detected',
      );
      await Session.updateMany(
        { userId: claims.sub, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      void auditService.write({
        action: 'access_denied',
        targetType: 'Session',
        targetId: session._id,
        actorId: claims.sub,
        actorIp: req.ip,
        reason: 'refresh token reuse',
      });
      throw HttpError.unauthorized('Refresh token reuse detected', { code: 'REFRESH_REUSE' });
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw HttpError.unauthorized('Session expired', { code: 'SESSION_EXPIRED' });
    }

    const user = await User.findById(claims.sub).exec();
    if (!user || user.status === 'banned' || user.status === 'suspended') {
      throw HttpError.unauthorized('User unavailable', { code: 'USER_UNAVAILABLE' });
    }

    const next = await this.issueSession(user, contextFromRequest(req));

    session.revokedAt = new Date();
    session.replacedById = new Types.ObjectId(next.sessionId);
    session.lastUsedAt = new Date();
    await session.save();

    return { ...next, user: sanitizeUser(user) };
  }

  /* =========================================================================
     LOGOUT
     ========================================================================= */

  async logout(input: { sessionId?: string; userId?: string; everywhere?: boolean }): Promise<void> {
    if (input.everywhere && input.userId) {
      await Session.updateMany(
        { userId: input.userId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      return;
    }
    if (input.sessionId) {
      await Session.updateOne({ _id: input.sessionId }, { $set: { revokedAt: new Date() } });
    }
  }

  /* =========================================================================
     PASSWORD CHANGE / RESET
     ========================================================================= */

  async changePassword(userId: string, current: string, next: string, req: Request): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash').exec();
    if (!user) throw HttpError.notFound('User not found');

    const ok = await verifyPassword(current, user.passwordHash ?? '');
    if (!ok) {
      throw HttpError.unauthorized('Current password is incorrect', {
        code: 'INVALID_CURRENT_PASSWORD',
      });
    }

    user.passwordHash = await hashPassword(next);
    await user.save();
    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    await emailService.sendPasswordChanged({
      email: user.email,
      firstName: user.firstName,
      occurredAt: new Date(),
      ip: req.ip,
    });

    void auditService.write({
      action: 'password_changed',
      targetType: 'User',
      targetId: user._id,
      actorId: user._id,
      actorRole: user.role,
      actorIp: req.ip,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email }).exec();
    if (!user) return;

    const { plain, hash } = generateOneTimeToken();
    const ttlSec = env.PASSWORD_RESET_TTL_MIN * 60;
    await cacheService.set(RESET_TOKEN_PREFIX + hash, user._id.toString(), { ttlSeconds: ttlSec });

    const resetUrl = `${env.APP_URL}/reset-password?token=${plain}`;
    await emailService.sendResetPassword({
      email: user.email,
      firstName: user.firstName,
      resetUrl,
      ttlMinutes: env.PASSWORD_RESET_TTL_MIN,
    });
  }

  async resetPassword(token: string, newPassword: string, req: Request): Promise<void> {
    const hash = sha256Hex(token);
    const userId = await cacheService.get<string>(RESET_TOKEN_PREFIX + hash);
    if (!userId) {
      throw HttpError.badRequest('Reset link is invalid or expired', {
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const user = await User.findById(userId).exec();
    if (!user) throw HttpError.notFound('User not found');

    user.passwordHash = await hashPassword(newPassword);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
    await cacheService.del(RESET_TOKEN_PREFIX + hash);

    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    await emailService.sendPasswordChanged({
      email: user.email,
      firstName: user.firstName,
      occurredAt: new Date(),
      ip: req.ip,
    });

    void auditService.write({
      action: 'password_changed',
      targetType: 'User',
      targetId: user._id,
      actorIp: req.ip,
      reason: 'password reset',
    });
  }

  /* =========================================================================
     TWO-FACTOR AUTHENTICATION
     ========================================================================= */

  async beginTwoFactorSetup(userId: string): Promise<{ secret: string; uri: string; qrDataUrl: string }> {
    const user = await User.findById(userId).exec();
    if (!user) throw HttpError.notFound('User not found');
    if (user.twoFactorEnabled) {
      throw HttpError.conflict('Two-factor authentication already enabled', {
        code: '2FA_ALREADY_ENABLED',
      });
    }

    const setup = generateTotpSecret(user.email);
    user.twoFactorSecret = setup.secret;
    await user.save();

    const qrDataUrl = await generateTotpQrDataUrl(setup.uri);
    return { secret: setup.secret, uri: setup.uri, qrDataUrl };
  }

  async confirmTwoFactorSetup(
    userId: string,
    totpCode: string,
    req: Request,
  ): Promise<{ backupCodes: string[] }> {
    const user = await User.findById(userId).select('+twoFactorSecret').exec();
    if (!user) throw HttpError.notFound('User not found');
    if (!user.twoFactorSecret) {
      throw HttpError.badRequest('2FA setup has not been started', { code: '2FA_NOT_STARTED' });
    }
    if (!verifyTotpToken(totpCode, user.twoFactorSecret)) {
      throw HttpError.unauthorized('Invalid 2FA code', { code: 'INVALID_TOTP' });
    }

    const { plain, hashes } = generateBackupCodes(10);
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashes;
    await user.save();

    await emailService.sendTwoFactorEnabled({
      email: user.email,
      firstName: user.firstName,
      occurredAt: new Date(),
    });

    void auditService.write({
      action: 'update',
      targetType: 'User',
      targetId: user._id,
      actorId: user._id,
      actorRole: user.role,
      actorIp: req.ip,
      reason: '2fa enabled',
    });

    return { backupCodes: plain };
  }

  async disableTwoFactor(userId: string, password: string, req: Request): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash +twoFactorSecret').exec();
    if (!user) throw HttpError.notFound('User not found');
    if (!user.twoFactorEnabled) {
      throw HttpError.badRequest('Two-factor authentication is not enabled', {
        code: '2FA_NOT_ENABLED',
      });
    }

    const ok = await verifyPassword(password, user.passwordHash ?? '');
    if (!ok) {
      throw HttpError.unauthorized('Invalid password', { code: 'INVALID_CREDENTIALS' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    void auditService.write({
      action: 'update',
      targetType: 'User',
      targetId: user._id,
      actorId: user._id,
      actorRole: user.role,
      actorIp: req.ip,
      reason: '2fa disabled',
    });
  }

  /* =========================================================================
     SESSIONS
     ========================================================================= */

  async listSessions(userId: string): Promise<
    {
      id: string;
      deviceLabel?: string;
      userAgent?: string;
      ip?: string;
      createdAt: Date;
      lastUsedAt: Date | null;
      expiresAt: Date;
    }[]
  > {
    const sessions = await Session.find({ userId, revokedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return sessions.map((s) => ({
      id: String(s._id),
      deviceLabel: s.deviceLabel,
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt ?? null,
      expiresAt: s.expiresAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await Session.updateOne(
      { _id: sessionId, userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  /* =========================================================================
     INTERNAL HELPERS
     ========================================================================= */

  async issueSession(user: UserDocument, ctx: ClientContext): Promise<IssuedTokens> {
    const sessionId = new Types.ObjectId();
    const refreshExpiresAt = tokenExpiry(env.JWT_REFRESH_TTL);
    const accessExpiresAt = tokenExpiry(env.JWT_ACCESS_TTL);

    const { token: refreshToken } = signRefreshToken({
      sub: user._id.toString(),
      sid: sessionId.toString(),
    });

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      sid: sessionId.toString(),
    });

    await Session.create({
      _id: sessionId,
      userId: user._id,
      tokenHash: sha256Hex(refreshToken),
      userAgent: ctx.userAgent,
      ip: ctx.ip,
      deviceLabel: ctx.deviceLabel,
      expiresAt: refreshExpiresAt,
      lastUsedAt: new Date(),
    });

    await invalidatePermissionsCache(user.role);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      sessionId: sessionId.toString(),
    };
  }

  private async verifyTwoFactor(
    user: UserDocument,
    totpCode?: string,
    backupCode?: string,
  ): Promise<boolean> {
    if (totpCode) {
      if (!user.twoFactorSecret) return false;
      return verifyTotpToken(totpCode, user.twoFactorSecret);
    }
    if (backupCode) {
      const stored = user.twoFactorBackupCodes ?? [];
      const remaining = consumeBackupCode(backupCode, stored);
      if (!remaining) return false;
      user.twoFactorBackupCodes = remaining;
      await user.save();
      return true;
    }
    return false;
  }
}

export const authService = new AuthService();

/* ---------- sanitiser ---------- */

export interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserDocument['role'];
  status: UserDocument['status'];
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  preferences: UserDocument['preferences'];
  createdAt: Date;
}

export function sanitizeUser(user: UserDocument): SanitizedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    twoFactorEnabled: user.twoFactorEnabled,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
}

/** Public dependencies — useful so a generate-tokens flow can be triggered externally (social login). */
export async function issueTokensForUser(
  user: UserDocument,
  ctx: { req: Request; deviceLabel?: string },
): Promise<IssuedTokens> {
  return authService.issueSession(user, contextFromRequest(ctx.req, ctx.deviceLabel));
}
