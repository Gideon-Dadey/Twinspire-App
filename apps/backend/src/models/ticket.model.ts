import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { generateTicketNumber } from '@twinspire/utils';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory =
  | 'order'
  | 'product'
  | 'payment'
  | 'shipping'
  | 'return'
  | 'account'
  | 'other';

export interface TicketAttrs {
  ticketNumber: string;
  userId?: Types.ObjectId | null;
  guestEmail?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: Types.ObjectId | null;
  orderId?: Types.ObjectId;
  productId?: Types.ObjectId;
  tags: string[];
  messageCount: number;
  lastMessageAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
}

export interface TicketDoc extends TicketAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type TicketModelType = Model<TicketDoc> & PaginatedModel<TicketDoc>;

const ticketSchema = new Schema<TicketDoc, TicketModelType>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: generateTicketNumber,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestEmail: { type: String, trim: true, lowercase: true, maxlength: 240, index: true, sparse: true },
    subject: { type: String, required: true, trim: true, maxlength: 240 },
    category: {
      type: String,
      enum: ['order', 'product', 'payment', 'shipping', 'return', 'account', 'other'],
      default: 'other',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 32 }], default: [] },
    messageCount: { type: Number, default: 0, min: 0 },
    lastMessageAt: { type: Date, default: null, index: true },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'tickets' },
);

applyBasePlugins(ticketSchema);

ticketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });
ticketSchema.index({ assignedAgentId: 1, status: 1 });

export const Ticket = model<TicketDoc, TicketModelType>('Ticket', ticketSchema);
export type TicketDocument = HydratedDocument<TicketDoc>;
