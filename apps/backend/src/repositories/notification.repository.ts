import type { Types } from 'mongoose';

import { Notification, type NotificationDoc } from '../models/notification.model';

import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<NotificationDoc> {
  constructor() {
    super(Notification);
  }

  findUnreadForUser(userId: Types.ObjectId | string, limit = 50): Promise<NotificationDoc[]> {
    return this.find(
      { userId, isRead: false },
      { sort: { createdAt: -1 } as Record<string, 1 | -1> },
    ).then((rows) => rows.slice(0, limit));
  }

  async markRead(userId: Types.ObjectId | string, ids?: (Types.ObjectId | string)[]): Promise<number> {
    const filter: Record<string, unknown> = { userId, isRead: false };
    if (ids?.length) filter._id = { $in: ids };
    const res = await this.updateMany(filter, {
      $set: { isRead: true, readAt: new Date() },
    });
    return res.modified;
  }
}

export const notificationRepository = new NotificationRepository();
