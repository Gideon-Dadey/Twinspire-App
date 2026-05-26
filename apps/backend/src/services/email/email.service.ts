import { env } from '../../config/env';
import { logger } from '../../config/logger';

import {
  passwordChangedTemplate,
  resetPasswordTemplate,
  twoFactorEnabledTemplate,
  verifyEmailTemplate,
  welcomeTemplate,
  type NameAndEmail,
  type PasswordChangedVars,
  type ResetPasswordVars,
  type TwoFactorEnabledVars,
  type VerifyEmailVars,
} from './templates';
import { getEmailTransport, type EmailMessage } from './transport';

const log = logger.child({ component: 'email-service' });

export class EmailService {
  private async dispatch(to: string, content: Pick<EmailMessage, 'subject' | 'html' | 'text'>): Promise<void> {
    try {
      const transport = getEmailTransport();
      const result = await transport.send({
        to,
        from: env.EMAIL_FROM,
        replyTo: env.EMAIL_REPLY_TO,
        ...content,
      });
      log.debug({ id: result.id, to }, 'email dispatched');
    } catch (err) {
      log.error({ err, to, subject: content.subject }, 'email dispatch failed');
    }
  }

  sendVerifyEmail(vars: VerifyEmailVars): Promise<void> {
    return this.dispatch(vars.email, verifyEmailTemplate(vars));
  }

  sendResetPassword(vars: ResetPasswordVars): Promise<void> {
    return this.dispatch(vars.email, resetPasswordTemplate(vars));
  }

  sendWelcome(vars: NameAndEmail): Promise<void> {
    return this.dispatch(vars.email, welcomeTemplate(vars));
  }

  sendPasswordChanged(vars: PasswordChangedVars): Promise<void> {
    return this.dispatch(vars.email, passwordChangedTemplate(vars));
  }

  sendTwoFactorEnabled(vars: TwoFactorEnabledVars): Promise<void> {
    return this.dispatch(vars.email, twoFactorEnabledTemplate(vars));
  }
}

export const emailService = new EmailService();
