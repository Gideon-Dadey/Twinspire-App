import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';
export type NotificationCategory =
  | 'order'
  | 'shipping'
  | 'payment'
  | 'security'
  | 'marketing'
  | 'system'
  | 'support';

export interface NotificationAttrs {
  userId: Types.ObjectId;
  channel: NotificationChannel;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date | null;
  sentAt?: Date | null;
  failedAt?: Date | null;
  failureReason?: string;
}

export interface NotificationDoc extends NotificationAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type NotificationModelType = Model<NotificationDoc> & PaginatedModel<NotificationDoc>;

const notificationSchema = new Schema<NotificationDoc, NotificationModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: String, enum: ['in_app', 'email', 'sms', 'push'], required: true, index: true },
    category: {
      type: String,
      enum: ['order', 'shipping', 'payment', 'security', 'marketing', 'system', 'support'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    data: { type: Schema.Types.Mixed, default: undefined },
    actionUrl: { type: String, trim: true, maxlength: 2048 },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, maxlength: 480 },
  },
  { timestamps: true, collection: 'notifications' },
);

applyBasePlugins(notificationSchema);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, channel: 1, createdAt: -1 });

export const Notification = model<NotificationDoc, NotificationModelType>(
  'Notification',
  notificationSchema,
);
export type NotificationDocument = HydratedDocument<NotificationDoc>;
