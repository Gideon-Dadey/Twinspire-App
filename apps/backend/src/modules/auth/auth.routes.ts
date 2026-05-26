import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimiter, sensitiveRateLimiter } from '../../middleware/rate-limit';
import { validate } from '../../middleware/validate';

import { authController } from './auth.controller';
import {
  changePasswordBodySchema,
  disable2faBodySchema,
  enable2faBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  requestPasswordResetBodySchema,
  resendVerifyBodySchema,
  resetPasswordBodySchema,
  sessionRevokeParamsSchema,
  socialLoginBodySchema,
  verifyEmailBodySchema,
} from './auth.schemas';

const router: Router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerBodySchema }),
  asyncHandler(authController.register),
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginBodySchema }),
  asyncHandler(authController.login),
);

router.post(
  '/refresh',
  validate({ body: refreshBodySchema }),
  asyncHandler(authController.refresh),
);

router.post(
  '/logout',
  authenticate,
  validate({ body: logoutBodySchema }),
  asyncHandler(authController.logout),
);

router.get('/me', authenticate, asyncHandler(authController.me));

router.post(
  '/verify-email',
  validate({ body: verifyEmailBodySchema }),
  asyncHandler(authController.verifyEmail),
);

router.post(
  '/resend-verify',
  sensitiveRateLimiter,
  validate({ body: resendVerifyBodySchema }),
  asyncHandler(authController.resendVerifyEmail),
);

router.post(
  '/password/reset/request',
  sensitiveRateLimiter,
  validate({ body: requestPasswordResetBodySchema }),
  asyncHandler(authController.requestPasswordReset),
);

router.post(
  '/password/reset',
  authRateLimiter,
  validate({ body: resetPasswordBodySchema }),
  asyncHandler(authController.resetPassword),
);

router.post(
  '/password/change',
  authenticate,
  validate({ body: changePasswordBodySchema }),
  asyncHandler(authController.changePassword),
);

router.post('/2fa/setup', authenticate, asyncHandler(authController.begin2faSetup));

router.post(
  '/2fa/confirm',
  authenticate,
  validate({ body: enable2faBodySchema }),
  asyncHandler(authController.confirm2faSetup),
);

router.post(
  '/2fa/disable',
  authenticate,
  validate({ body: disable2faBodySchema }),
  asyncHandler(authController.disable2fa),
);

router.get('/sessions', authenticate, asyncHandler(authController.listSessions));

router.delete(
  '/sessions/:sessionId',
  authenticate,
  validate({ params: sessionRevokeParamsSchema }),
  asyncHandler(authController.revokeSession),
);

router.post(
  '/social',
  authRateLimiter,
  validate({ body: socialLoginBodySchema }),
  asyncHandler(authController.socialLogin),
);

export default router;
