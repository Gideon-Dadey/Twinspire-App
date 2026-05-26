/**
 * Seed data for the admin-side mock backend. Combines the public
 * catalog (Phase 6) with admin-only fixtures (multi-customer orders,
 * coupons, audit log, admin user roster) so every Phase 8 surface has
 * meaningful data on first paint.
 */

import type { Coupon, CurrencyCode, Money, Order, OrderItem, Review } from '@twinspire/types';

import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { reviews } from '@/data/reviews';

import {
  DEMO_ADDRESSES,
  DEMO_ORDERS,
  DEMO_USER,
  DEMO_USER_ID,
  type MockUserRecord,
} from './mock-data';

function money(amount: number, currency: CurrencyCode = 'GHS'): Money {
  return { amount, currency };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function isoDaysAgo(days: number, jitterHours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  if (jitterHours) d.setHours(d.getHours() - jitterHours);
  return d.toISOString();
}

/* -------------------------------------------------------------------------- */
/* Admin staff + extra customers                                              */
/* -------------------------------------------------------------------------- */

export const ADMIN_USER: MockUserRecord = {
  id: 'demo-admin-1',
  email: 'admin@twinspire.dev',
  firstName: 'Adaeze',
  lastName: 'Nwosu',
  displayName: 'Adaeze Nwosu',
  phone: '+1 555 010 4242',
  avatarUrl: 'https://i.pravatar.cc/200?img=47',
  role: 'admin',
  status: 'active',
  emailVerifiedAt: isoDaysAgo(120),
  phoneVerifiedAt: isoDaysAgo(110),
  twoFactorEnabled: true,
  lastLoginAt: isoDaysAgo(0, 2),
  preferences: {
    locale: 'en-US',
    currency: 'GHS',
    theme: 'system',
    marketingOptIn: false,
    newsletter: false,
  },
  loyaltyPoints: 0,
  createdAt: isoDaysAgo(180),
  updatedAt: isoDaysAgo(0, 2),
};

export const MANAGER_USER: MockUserRecord = {
  id: 'demo-manager-1',
  email: 'manager@twinspire.dev',
  firstName: 'Jordan',
  lastName: 'Reyes',
  displayName: 'Jordan Reyes',
  phone: '+1 555 010 8421',
  avatarUrl: 'https://i.pravatar.cc/200?img=33',
  role: 'manager',
  status: 'active',
  emailVerifiedAt: isoDaysAgo(95),
  phoneVerifiedAt: null,
  twoFactorEnabled: true,
  lastLoginAt: isoDaysAgo(0, 5),
  preferences: {
    locale: 'en-US',
    currency: 'GHS',
    theme: 'dark',
    marketingOptIn: false,
    newsletter: true,
  },
  loyaltyPoints: 0,
  createdAt: isoDaysAgo(150),
  updatedAt: isoDaysAgo(1),
};

export const ADMIN_PASSWORD = 'TwinSpire!2026';

const EXTRA_CUSTOMER_SEEDS: Array<
  Pick<MockUserRecord, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'avatarUrl'> & {
    loyaltyPoints: number;
    daysAgo: number;
    status?: MockUserRecord['status'];
  }
> = [
  {
    id: 'cust-2',
    email: 'lena.ito@example.com',
    firstName: 'Lena',
    lastName: 'Ito',
    phone: '+1 555 010 1102',
    avatarUrl: 'https://i.pravatar.cc/200?img=20',
    loyaltyPoints: 2400,
    daysAgo: 220,
  },
  {
    id: 'cust-3',
    email: 'marcus.holt@example.com',
    firstName: 'Marcus',
    lastName: 'Holt',
    phone: '+1 555 010 1103',
    avatarUrl: 'https://i.pravatar.cc/200?img=11',
    loyaltyPoints: 870,
    daysAgo: 60,
  },
  {
    id: 'cust-4',
    email: 'priya.shah@example.com',
    firstName: 'Priya',
    lastName: 'Shah',
    phone: '+1 555 010 1104',
    avatarUrl: 'https://i.pravatar.cc/200?img=44',
    loyaltyPoints: 4100,
    daysAgo: 410,
  },
  {
    id: 'cust-5',
    email: 'thiago.alves@example.com',
    firstName: 'Thiago',
    lastName: 'Alves',
    phone: '+1 555 010 1105',
    avatarUrl: 'https://i.pravatar.cc/200?img=15',
    loyaltyPoints: 0,
    daysAgo: 14,
  },
  {
    id: 'cust-6',
    email: 'amelia.brookes@example.com',
    firstName: 'Amelia',
    lastName: 'Brookes',
    phone: '+1 555 010 1106',
    avatarUrl: 'https://i.pravatar.cc/200?img=24',
    loyaltyPoints: 1620,
    daysAgo: 320,
  },
  {
    id: 'cust-7',
    email: 'rashid.khan@example.com',
    firstName: 'Rashid',
    lastName: 'Khan',
    phone: '+1 555 010 1107',
    avatarUrl: 'https://i.pravatar.cc/200?img=58',
    loyaltyPoints: 380,
    daysAgo: 31,
  },
  {
    id: 'cust-8',
    email: 'mei.tanaka@example.com',
    firstName: 'Mei',
    lastName: 'Tanaka',
    phone: '+1 555 010 1108',
    avatarUrl: 'https://i.pravatar.cc/200?img=49',
    loyaltyPoints: 5230,
    daysAgo: 540,
    status: 'suspended',
  },
  {
    id: 'cust-9',
    email: 'oluwaseun.ade@example.com',
    firstName: 'Seun',
    lastName: 'Ade',
    phone: '+1 555 010 1109',
    avatarUrl: 'https://i.pravatar.cc/200?img=53',
    loyaltyPoints: 2010,
    daysAgo: 190,
  },
];

export const EXTRA_CUSTOMERS: MockUserRecord[] = EXTRA_CUSTOMER_SEEDS.map((seed) => ({
  id: seed.id,
  email: seed.email,
  firstName: seed.firstName,
  lastName: seed.lastName,
  displayName: `${seed.firstName} ${seed.lastName}`,
  phone: seed.phone,
  avatarUrl: seed.avatarUrl,
  role: 'customer',
  status: seed.status ?? 'active',
  emailVerifiedAt: isoDaysAgo(seed.daysAgo - 1),
  phoneVerifiedAt: null,
  twoFactorEnabled: seed.loyaltyPoints > 3000,
  lastLoginAt: isoDaysAgo(clamp(seed.daysAgo / 10, 0, 60)),
  preferences: {
    locale: 'en-GH',
    currency: 'GHS',
    theme: 'system',
    marketingOptIn: seed.loyaltyPoints > 1000,
    newsletter: seed.loyaltyPoints > 500,
  },
  loyaltyPoints: seed.loyaltyPoints,
  createdAt: isoDaysAgo(seed.daysAgo),
  updatedAt: isoDaysAgo(clamp(seed.daysAgo / 10, 0, 60)),
}));

export const ALL_MOCK_USERS: MockUserRecord[] = [
  DEMO_USER,
  ADMIN_USER,
  MANAGER_USER,
  ...EXTRA_CUSTOMERS,
];

/* -------------------------------------------------------------------------- */
/* Extra orders across all customers                                          */
/* -------------------------------------------------------------------------- */

const baseAddress = DEMO_ADDRESSES[0];

function makeOrder(opts: {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail?: string;
  productIds: string[];
  quantities?: number[];
  status: Order['status'];
  fulfillmentStatus: Order['fulfillmentStatus'];
  paymentStatus: Order['paymentStatus'];
  placedDaysAgo: number;
  shippedDaysAgo?: number;
  deliveredDaysAgo?: number;
  cancelledDaysAgo?: number;
  shippingPrice?: number;
  discount?: number;
  coupons?: string[];
  carrier?: string;
  tracking?: string;
  note?: string;
}): Order {
  if (!baseAddress) throw new Error('Base mock address missing');
  const items: OrderItem[] = opts.productIds.map((pid, i) => {
    const product = products.find((p) => p.id === pid) ?? products[i % products.length];
    const qty = opts.quantities?.[i] ?? 1;
    if (!product) {
      throw new Error('Product missing for mock order');
    }
    return {
      id: `${opts.id}-i${i}`,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      image: product.images[0],
      unitPrice: product.price,
      quantity: qty,
      lineTotal: money(product.price.amount * qty, product.price.currency),
    };
  });

  const subtotalAmt = items.reduce((sum, it) => sum + it.lineTotal.amount, 0);
  const discount = opts.discount ?? 0;
  // Shipping is permanently 0 — Twinspire is a Ghana storefront with phone-
  // coordinated local delivery, not carrier-driven fulfilment. The opts param
  // is still honoured for any future override but defaults to free.
  const shipping = opts.shippingPrice ?? 0;
  // Ghana VAT (NHIL + GETFund + VAT effective rate is ~12.5% combined).
  const tax = Number(((subtotalAmt - discount) * 0.125).toFixed(2));
  const total = Number((subtotalAmt - discount + shipping + tax).toFixed(2));

  const placedAt = isoDaysAgo(opts.placedDaysAgo);
  const paidAt =
    opts.paymentStatus === 'captured' || opts.paymentStatus === 'authorized'
      ? isoDaysAgo(opts.placedDaysAgo, 1)
      : undefined;
  const shippedAt = opts.shippedDaysAgo !== undefined ? isoDaysAgo(opts.shippedDaysAgo) : undefined;
  const deliveredAt =
    opts.deliveredDaysAgo !== undefined ? isoDaysAgo(opts.deliveredDaysAgo) : undefined;
  const cancelledAt =
    opts.cancelledDaysAgo !== undefined ? isoDaysAgo(opts.cancelledDaysAgo) : undefined;

  const timeline: Order['timeline'] = [{ status: 'pending', occurredAt: placedAt }];
  if (paidAt) timeline.push({ status: 'paid', occurredAt: paidAt });
  if (opts.status === 'processing' || shippedAt) {
    timeline.push({ status: 'processing', occurredAt: isoDaysAgo(opts.placedDaysAgo - 1) });
  }
  if (shippedAt) timeline.push({ status: 'shipped', occurredAt: shippedAt });
  if (deliveredAt) timeline.push({ status: 'delivered', occurredAt: deliveredAt });
  if (cancelledAt) timeline.push({ status: 'cancelled', occurredAt: cancelledAt });

  return {
    id: opts.id,
    orderNumber: opts.orderNumber,
    userId: opts.userId,
    guestEmail: opts.guestEmail,
    status: opts.status,
    fulfillmentStatus: opts.fulfillmentStatus,
    paymentStatus: opts.paymentStatus,
    items,
    totals: {
      subtotal: money(subtotalAmt),
      discount: money(discount),
      shipping: money(shipping),
      tax: money(tax),
      total: money(total),
    },
    currency: 'GHS',
    shippingAddress: baseAddress,
    billingAddress: baseAddress,
    shippingMethod: shippedAt
      ? {
          id: 'local',
          name: 'Ghana metro delivery',
          carrier: opts.carrier ?? 'TwinSpire Logistics',
          trackingNumber: opts.tracking ?? 'TS-DEL-0001',
        }
      : undefined,
    paymentMethod: { id: 'pm-mock', provider: 'stripe', last4: '4242' },
    couponCodes: opts.coupons ?? [],
    notes: opts.note,
    timeline,
    placedAt,
    paidAt,
    shippedAt,
    deliveredAt,
    cancelledAt,
    createdAt: placedAt,
    updatedAt: cancelledAt ?? deliveredAt ?? shippedAt ?? paidAt ?? placedAt,
    deletedAt: null,
  };
}

const productIds = products.slice(0, 12).map((p) => p.id);
const pid = (i: number) =>
  productIds[i % productIds.length] ?? productIds[0] ?? products[0]?.id ?? '';

export const ADMIN_EXTRA_ORDERS: Order[] = [
  makeOrder({
    id: 'ord-A',
    orderNumber: 'TS-26-0102',
    userId: 'cust-2',
    productIds: [pid(0), pid(3)],
    status: 'delivered',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 5,
    shippedDaysAgo: 3,
    deliveredDaysAgo: 1,
    coupons: ['SPRING15'],
  }),
  makeOrder({
    id: 'ord-B',
    orderNumber: 'TS-26-0103',
    userId: 'cust-3',
    productIds: [pid(1)],
    status: 'shipped',
    fulfillmentStatus: 'partial',
    paymentStatus: 'captured',
    placedDaysAgo: 3,
    shippedDaysAgo: 1,
    carrier: 'FedEx',
    tracking: '7942 0123 4501',
  }),
  makeOrder({
    id: 'ord-C',
    orderNumber: 'TS-26-0104',
    userId: 'cust-4',
    productIds: [pid(2), pid(7), pid(11)],
    quantities: [1, 2, 1],
    status: 'processing',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 2,
  }),
  makeOrder({
    id: 'ord-D',
    orderNumber: 'TS-26-0105',
    userId: 'cust-5',
    productIds: [pid(5)],
    status: 'paid',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 1,
  }),
  makeOrder({
    id: 'ord-E',
    orderNumber: 'TS-26-0106',
    userId: 'cust-6',
    productIds: [pid(8), pid(9)],
    status: 'pending',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'pending',
    placedDaysAgo: 0,
  }),
  makeOrder({
    id: 'ord-F',
    orderNumber: 'TS-26-0107',
    userId: 'cust-7',
    productIds: [pid(4)],
    status: 'cancelled',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'refunded',
    placedDaysAgo: 7,
    cancelledDaysAgo: 6,
    note: 'Customer changed mind.',
  }),
  makeOrder({
    id: 'ord-G',
    orderNumber: 'TS-26-0108',
    userId: 'cust-8',
    productIds: [pid(6), pid(10)],
    status: 'delivered',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 14,
    shippedDaysAgo: 12,
    deliveredDaysAgo: 10,
  }),
  makeOrder({
    id: 'ord-H',
    orderNumber: 'TS-26-0109',
    userId: 'cust-9',
    productIds: [pid(0)],
    status: 'refunded',
    fulfillmentStatus: 'returned',
    paymentStatus: 'refunded',
    placedDaysAgo: 18,
    shippedDaysAgo: 16,
    deliveredDaysAgo: 14,
    note: 'Wrong size — refunded in full.',
  }),
  makeOrder({
    id: 'ord-I',
    orderNumber: 'TS-26-0110',
    userId: null,
    guestEmail: 'guest@example.com',
    productIds: [pid(2)],
    status: 'paid',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 0,
  }),
  makeOrder({
    id: 'ord-J',
    orderNumber: 'TS-26-0111',
    userId: 'cust-2',
    productIds: [pid(5), pid(1)],
    status: 'delivered',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'captured',
    placedDaysAgo: 21,
    shippedDaysAgo: 19,
    deliveredDaysAgo: 17,
    coupons: ['WELCOME10'],
  }),
];

/** All orders across all users (admin view). */
export const ALL_ADMIN_ORDERS: Order[] = [...ADMIN_EXTRA_ORDERS, ...DEMO_ORDERS];

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

function buildCoupon(
  seed: Partial<Coupon> &
    Pick<Coupon, 'id' | 'code' | 'type' | 'value' | 'isActive' | 'stackable' | 'firstOrderOnly'>,
): Coupon {
  return {
    description: seed.description,
    currency: seed.currency,
    minSubtotal: seed.minSubtotal,
    maxDiscount: seed.maxDiscount,
    usageLimit: seed.usageLimit,
    usageLimitPerUser: seed.usageLimitPerUser,
    usedCount: seed.usedCount ?? 0,
    applicableCategoryIds: seed.applicableCategoryIds,
    applicableBrandIds: seed.applicableBrandIds,
    applicableProductIds: seed.applicableProductIds,
    excludedProductIds: seed.excludedProductIds,
    startsAt: seed.startsAt ?? isoDaysAgo(30),
    expiresAt: seed.expiresAt,
    campaignId: seed.campaignId,
    createdAt: seed.createdAt ?? isoDaysAgo(60),
    updatedAt: seed.updatedAt ?? isoDaysAgo(5),
    deletedAt: null,
    ...seed,
  } as Coupon;
}

export const ADMIN_COUPONS: Coupon[] = [
  buildCoupon({
    id: 'cpn-1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: 'Welcome offer — 10% off your first order.',
    usageLimit: 5000,
    usageLimitPerUser: 1,
    usedCount: 1284,
    isActive: true,
    stackable: false,
    firstOrderOnly: true,
    expiresAt: isoDaysAgo(-60),
  }),
  buildCoupon({
    id: 'cpn-2',
    code: 'SPRING15',
    type: 'percentage',
    value: 15,
    description: 'Spring 2026 sale.',
    usageLimit: 10_000,
    usageLimitPerUser: 2,
    usedCount: 412,
    isActive: true,
    stackable: false,
    firstOrderOnly: false,
    expiresAt: isoDaysAgo(-20),
    minSubtotal: money(1188), // ~99 USD × 12 = 1,188 GHS
  }),
  buildCoupon({
    id: 'cpn-4',
    code: 'AUDIO50',
    type: 'fixed',
    value: 600,
    currency: 'GHS',
    description: '₵600 off premium headphones.',
    applicableCategoryIds: ['cat-audio'],
    usedCount: 67,
    usageLimit: 500,
    isActive: true,
    stackable: false,
    firstOrderOnly: false,
    expiresAt: isoDaysAgo(-12),
  }),
  buildCoupon({
    id: 'cpn-5',
    code: 'BFCM2025',
    type: 'percentage',
    value: 25,
    description: 'Black Friday / Cyber Monday 2025.',
    usedCount: 4108,
    usageLimit: 20_000,
    isActive: false,
    stackable: false,
    firstOrderOnly: false,
    startsAt: isoDaysAgo(180),
    expiresAt: isoDaysAgo(150),
  }),
  buildCoupon({
    id: 'cpn-6',
    code: 'BOGO-HEADPHONES',
    type: 'bogo',
    value: 100,
    description: 'Buy one pair of headphones, get one free (lower price).',
    applicableBrandIds: ['brand-aurora'],
    usedCount: 18,
    usageLimit: 100,
    isActive: true,
    stackable: false,
    firstOrderOnly: false,
    expiresAt: isoDaysAgo(-7),
  }),
];

/* -------------------------------------------------------------------------- */
/* Reviews (mix of statuses for the moderation queue)                         */
/* -------------------------------------------------------------------------- */

export const ADMIN_REVIEWS: Review[] = (() => {
  const base = reviews.slice(0, 14);
  const moderationSeeds: Array<
    Pick<
      Review,
      | 'productId'
      | 'rating'
      | 'title'
      | 'body'
      | 'authorName'
      | 'verifiedPurchase'
      | 'helpfulCount'
      | 'notHelpfulCount'
    > & { status: Review['status']; daysAgo: number; moderatorNote?: string }
  > = [
    {
      productId: products[0]?.id ?? 'p-0',
      rating: 1,
      title: 'Worst product ever — DO NOT BUY',
      body: 'Total scam. Box was empty. Calling my lawyer. Spam spam spam visit my website at example.com',
      authorName: 'Anonymous',
      verifiedPurchase: false,
      helpfulCount: 0,
      notHelpfulCount: 18,
      status: 'pending',
      daysAgo: 0,
    },
    {
      productId: products[3]?.id ?? 'p-3',
      rating: 5,
      title: 'Incredible quality for the price',
      body: 'Picked it up on launch day — the build feels premium and battery has been excellent. Customer support was responsive when I had a question about setup. Highly recommend.',
      authorName: 'Kai R.',
      verifiedPurchase: true,
      helpfulCount: 12,
      notHelpfulCount: 1,
      status: 'pending',
      daysAgo: 1,
    },
    {
      productId: products[6]?.id ?? 'p-6',
      rating: 2,
      title: 'Doesn’t live up to the hype',
      body: 'Sound is fine but the app is buggy and ANC underperforms my older pair. Returning.',
      authorName: 'Theresa K.',
      verifiedPurchase: true,
      helpfulCount: 6,
      notHelpfulCount: 0,
      status: 'flagged',
      moderatorNote: 'Possible competitor — re-check authenticity.',
      daysAgo: 4,
    },
    {
      productId: products[2]?.id ?? 'p-2',
      rating: 4,
      title: 'Great daily driver',
      body: 'After three weeks the laptop has held up well. Display is crisp and the keyboard travel is perfect for long writing sessions.',
      authorName: 'Imani B.',
      verifiedPurchase: true,
      helpfulCount: 4,
      notHelpfulCount: 0,
      status: 'approved',
      daysAgo: 9,
    },
    {
      productId: products[1]?.id ?? 'p-1',
      rating: 5,
      title: 'My new favourite gadget',
      body: 'It just works. Setup took five minutes and the integration with my home Wi-Fi was flawless.',
      authorName: 'Devon W.',
      verifiedPurchase: true,
      helpfulCount: 22,
      notHelpfulCount: 1,
      status: 'approved',
      daysAgo: 15,
    },
    {
      productId: products[5]?.id ?? 'p-5',
      rating: 1,
      title: '',
      body: 'check out this link cool prices www.notreallyalink.example',
      authorName: 'Spammy',
      verifiedPurchase: false,
      helpfulCount: 0,
      notHelpfulCount: 30,
      status: 'rejected',
      moderatorNote: 'Spam / external link.',
      daysAgo: 18,
    },
  ];

  const overrides: Review[] = moderationSeeds.map((seed, i) => ({
    id: `mod-r-${i}`,
    productId: seed.productId,
    userId: `mod-u-${i}`,
    authorName: seed.authorName,
    rating: seed.rating,
    title: seed.title,
    body: seed.body,
    helpfulCount: seed.helpfulCount,
    notHelpfulCount: seed.notHelpfulCount,
    verifiedPurchase: seed.verifiedPurchase,
    status: seed.status,
    moderatorNote: seed.moderatorNote,
    createdAt: isoDaysAgo(seed.daysAgo),
    updatedAt: isoDaysAgo(seed.daysAgo - 0.5),
    deletedAt: null,
  }));

  return [...overrides, ...base];
})();

/* -------------------------------------------------------------------------- */
/* Audit log                                                                  */
/* -------------------------------------------------------------------------- */

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, string | number>;
  createdAt: string;
}

