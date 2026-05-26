import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(32),
  email: z.string().email().optional(),
  company: z.string().max(120).optional(),
  line1: z.string().trim().min(1).max(240),
  line2: z.string().max(240).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().max(120).optional(),
  postalCode: z.string().trim().min(1).max(32),
  country: z.string().trim().min(1).max(120),
  countryCode: z.string().length(2).toUpperCase(),
});

export const checkoutQuoteBodySchema = z.object({
  shippingAddress: addressSchema.optional(),
  couponCodes: z.array(z.string().trim().max(48)).max(5).optional(),
});

export const placeOrderBodySchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethodId: objectId.optional(),
  paymentProvider: z.enum(['stripe', 'paypal']),
  guestEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

export const orderParamsSchema = z.object({
  orderId: objectId,
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum([
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
    ])
    .optional(),
});
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const adminUpdateOrderBodySchema = z.object({
  status: orderListQuerySchema.shape.status.unwrap().optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'partial', 'fulfilled', 'returned', 'restocked']).optional(),
  note: z.string().max(600).optional(),
  trackingNumber: z.string().max(120).optional(),
  carrier: z.string().max(120).optional(),
});

export const refundOrderBodySchema = z.object({
  amount: z.number().min(0).optional(),
  reason: z.string().max(600).optional(),
});
