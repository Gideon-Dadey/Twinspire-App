import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface TicketAttachmentShape {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

const ticketAttachmentSchema = new Schema<TicketAttachmentShape>(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    name: { type: String, required: true, trim: true, maxlength: 240 },
    size: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { _id: false },
);

export interface TicketMessageAttrs {
  ticketId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorRole: 'customer' | 'agent' | 'system';
  body: string;
  attachments?: TicketAttachmentShape[];
  isInternal: boolean;
}

export interface TicketMessageDoc extends TicketMessageAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type TicketMessageModelType = Model<TicketMessageDoc> & PaginatedModel<TicketMessageDoc>;

const ticketMessageSchema = new Schema<TicketMessageDoc, TicketMessageModelType>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorRole: { type: String, enum: ['customer', 'agent', 'system'], required: true },
    body: { type: String, required: true, trim: true, maxlength: 20000 },
    attachments: { type: [ticketAttachmentSchema], default: undefined },
    isInternal: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'ticketMessages' },
);

applyBasePlugins(ticketMessageSchema);

ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const TicketMessage = model<TicketMessageDoc, TicketMessageModelType>(
  'TicketMessage',
  ticketMessageSchema,
);
export type TicketMessageDocument = HydratedDocument<TicketMessageDoc>;