export const ADMIN_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'au-1',
    actorId: ADMIN_USER.id,
    actorName: ADMIN_USER.displayName ?? 'Admin',
    action: 'order.refund',
    entity: 'order',
    entityId: 'ord-H',
    metadata: { amount: 199.99 },
    createdAt: isoDaysAgo(0, 4),
  },
  {
    id: 'au-2',
    actorId: MANAGER_USER.id,
    actorName: MANAGER_USER.displayName ?? 'Manager',
    action: 'product.update',
    entity: 'product',
    entityId: products[0]?.id ?? 'p-0',
    metadata: { field: 'price', from: 349, to: 329 },
    createdAt: isoDaysAgo(0, 8),
  },
  {
    id: 'au-3',
    actorId: ADMIN_USER.id,
    actorName: ADMIN_USER.displayName ?? 'Admin',
    action: 'coupon.create',
    entity: 'coupon',
    entityId: 'cpn-3',
    createdAt: isoDaysAgo(1),
  },
  {
    id: 'au-4',
    actorId: MANAGER_USER.id,
    actorName: MANAGER_USER.displayName ?? 'Manager',
    action: 'review.moderate',
    entity: 'review',
    entityId: 'mod-r-5',
    metadata: { decision: 'rejected' },
    createdAt: isoDaysAgo(1, 3),
  },
  {
    id: 'au-5',
    actorId: ADMIN_USER.id,
    actorName: ADMIN_USER.displayName ?? 'Admin',
    action: 'user.suspend',
    entity: 'user',
    entityId: 'cust-8',
    metadata: { reason: 'Chargeback abuse' },
    createdAt: isoDaysAgo(2),
  },
  {
    id: 'au-6',
    actorId: MANAGER_USER.id,
    actorName: MANAGER_USER.displayName ?? 'Manager',
    action: 'product.create',
    entity: 'product',
    entityId: 'p-new-1',
    createdAt: isoDaysAgo(3),
  },
  {
    id: 'au-7',
    actorId: ADMIN_USER.id,
    actorName: ADMIN_USER.displayName ?? 'Admin',
    action: 'brand.update',
    entity: 'brand',
    entityId: brands[0]?.id ?? 'b-0',
    createdAt: isoDaysAgo(4),
  },
  {
    id: 'au-8',
    actorId: MANAGER_USER.id,
    actorName: MANAGER_USER.displayName ?? 'Manager',
    action: 'order.update',
    entity: 'order',
    entityId: 'ord-B',
    metadata: { status: 'shipped' },
    createdAt: isoDaysAgo(5),
  },
];

