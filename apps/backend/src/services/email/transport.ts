import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../../config/env';
import { logger } from '../../config/logger';

const log = logger.child({ component: 'email' });

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailTransport {
  send(msg: EmailMessage): Promise<{ id: string; accepted?: string[]; rejected?: string[] }>;
}

let cached: EmailTransport | null = null;

function buildSmtpTransport(): Transporter {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    pool: true,
    maxConnections: 5,
  });
}

function buildConsoleTransport(): EmailTransport {
  return {
    async send(msg) {
      log.info(
        {
          to: msg.to,
          subject: msg.subject,
          textPreview: (msg.text ?? msg.html.replace(/<[^>]+>/g, '')).slice(0, 240),
        },
        '[console-email] message dispatched',
      );
      return { id: `console-${Date.now()}`, accepted: Array.isArray(msg.to) ? msg.to : [msg.to] };
    },
  };
}

function buildJsonFileTransport(): EmailTransport {
  const dir = path.join(tmpdir(), 'twinspire-emails');
  return {
    async send(msg) {
      await fs.mkdir(dir, { recursive: true });
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const file = path.join(dir, `${id}.json`);
      await fs.writeFile(file, JSON.stringify(msg, null, 2), 'utf8');
      log.info({ file, to: msg.to }, '[jsonfile-email] message written');
      return { id, accepted: Array.isArray(msg.to) ? msg.to : [msg.to] };
    },
  };
}

export function getEmailTransport(): EmailTransport {
  if (cached) return cached;

  if (env.EMAIL_DRIVER === 'smtp' && env.SMTP_HOST) {
    const smtp = buildSmtpTransport();
    cached = {
      async send(msg) {
        const info = await smtp.sendMail({
          from: msg.from ?? env.EMAIL_FROM,
          replyTo: msg.replyTo ?? env.EMAIL_REPLY_TO,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          headers: msg.headers,
        });
        return { id: info.messageId, accepted: info.accepted as string[], rejected: info.rejected as string[] };
      },
    };
    return cached;
  }

  if (env.EMAIL_DRIVER === 'jsonfile') {
    cached = buildJsonFileTransport();
    return cached;
  }

  cached = buildConsoleTransport();
  return cached;
}

/** Inject a custom transport (used by tests). */
export function setEmailTransport(transport: EmailTransport): void {
  cached = transport;
}
