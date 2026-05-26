import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { generateOrderNumber } from '@twinspire/utils';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  moneySchema,
  type ImageSchemaShape,
  type MoneySchemaShape,
} from './common.schemas';

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'on_hold'
  | 'failed';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled'
  | 'returned'
  | 'restocked';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'partially_refunded'
  | 'refunded'
  | 'voided'
  | 'failed';

/* ------------------------- Subschemas ------------------------- */

export interface OrderItemShape {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  sku: string;
  name: string;
  image?: ImageSchemaShape;
  unitPrice: MoneySchemaShape;
  quantity: number;
  discount?: MoneySchemaShape;
  tax?: MoneySchemaShape;
  lineTotal: MoneySchemaShape;
  attributes?: Record<string, string>;
}

const orderItemSchema = new Schema<OrderItemShape>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    sku: { type: String, required: true, trim: true, maxlength: 64 },
    name: { type: String, required: true, trim: true, maxlength: 280 },
    image: { type: imageSchema, default: undefined },
    unitPrice: { type: moneySchema, required: true },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    discount: { type: moneySchema, default: undefined },
    tax: { type: moneySchema, default: undefined },
    lineTotal: { type: moneySchema, required: true },
    attributes: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: true },
);

export interface OrderAddressShape {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

const orderAddressSchema = new Schema<OrderAddressShape>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 240 },
    company: { type: String, trim: true, maxlength: 120 },
    line1: { type: String, required: true, trim: true, maxlength: 240 },
    line2: { type: String, trim: true, maxlength: 240 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    state: { type: String, trim: true, maxlength: 120 },
    postalCode: { type: String, required: true, trim: true, maxlength: 32 },
    country: { type: String, required: true, trim: true, maxlength: 120 },
    countryCode: { type: String, required: true, uppercase: true, minlength: 2, maxlength: 2 },
  },
  { _id: false },
);

export interface OrderTotalsShape {
  subtotal: MoneySchemaShape;
  discount: MoneySchemaShape;
  shipping: MoneySchemaShape;
  tax: MoneySchemaShape;
  total: MoneySchemaShape;
}

const orderTotalsSchema = new Schema<OrderTotalsShape>(
  {
    subtotal: { type: moneySchema, required: true },
    discount: { type: moneySchema, required: true },
    shipping: { type: moneySchema, required: true },
    tax: { type: moneySchema, required: true },
    total: { type: moneySchema, required: true },
  },
  { _id: false },
);

export interface OrderTimelineEventShape {
  status: OrderStatus;
  occurredAt: Date;
  note?: string;
  byUserId?: Types.ObjectId;
}

const orderTimelineEventSchema = new Schema<OrderTimelineEventShape>(
  {
    status: { type: String, required: true },
    occurredAt: { type: Date, default: () => new Date() },
    note: { type: String, maxlength: 600 },
    byUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

/* ------------------------- Main schema ------------------------- */

export interface OrderAttrs {
  orderNumber: string;
  userId?: Types.ObjectId | null;
  guestEmail?: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  items: OrderItemShape[];
  totals: OrderTotalsShape;
  currency: string;
  shippingAddress: OrderAddressShape;
  billingAddress: OrderAddressShape;
  shippingMethod?: { id?: Types.ObjectId; name: string; carrier?: string; trackingNumber?: string };
  paymentMethod?: {
    id?: Types.ObjectId;
    provider: 'stripe' | 'paypal' | 'cash' | 'transfer' | 'local';
    last4?: string;
  };
  couponCodes: string[];
  notes?: string;
  invoiceUrl?: string;
  timeline: OrderTimelineEventShape[];
  placedAt: Date;
  paidAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
}

export interface OrderDoc extends OrderAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type OrderModelType = Model<OrderDoc> & PaginatedModel<OrderDoc>;

const orderSchema = new Schema<OrderDoc, OrderModelType>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: generateOrderNumber,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestEmail: { type: String, trim: true, lowercase: true, maxlength: 240, index: true, sparse: true },
    status: {
      type: String,
      enum: [
        'pending',
        'awaiting_payment',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
        'refunded',
        'on_hold',
        'failed',
      ],
      default: 'pending',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partial', 'fulfilled', 'returned', 'restocked'],
      default: 'unfulfilled',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'partially_refunded', 'refunded', 'voided', 'failed'],
      default: 'pending',
      index: true,
    },
    items: { type: [orderItemSchema], default: [] },
    totals: { type: orderTotalsSchema, required: true },
    currency: { type: String, required: true, uppercase: true },
    shippingAddress: { type: orderAddressSchema, required: true },
    billingAddress: { type: orderAddressSchema, required: true },
    shippingMethod: {
      id: { type: Schema.Types.ObjectId },
      name: { type: String, trim: true, maxlength: 120 },
      carrier: { type: String, trim: true, maxlength: 120 },
      trackingNumber: { type: String, trim: true, maxlength: 120 },
    },
    paymentMethod: {
      id: { type: Schema.Types.ObjectId },
      provider: { type: String, enum: ['stripe', 'paypal', 'cash', 'transfer', 'local'] },
      last4: { type: String, trim: true, maxlength: 8 },
    },
    couponCodes: { type: [{ type: String, uppercase: true, trim: true, maxlength: 48 }], default: [] },
    notes: { type: String, maxlength: 1000 },
    invoiceUrl: { type: String, trim: true, maxlength: 2048 },
    timeline: { type: [orderTimelineEventSchema], default: [] },
    placedAt: { type: Date, default: () => new Date(), index: true },
    paidAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'orders' },
);

applyBasePlugins(orderSchema);

orderSchema.index({ userId: 1, placedAt: -1 });
orderSchema.index({ status: 1, placedAt: -1 });
orderSchema.index({ paymentStatus: 1, placedAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, placedAt: -1 });
orderSchema.index({ 'shippingAddress.countryCode': 1, placedAt: -1 });
orderSchema.index({ orderNumber: 'text' });

export const Order = model<OrderDoc, OrderModelType>('Order', orderSchema);
export type OrderDocument = HydratedDocument<OrderDoc>;