/* -------------------------------------------------------------------------- */
/* Analytics — derived from the order set, with a 30 day curve                */
/* -------------------------------------------------------------------------- */

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface AdminAnalyticsSummary {
  ordersToday: number;
  ordersTodayDeltaPct: number;
  revenueToday: Money;
  revenueTodayDeltaPct: number;
  averageOrderValue: Money;
  averageOrderValueDeltaPct: number;
  activeCustomers: number;
  activeCustomersDeltaPct: number;
  conversionRate: number;
  conversionRateDeltaPct: number;
  newSignupsWeek: number;
  pendingReviews: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueSeries30d: SeriesPoint[];
  ordersSeries30d: SeriesPoint[];
  ordersByStatus: Array<{ status: Order['status']; count: number }>;
  topProducts: Array<{
    productId: string;
    name: string;
    revenue: Money;
    units: number;
    image?: { url: string; alt: string };
  }>;
  topCategories: Array<{
    categoryId: string;
    name: string;
    revenue: Money;
    share: number;
  }>;
  recentOrders: Order[];
  recentAudit: AuditEvent[];
}

function buildSeries(seed: number, days = 30, base = 8000, jitter = 4500): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const x = (days - 1 - i) / (days - 1);
    const wave = Math.sin((x + seed) * Math.PI * 1.5) * 0.7 + 0.3;
    const value = Math.round(base + jitter * wave + Math.sin(seed + i * 0.9) * 700);
    out.push({ date: isoDaysAgo(i), value: Math.max(0, value) });
  }
  return out;
}

