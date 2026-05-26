import { logger } from '../config/logger';
import { AuditLog, type AuditAction, type AuditLogAttrs } from '../models/audit-log.model';

import type { Request } from 'express';
import type { Types } from 'mongoose';


const log = logger.child({ component: 'audit' });

export interface AuditWriteOptions {
  action: AuditAction;
  targetType: string;
  targetId?: Types.ObjectId | string | null;
  actorId?: Types.ObjectId | string | null;
  actorRole?: string;
  actorIp?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: string[];
  metadata?: Record<string, unknown>;
  reason?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuditService {
  /** Fire-and-forget audit write — never blocks the calling flow. */
  async write(opts: AuditWriteOptions): Promise<void> {
    try {
      const doc: AuditLogAttrs = {
        action: opts.action,
        targetType: opts.targetType,
        targetId: (opts.targetId as Types.ObjectId | undefined) ?? null,
        actorId: (opts.actorId as Types.ObjectId | undefined) ?? null,
        actorRole: opts.actorRole,
        actorIp: opts.actorIp,
        before: opts.before,
        after: opts.after,
        changes: opts.changes,
        metadata: opts.metadata,
        reason: opts.reason,
        userAgent: opts.userAgent,
        requestId: opts.requestId,
      };
      await AuditLog.create(doc);
    } catch (err) {
      log.warn({ err, action: opts.action }, 'audit write failed');
    }
  }

  /** Convenience writer that picks up auth + tracing details from the request. */
  fromRequest(
    req: Request,
    fields: Pick<
      AuditWriteOptions,
      'action' | 'targetType' | 'targetId' | 'before' | 'after' | 'changes' | 'metadata' | 'reason'
    >,
  ): Promise<void> {
    return this.write({
      ...fields,
      actorId: req.auth?.userId,
      actorRole: req.auth?.role,
      actorIp: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: typeof req.id === 'string' ? req.id : undefined,
    });
  }
}

export const auditService = new AuditService();
