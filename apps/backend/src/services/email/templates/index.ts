import { escapeHtml, renderButton, renderLayout } from './layout';

import type { EmailMessage } from '../transport';

export interface NameAndEmail {
  email: string;
  firstName: string;
}

export interface VerifyEmailVars extends NameAndEmail {
  verifyUrl: string;
}

export function verifyEmailTemplate(
  vars: VerifyEmailVars,
): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
  const subject = 'Verify your TwinSpire email';
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Welcome, ${escapeHtml(vars.firstName)}!</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Confirm your email so we know it's really you. This link expires in 24 hours.</p>
    <p style="margin:0 0 24px;">${renderButton('Verify email', vars.verifyUrl)}</p>
    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">Or paste this URL into your browser:<br/><span style="word-break:break-all;color:#e91b25;">${escapeHtml(vars.verifyUrl)}</span></p>
  `;
  const html = renderLayout({
    title: subject,
    preheader: 'Confirm your TwinSpire email address',
    body,
  });
  return {
    subject,
    html,
    text: `Hi ${vars.firstName},\n\nVerify your TwinSpire email: ${vars.verifyUrl}\n\nThe link expires in 24 hours.`,
  };
}

export interface ResetPasswordVars extends NameAndEmail {
  resetUrl: string;
  ttlMinutes: number;
}

export function resetPasswordTemplate(
  vars: ResetPasswordVars,
): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
  const subject = 'Reset your TwinSpire password';
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${escapeHtml(vars.firstName)} — we received a request to reset your TwinSpire password. This link is valid for ${vars.ttlMinutes} minutes.</p>
    <p style="margin:0 0 24px;">${renderButton('Reset password', vars.resetUrl)}</p>
    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore the email.</p>
  `;
  const html = renderLayout({
    title: subject,
    preheader: 'Reset your TwinSpire password',
    body,
  });
  return {
    subject,
    html,
    text: `Hi ${vars.firstName},\n\nReset your TwinSpire password: ${vars.resetUrl}\nValid for ${vars.ttlMinutes} minutes.\n\nIf you didn't request this, ignore this email.`,
  };
}

export function welcomeTemplate(
  vars: NameAndEmail,
): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
  const subject = 'Welcome to TwinSpire';
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Welcome, ${escapeHtml(vars.firstName)}!</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Your account is ready. Save items to your wishlist, track orders in real time, and unlock loyalty perks as you shop.</p>
    <p style="margin:0 0 24px;">${renderButton('Start exploring', 'https://twinspire.dev')}</p>
  `;
  const html = renderLayout({
    title: subject,
    preheader: "You're in. Start exploring TwinSpire.",
    body,
  });
  return {
    subject,
    html,
    text: `Welcome to TwinSpire, ${vars.firstName}! Visit https://twinspire.dev to get started.`,
  };
}

export interface PasswordChangedVars extends NameAndEmail {
  occurredAt: Date;
  ip?: string;
}

export function passwordChangedTemplate(
  vars: PasswordChangedVars,
): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
  const subject = 'Your TwinSpire password was changed';
  const when = vars.occurredAt.toUTCString();
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Password updated</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${escapeHtml(vars.firstName)} — your password was changed on ${escapeHtml(when)}${vars.ip ? ` from IP ${escapeHtml(vars.ip)}` : ''}.</p>
    <p style="margin:0 0 16px;line-height:1.6;">If this wasn't you, reset your password immediately and contact support.</p>
  `;
  const html = renderLayout({ title: subject, preheader: 'Password change notification', body });
  return {
    subject,
    html,
    text: `Hi ${vars.firstName},\n\nYour TwinSpire password was changed on ${when}${vars.ip ? ` from IP ${vars.ip}` : ''}.\nIf this wasn't you, reset your password immediately.`,
  };
}

export interface TwoFactorEnabledVars extends NameAndEmail {
  occurredAt: Date;
}

export function twoFactorEnabledTemplate(
  vars: TwoFactorEnabledVars,
): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
  const subject = 'Two-factor authentication enabled';
  const when = vars.occurredAt.toUTCString();
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;">Two-factor authentication is on</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${escapeHtml(vars.firstName)} — 2FA was enabled on your TwinSpire account on ${escapeHtml(when)}.</p>
    <p style="margin:0 0 16px;line-height:1.6;">Store your backup codes somewhere safe — you'll need them if you lose access to your authenticator app.</p>
  `;
  const html = renderLayout({ title: subject, preheader: '2FA enabled', body });
  return {
    subject,
    html,
    text: `Hi ${vars.firstName},\n\n2FA was enabled on your TwinSpire account on ${when}.`,
  };
}