export function buildAdminAnalytics(): AdminAnalyticsSummary {
  const todayDayKey = new Date().toISOString().slice(0, 10);
  const ordersToday = ALL_ADMIN_ORDERS.filter((o) => o.placedAt.startsWith(todayDayKey));
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.totals.total.amount, 0);
  const grossRevenue = ALL_ADMIN_ORDERS.reduce((sum, o) => sum + o.totals.total.amount, 0);

  const productRevenue = new Map<
    string,
    { name: string; revenue: number; units: number; image?: { url: string; alt: string } }
  >();
  for (const order of ALL_ADMIN_ORDERS) {
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    for (const item of order.items) {
      const existing = productRevenue.get(item.productId);
      if (existing) {
        existing.revenue += item.lineTotal.amount;
        existing.units += item.quantity;
      } else {
        productRevenue.set(item.productId, {
          name: item.name,
          revenue: item.lineTotal.amount,
          units: item.quantity,
          image: item.image ? { url: item.image.url, alt: item.image.alt ?? item.name } : undefined,
        });
      }
    }
  }
  const topProducts = Array.from(productRevenue.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([productId, info]) => ({
      productId,
      name: info.name,
      revenue: money(Number(info.revenue.toFixed(2))),
      units: info.units,
      image: info.image,
    }));

  const ordersByStatusMap = new Map<Order['status'], number>();
  for (const o of ALL_ADMIN_ORDERS) {
    ordersByStatusMap.set(o.status, (ordersByStatusMap.get(o.status) ?? 0) + 1);
  }
  const ordersByStatus = Array.from(ordersByStatusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  const lowStock = products.filter(
    (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock',
  ).length;

  // Category revenues scaled to the GHS regime (USD ×12).
  const topCategories = [
    { categoryId: 'cat-audio', name: 'Audio', revenue: money(577_440), share: 0.32 },
    { categoryId: 'cat-laptops', name: 'Laptops', revenue: money(442_080), share: 0.24 },
    { categoryId: 'cat-tvs', name: 'TVs & monitors', revenue: money(341_280), share: 0.19 },
    { categoryId: 'cat-phones', name: 'Phones', revenue: money(254_160), share: 0.14 },
    { categoryId: 'cat-accessories', name: 'Accessories', revenue: money(194_400), share: 0.11 },
  ];

  return {
    ordersToday: ordersToday.length || 4,
    ordersTodayDeltaPct: 12.4,
    revenueToday: money(Number(revenueToday.toFixed(2))) ?? money(29_760),
    revenueTodayDeltaPct: 8.6,
    averageOrderValue: money(
      Number((grossRevenue / Math.max(1, ALL_ADMIN_ORDERS.length)).toFixed(2)),
    ),
    averageOrderValueDeltaPct: -2.1,
    activeCustomers:
      ALL_MOCK_USERS.filter((u) => u.role === 'customer' && u.status === 'active').length + 142,
    activeCustomersDeltaPct: 5.4,
    conversionRate: 3.42,
    conversionRateDeltaPct: 0.8,
    newSignupsWeek: 38,
    pendingReviews: ADMIN_REVIEWS.filter((r) => r.status === 'pending').length,
    pendingOrders: ALL_ADMIN_ORDERS.filter(
      (o) => o.status === 'pending' || o.status === 'paid' || o.status === 'processing',
    ).length,
    lowStockProducts: lowStock + 6,
    revenueSeries30d: buildSeries(0.3, 30, 9200, 4800),
    ordersSeries30d: buildSeries(0.7, 30, 38, 22),
    ordersByStatus,
    topProducts,
    topCategories,
    recentOrders: [...ALL_ADMIN_ORDERS]
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
      .slice(0, 6),
    recentAudit: ADMIN_AUDIT_LOG.slice(0, 5),
  };
}

export const ADMIN_USER_ID = ADMIN_USER.id;
export const MANAGER_USER_ID = MANAGER_USER.id;
export const DEMO_CUSTOMER_ID = DEMO_USER_ID;

/**
 * Records that should be added to the Phase 7 user store so that staff
 * accounts can sign in via the regular /login flow with the demo password.
 */
export const STAFF_SEED_USERS: MockUserRecord[] = [ADMIN_USER, MANAGER_USER];
