import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_changed'
  | 'role_changed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'refund'
  | 'export'
  | 'access_denied';

export interface AuditLogAttrs {
  actorId?: Types.ObjectId | null;
  actorRole?: string;
  actorIp?: string;
  action: AuditAction;
  targetType: string;
  targetId?: Types.ObjectId | null;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: string[];
  metadata?: Record<string, unknown>;
  reason?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AuditLogDoc extends AuditLogAttrs {
  createdAt: Date;
  updatedAt: Date;
}

type AuditLogModelType = Model<AuditLogDoc> & PaginatedModel<AuditLogDoc>;

const auditLogSchema = new Schema<AuditLogDoc, AuditLogModelType>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    actorRole: { type: String, trim: true, maxlength: 32, index: true },
    actorIp: { type: String, trim: true, maxlength: 64 },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, trim: true, maxlength: 64, index: true },
    targetId: { type: Schema.Types.ObjectId, default: null, index: true },
    before: { type: Schema.Types.Mixed, default: undefined },
    after: { type: Schema.Types.Mixed, default: undefined },
    changes: { type: [String], default: undefined },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    reason: { type: String, maxlength: 480 },
    userAgent: { type: String, maxlength: 480 },
    requestId: { type: String, maxlength: 128, index: true },
  },
  { timestamps: true, collection: 'auditLogs' },
);

applyBasePlugins(auditLogSchema, { softDelete: false });

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<AuditLogDoc, AuditLogModelType>('AuditLog', auditLogSchema);
export type AuditLogDocument = HydratedDocument<AuditLogDoc>;
