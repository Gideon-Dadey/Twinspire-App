import type { BaseEntity, ID } from './common';

export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'order' | 'product' | 'payment' | 'shipping' | 'return' | 'account' | 'other';

export interface TicketMessage extends BaseEntity {
  ticketId: ID;
  authorId: ID;
  authorRole: 'customer' | 'agent' | 'system';
  body: string;
  attachments?: { url: string; name: string; size: number; mimeType: string }[];
  isInternal: boolean;
}

export interface Ticket extends BaseEntity {
  ticketNumber: string;
  userId?: ID | null;
  guestEmail?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: ID | null;
  orderId?: ID;
  productId?: ID;
  tags?: string[];
  lastMessageAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}
