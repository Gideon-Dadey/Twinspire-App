import type { BaseEntity, ID, Money } from './common';

export type PaymentProvider = 'stripe' | 'paypal' | 'cash' | 'transfer' | 'local';

export type PaymentIntentStatus =
  | 'requires_action'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'cancelled'
  | 'failed';

export interface Payment extends BaseEntity {
  orderId: ID;
  userId?: ID | null;
  provider: PaymentProvider;
  providerPaymentId?: string;
  amount: Money;
  status: PaymentIntentStatus;
  metadata?: Record<string, unknown>;
  refundedAmount?: Money;
  failureReason?: string;
  receiptUrl?: string;
  authorizedAt?: string;
  capturedAt?: string;
  refundedAt?: string;
}
