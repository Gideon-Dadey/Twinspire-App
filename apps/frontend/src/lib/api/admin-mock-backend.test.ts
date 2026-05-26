/**
 * Smoke tests for the Phase 8 admin mock backend.
 *
 * These exercise the same code paths the React hooks invoke at runtime,
 * so contract regressions are caught before they reach the UI.
 */

import { adminMockBackend } from './admin-mock-backend';
import { ADMIN_PASSWORD, ADMIN_USER, MANAGER_USER } from './admin-mock-data';
import { mockBackend, MockApiError } from './mock-backend';
import { DEMO_PASSWORD } from './mock-data';

beforeEach(() => {
  window.localStorage.clear();
});

async function loginAs(role: 'admin' | 'manager' | 'customer'): Promise<void> {
  if (role === 'customer') {
    await mockBackend.login({ email: 'demo@twinspire.dev', password: DEMO_PASSWORD });
    return;
  }
  const target = role === 'admin' ? ADMIN_USER : MANAGER_USER;
  // Both staff fixtures ship with 2FA enabled; any 6-digit code is accepted by the mock.
  await mockBackend.login({ email: target.email, password: ADMIN_PASSWORD, totpCode: '123456' });
}

describe('adminMockBackend.auth gating', () => {
  it('rejects requests with no session', async () => {
    await expect(adminMockBackend.getAnalytics()).rejects.toBeInstanceOf(MockApiError);
  });

  it('rejects customers from staff-only endpoints', async () => {
    await loginAs('customer');
    await expect(adminMockBackend.getAnalytics()).rejects.toBeInstanceOf(MockApiError);
  });

  it('lets staff load analytics', async () => {
    await loginAs('manager');
    const { summary } = await adminMockBackend.getAnalytics();
    expect(summary.recentOrders.length).toBeGreaterThan(0);
    expect(summary.topProducts.length).toBeGreaterThan(0);
    expect(summary.revenueSeries30d).toHaveLength(30);
  });
});

describe('adminMockBackend.products', () => {
  it('lists and filters products', async () => {
    await loginAs('manager');
    const all = await adminMockBackend.listProducts({});
    expect(all.items.length).toBeGreaterThan(0);
    const search = await adminMockBackend.listProducts({ q: all.items[0]!.name.slice(0, 4) });
    expect(search.items.some((p) => p.id === all.items[0]!.id)).toBe(true);
  });

  it('manager can create + update; only admin can delete', async () => {
    await loginAs('manager');
    const created = await adminMockBackend.createProduct({
      name: 'Test product',
      sku: 'TEST-1',
      brandId: 'b-aurora',
      primaryCategoryId: 'c-phones',
      description: 'A long enough description for the test fixture.',
      status: 'draft',
      stockStatus: 'in_stock',
      condition: 'new',
      price: { amount: 99, currency: 'USD' },
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
    });
    expect(created.product.id).toBeTruthy();
    await expect(adminMockBackend.deleteProduct(created.product.id)).rejects.toBeInstanceOf(MockApiError);

    await loginAs('admin');
    await expect(adminMockBackend.deleteProduct(created.product.id)).resolves.toBeUndefined();
  });
});

describe('adminMockBackend.orders', () => {
  it('lists orders and supports status updates', async () => {
    await loginAs('manager');
    const { items, total } = await adminMockBackend.listOrders({ perPage: 50 });
    expect(items.length).toBeGreaterThan(0);
    expect(total).toBeGreaterThanOrEqual(items.length);

    const targetId = items[0]!.id;
    const updated = await adminMockBackend.updateOrder(targetId, { status: 'processing' });
    expect(updated.order.status).toBe('processing');
  });

  it('rejects refunds for managers', async () => {
    await loginAs('manager');
    const { items } = await adminMockBackend.listOrders({ perPage: 1 });
    await expect(
      adminMockBackend.refundOrder(items[0]!.id, { reason: 'Test' }),
    ).rejects.toBeInstanceOf(MockApiError);
  });
});

describe('adminMockBackend.coupons', () => {
  it('blocks duplicate codes', async () => {
    await loginAs('admin');
    const { items } = await adminMockBackend.listCoupons({});
    expect(items.length).toBeGreaterThan(0);
    await expect(
      adminMockBackend.createCoupon({
        code: items[0]!.code,
        type: 'percentage',
        value: 5,
        isActive: true,
        stackable: false,
        firstOrderOnly: false,
      }),
    ).rejects.toBeInstanceOf(MockApiError);
  });
});

describe('adminMockBackend.reviews', () => {
  it('shows pending queue and lets managers approve', async () => {
    await loginAs('manager');
    const queue = await adminMockBackend.listReviews({ status: 'pending' });
    expect(queue.items.length).toBeGreaterThan(0);
    const target = queue.items[0]!;
    const moderated = await adminMockBackend.moderateReview(target.id, { status: 'approved' });
    expect(moderated.review.status).toBe('approved');
  });
});

describe('adminMockBackend.customers', () => {
  it('returns customers with lifetime spend', async () => {
    await loginAs('manager');
    const { items } = await adminMockBackend.listCustomers({});
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.lifetimeSpend.amount).toBeGreaterThanOrEqual(0);
  });

  it('admins can change role; customers cannot', async () => {
    await loginAs('admin');
    const { items } = await adminMockBackend.listCustomers({});
    const target = items.find((c) => c.id !== ADMIN_USER.id);
    if (!target) throw new Error('expected another customer');
    const updated = await adminMockBackend.updateCustomer(target.id, { status: 'suspended' });
    expect(updated.customer.status).toBe('suspended');

    await loginAs('customer');
    await expect(
      adminMockBackend.updateCustomer(target.id, { status: 'active' }),
    ).rejects.toBeInstanceOf(MockApiError);
  });
});
