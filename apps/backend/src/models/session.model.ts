import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins } from '../db/plugins';

/**
 * Refresh-token session.
 *
 * - `tokenHash` stores a SHA-256 hash of the issued refresh token (raw token
 *   is never persisted).
 * - TTL index on `expiresAt` lets MongoDB reap expired sessions automatically.
 * - `replacedById` enables refresh-token rotation auditing.
 */
export interface SessionAttrs {
  userId: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  deviceLabel?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedById?: Types.ObjectId | null;
  lastUsedAt?: Date | null;
}

export interface SessionDoc extends SessionAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type SessionModelType = Model<SessionDoc>;

const sessionSchema = new Schema<SessionDoc, SessionModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    userAgent: { type: String, maxlength: 512 },
    ip: { type: String, maxlength: 64 },
    deviceLabel: { type: String, maxlength: 80 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date, default: null },
    replacedById: { type: Schema.Types.ObjectId, ref: 'Session', default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'sessions' },
);

applyBasePlugins(sessionSchema, { softDelete: false });

sessionSchema.index({ userId: 1, revokedAt: 1 });

export const Session = model<SessionDoc, SessionModelType>('Session', sessionSchema);
export type SessionDocument = HydratedDocument<SessionDoc>;
