import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import { moneySchema, type MoneySchemaShape } from './common.schemas';

export type PaymentProvider = 'stripe' | 'paypal' | 'cash' | 'transfer' | 'local';
export type PaymentIntentStatus =
  | 'requires_action'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'cancelled'
  | 'failed';

export interface PaymentAttrs {
  orderId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerCustomerId?: string;
  amount: MoneySchemaShape;
  status: PaymentIntentStatus;
  metadata?: Record<string, unknown>;
  refundedAmount?: MoneySchemaShape;
  failureReason?: string;
  receiptUrl?: string;
  rawEvent?: Record<string, unknown>;
  authorizedAt?: Date;
  capturedAt?: Date;
  refundedAt?: Date;
}

export interface PaymentDoc extends PaymentAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type PaymentModelType = Model<PaymentDoc> & PaginatedModel<PaymentDoc>;

const paymentSchema = new Schema<PaymentDoc, PaymentModelType>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'cash', 'transfer', 'local'],
      required: true,
      index: true,
    },
    providerPaymentId: { type: String, trim: true, index: { sparse: true } },
    providerCustomerId: { type: String, trim: true },
    amount: { type: moneySchema, required: true },
    status: {
      type: String,
      enum: [
        'requires_action',
        'requires_confirmation',
        'processing',
        'succeeded',
        'cancelled',
        'failed',
      ],
      default: 'processing',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    refundedAmount: { type: moneySchema, default: undefined },
    failureReason: { type: String, maxlength: 1000 },
    receiptUrl: { type: String, trim: true, maxlength: 2048 },
    rawEvent: { type: Schema.Types.Mixed, default: undefined, select: false },
    authorizedAt: { type: Date },
    capturedAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true, collection: 'payments' },
);

applyBasePlugins(paymentSchema);

paymentSchema.index({ provider: 1, status: 1, createdAt: -1 });
paymentSchema.index({ providerPaymentId: 1, provider: 1 }, { unique: true, sparse: true });

export const Payment = model<PaymentDoc, PaymentModelType>('Payment', paymentSchema);
export type PaymentDocument = HydratedDocument<PaymentDoc>;
