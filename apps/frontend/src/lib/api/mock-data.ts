import type { Address, Money, Order } from '@twinspire/types';

import { products } from '@/data/products';

export const DEMO_USER_ID = 'demo-user-1';

export interface MockUserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'support' | 'staff' | 'manager' | 'admin' | 'superadmin';
  status: 'pending' | 'active' | 'suspended' | 'banned';
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  preferences: {
    locale: string;
    currency: string;
    theme: 'light' | 'dark' | 'system';
    marketingOptIn: boolean;
    newsletter: boolean;
  };
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export const DEMO_USER: MockUserRecord = {
  id: DEMO_USER_ID,
  email: 'demo@twinspire.dev',
  firstName: 'Demo',
  lastName: 'Buyer',
  displayName: 'Demo Buyer',
  phone: '+1 555 010 1234',
  avatarUrl: 'https://i.pravatar.cc/200?img=12',
  role: 'customer',
  status: 'active',
  emailVerifiedAt: new Date('2026-04-01T00:00:00Z').toISOString(),
  phoneVerifiedAt: null,
  twoFactorEnabled: false,
  lastLoginAt: new Date().toISOString(),
  preferences: {
    locale: 'en-US',
    currency: 'USD',
    theme: 'system',
    marketingOptIn: true,
    newsletter: true,
  },
  loyaltyPoints: 1280,
  createdAt: new Date('2025-11-12T10:30:00Z').toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_PASSWORD = 'TwinSpire!2026';

export const DEMO_ADDRESSES: Address[] = [
  {
    id: 'demo-addr-1',
    userId: DEMO_USER_ID,
    label: 'Home',
    kind: 'both',
    firstName: 'Demo',
    lastName: 'Buyer',
    phone: '+1 555 010 1234',
    email: 'demo@twinspire.dev',
    line1: '1421 Lakeshore Blvd',
    line2: 'Apt 4B',
    city: 'Portland',
    state: 'OR',
    postalCode: '97214',
    country: 'United States',
    countryCode: 'US',
    isDefault: true,
    createdAt: new Date('2026-03-21T18:11:00Z').toISOString(),
    updatedAt: new Date('2026-03-21T18:11:00Z').toISOString(),
    deletedAt: null,
  },
  {
    id: 'demo-addr-2',
    userId: DEMO_USER_ID,
    label: 'Office',
    kind: 'shipping',
    firstName: 'Demo',
    lastName: 'Buyer',
    phone: '+1 555 010 1234',
    company: 'TwinSpire HQ',
    line1: '800 Pike St',
    line2: 'Suite 1100',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'United States',
    countryCode: 'US',
    isDefault: false,
    createdAt: new Date('2026-04-04T09:42:00Z').toISOString(),
    updatedAt: new Date('2026-04-04T09:42:00Z').toISOString(),
    deletedAt: null,
  },
];

function money(amount: number): Money {
  return { amount, currency: 'USD' };
}

function buildDemoOrders(): Order[] {
  const ship = DEMO_ADDRESSES[0];
  if (!ship) return [];
  const pickProduct = (idx: number) => products[idx % products.length];

  const a = pickProduct(0);
  const b = pickProduct(2);
  const c = pickProduct(5);
  const d = pickProduct(8);
  if (!a || !b || !c || !d) return [];

  const oneA: Order = {
    id: 'demo-order-1',
    orderNumber: 'TS-26-0042',
    userId: DEMO_USER_ID,
    status: 'delivered',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'captured',
    items: [
      {
        id: 'oi-1',
        productId: a.id,
        sku: a.sku ?? 'demo-sku-a',
        name: a.name,
        image: a.images[0],
        unitPrice: a.price,
        quantity: 1,
        lineTotal: a.price,
      },
      {
        id: 'oi-2',
        productId: b.id,
        sku: b.sku ?? 'demo-sku-b',
        name: b.name,
        image: b.images[0],
        unitPrice: b.price,
        quantity: 2,
        lineTotal: money(b.price.amount * 2),
      },
    ],
    totals: {
      subtotal: money(a.price.amount + b.price.amount * 2),
      discount: money(20),
      shipping: money(0),
      tax: money(28.4),
      total: money(a.price.amount + b.price.amount * 2 - 20 + 28.4),
    },
    currency: 'USD',
    shippingAddress: ship,
    billingAddress: ship,
    shippingMethod: { id: 'std', name: 'Standard', carrier: 'UPS', trackingNumber: '1Z999AA10123456784' },
    paymentMethod: { id: 'pm-1', provider: 'stripe', last4: '4242' },
    couponCodes: ['WELCOME10'],
    timeline: [
      { status: 'pending', occurredAt: '2026-04-22T15:21:00Z' },
      { status: 'paid', occurredAt: '2026-04-22T15:22:14Z' },
      { status: 'processing', occurredAt: '2026-04-23T09:05:00Z' },
      { status: 'shipped', occurredAt: '2026-04-24T13:48:00Z' },
      { status: 'delivered', occurredAt: '2026-04-26T17:02:00Z' },
    ],
    placedAt: '2026-04-22T15:21:00Z',
    paidAt: '2026-04-22T15:22:14Z',
    shippedAt: '2026-04-24T13:48:00Z',
    deliveredAt: '2026-04-26T17:02:00Z',
    createdAt: '2026-04-22T15:21:00Z',
    updatedAt: '2026-04-26T17:02:00Z',
    deletedAt: null,
  };

  const oneB: Order = {
    id: 'demo-order-2',
    orderNumber: 'TS-26-0058',
    userId: DEMO_USER_ID,
    status: 'shipped',
    fulfillmentStatus: 'partial',
    paymentStatus: 'captured',
    items: [
      {
        id: 'oi-3',
        productId: c.id,
        sku: c.sku ?? 'demo-sku-c',
        name: c.name,
        image: c.images[0],
        unitPrice: c.price,
        quantity: 1,
        lineTotal: c.price,
      },
    ],
    totals: {
      subtotal: c.price,
      discount: money(0),
      shipping: money(9.99),
      tax: money(c.price.amount * 0.08),
      total: money(c.price.amount + 9.99 + c.price.amount * 0.08),
    },
    currency: 'USD',
    shippingAddress: ship,
    billingAddress: ship,
    shippingMethod: { id: 'exp', name: 'Express', carrier: 'FedEx', trackingNumber: '7942 0123 4567' },
    paymentMethod: { id: 'pm-1', provider: 'stripe', last4: '4242' },
    couponCodes: [],
    timeline: [
      { status: 'pending', occurredAt: '2026-05-08T11:00:00Z' },
      { status: 'paid', occurredAt: '2026-05-08T11:01:18Z' },
      { status: 'processing', occurredAt: '2026-05-09T08:30:00Z' },
      { status: 'shipped', occurredAt: '2026-05-10T14:12:00Z' },
    ],
    placedAt: '2026-05-08T11:00:00Z',
    paidAt: '2026-05-08T11:01:18Z',
    shippedAt: '2026-05-10T14:12:00Z',
    createdAt: '2026-05-08T11:00:00Z',
    updatedAt: '2026-05-10T14:12:00Z',
    deletedAt: null,
  };

  const oneC: Order = {
    id: 'demo-order-3',
    orderNumber: 'TS-26-0071',
    userId: DEMO_USER_ID,
    status: 'paid',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'captured',
    items: [
      {
        id: 'oi-4',
        productId: d.id,
        sku: d.sku ?? 'demo-sku-d',
        name: d.name,
        image: d.images[0],
        unitPrice: d.price,
        quantity: 1,
        lineTotal: d.price,
      },
    ],
    totals: {
      subtotal: d.price,
      discount: money(0),
      shipping: money(0),
      tax: money(d.price.amount * 0.08),
      total: money(d.price.amount + d.price.amount * 0.08),
    },
    currency: 'USD',
    shippingAddress: ship,
    billingAddress: ship,
    paymentMethod: { id: 'pm-1', provider: 'stripe', last4: '4242' },
    couponCodes: [],
    timeline: [
      { status: 'pending', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { status: 'paid', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    ],
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    deletedAt: null,
  };

  return [oneC, oneB, oneA];
}

export const DEMO_ORDERS: Order[] = buildDemoOrders();

export const DEMO_WISHLIST_PRODUCT_IDS = products.slice(0, 5).map((p) => p.id);
