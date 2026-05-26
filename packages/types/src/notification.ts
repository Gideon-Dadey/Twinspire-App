import type { BaseEntity, ID } from './common';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export type NotificationCategory =
  | 'order'
  | 'shipping'
  | 'payment'
  | 'security'
  | 'marketing'
  | 'system'
  | 'support';

export interface Notification extends BaseEntity {
  userId: ID;
  channel: NotificationChannel;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
}
