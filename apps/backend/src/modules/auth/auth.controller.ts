
import { clearRefreshCookie, getRefreshCookie, setRefreshCookie } from '../../auth/cookies';
import { checkPasswordStrength } from '../../auth/password';
import { env } from '../../config/env';
import { User } from '../../models/user.model';
import { HttpError } from '../../utils/http-error';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response';
import { cartService } from '../cart';

import { authService, issueTokensForUser, sanitizeUser } from './auth.service';
import { linkOrCreateSocialUser, verifySocialToken } from './social.service';

import type { Request, Response } from 'express';

async function mergeGuestCartIfAny(req: Request, userId: string): Promise<void> {
  try {
    const cookieName = env.GUEST_CART_COOKIE;
    const sessionId = (req.signedCookies?.[cookieName] ?? req.cookies?.[cookieName]) as string | undefined;
    if (sessionId) await cartService.mergeGuestIntoUser(sessionId, userId);
  } catch {
    // Cart merge failures must never block login.
  }
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const body = req.body as Parameters<typeof authService.register>[0];

    const strength = checkPasswordStrength(body.password, {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    });
    if (!strength.ok) {
      throw HttpError.unprocessable('Password is not strong enough', {
        code: 'WEAK_PASSWORD',
        details: { reason: strength.reason },
      });
    }

    const result = await authService.register(body);
    sendCreated(res, result, { message: 'Account created. Check your inbox to verify your email.' });
  },

  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as Parameters<typeof authService.login>[0];
    const result = await authService.login(body, req);
    setRefreshCookie(res, result.refreshToken);
    await mergeGuestCartIfAny(req, result.user.id);

    sendSuccess(res, {
      accessToken: result.accessToken,
      accessExpiresAt: result.accessExpiresAt,
      refreshExpiresAt: result.refreshExpiresAt,
      user: result.user,
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const cookieToken = getRefreshCookie(req);
    const bodyToken = (req.body as { refreshToken?: string }).refreshToken;
    const token = cookieToken ?? bodyToken;
    if (!token) throw HttpError.unauthorized('Missing refresh token', { code: 'MISSING_REFRESH' });

    const result = await authService.refresh(token, req);
    setRefreshCookie(res, result.refreshToken);

    sendSuccess(res, {
      accessToken: result.accessToken,
      accessExpiresAt: result.accessExpiresAt,
      refreshExpiresAt: result.refreshExpiresAt,
      user: result.user,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const everywhere = Boolean((req.body as { everywhere?: boolean }).everywhere);
    await authService.logout({
      sessionId: req.auth?.sessionId,
      userId: req.auth?.userId,
      everywhere,
    });
    clearRefreshCookie(res);
    sendNoContent(res);
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const user = await User.findById(req.auth.userId);
    if (!user) throw HttpError.notFound('User not found');
    sendSuccess(res, { user: sanitizeUser(user) });
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body as { token: string };
    const result = await authService.verifyEmail(token);
    sendSuccess(res, result);
  },

  async resendVerifyEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };
    await authService.resendVerifyEmail(email);
    sendNoContent(res);
  },

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };
    await authService.requestPasswordReset(email);
    sendNoContent(res);
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body as { token: string; password: string };
    const strength = checkPasswordStrength(password);
    if (!strength.ok) {
      throw HttpError.unprocessable('Password is not strong enough', {
        code: 'WEAK_PASSWORD',
        details: { reason: strength.reason },
      });
    }
    await authService.resetPassword(token, password, req);
    sendNoContent(res);
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const strength = checkPasswordStrength(newPassword);
    if (!strength.ok) {
      throw HttpError.unprocessable('Password is not strong enough', {
        code: 'WEAK_PASSWORD',
        details: { reason: strength.reason },
      });
    }
    await authService.changePassword(req.auth.userId, currentPassword, newPassword, req);
    clearRefreshCookie(res);
    sendNoContent(res);
  },

  async begin2faSetup(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const result = await authService.beginTwoFactorSetup(req.auth.userId);
    sendSuccess(res, result);
  },

  async confirm2faSetup(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { totpCode } = req.body as { totpCode: string };
    const result = await authService.confirmTwoFactorSetup(req.auth.userId, totpCode, req);
    sendSuccess(res, result);
  },

  async disable2fa(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { password } = req.body as { password: string };
    await authService.disableTwoFactor(req.auth.userId, password, req);
    sendNoContent(res);
  },

  async listSessions(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const sessions = await authService.listSessions(req.auth.userId);
    sendSuccess(res, { sessions });
  },

  async revokeSession(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { sessionId } = req.params as { sessionId: string };
    await authService.revokeSession(req.auth.userId, sessionId);
    sendNoContent(res);
  },

  async socialLogin(req: Request, res: Response): Promise<void> {
    const body = req.body as { provider: 'google' | 'facebook' | 'apple'; idToken?: string; accessToken?: string };
    const profile = await verifySocialToken(body);
    const user = await linkOrCreateSocialUser(profile);

    if (user.status === 'banned' || user.status === 'suspended') {
      throw HttpError.forbidden('Account is unavailable');
    }

    const tokens = await issueTokensForUser(user, { req });
    setRefreshCookie(res, tokens.refreshToken);

    await user.recordSuccessfulLogin(req.ip);
    await mergeGuestCartIfAny(req, String(user._id));

    sendSuccess(res, {
      accessToken: tokens.accessToken,
      accessExpiresAt: tokens.accessExpiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
      user: sanitizeUser(user),
    });
  },
};
