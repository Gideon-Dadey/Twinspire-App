import type { Address } from './address';
import type { BaseEntity, ID, Image, Money } from './common';

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

export interface OrderItem {
  id: ID;
  productId: ID;
  variantId?: ID;
  sku: string;
  name: string;
  image?: Image;
  unitPrice: Money;
  quantity: number;
  discount?: Money;
  tax?: Money;
  lineTotal: Money;
  attributes?: Record<string, string>;
}

export interface OrderTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  tax: Money;
  total: Money;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  occurredAt: string;
  note?: string;
  byUserId?: ID;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  userId?: ID | null;
  guestEmail?: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  totals: OrderTotals;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: { id: ID; name: string; carrier?: string; trackingNumber?: string };
  paymentMethod?: { id: ID; provider: 'stripe' | 'paypal' | 'cash' | 'transfer'; last4?: string };
  couponCodes: string[];
  notes?: string;
  invoiceUrl?: string;
  timeline: OrderTimelineEvent[];
  placedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}
