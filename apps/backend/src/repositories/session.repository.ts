import { createHash } from 'node:crypto';

import { Session, type SessionDoc, type SessionDocument } from '../models/session.model';

import { BaseRepository } from './base.repository';

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export class SessionRepository extends BaseRepository<SessionDoc> {
  constructor() {
    super(Session);
  }

  findByRawToken(rawToken: string): Promise<SessionDocument | null> {
    return Session.findOne({ tokenHash: hashToken(rawToken) }).select('+tokenHash').exec();
  }

  async revokeByRawToken(rawToken: string, replacedBySessionId?: string): Promise<boolean> {
    const res = await Session.updateOne(
      { tokenHash: hashToken(rawToken) },
      { $set: { revokedAt: new Date(), replacedById: replacedBySessionId ?? null } },
    ).exec();
    return res.modifiedCount > 0;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const res = await Session.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    ).exec();
    return res.modifiedCount;
  }
}

export const sessionRepository = new SessionRepository();
