/**
 * Smoke tests for the mock backend used during Phase 7. Keep these
 * fast and self-contained — they're the safety net that lets us flip
 * `NEXT_PUBLIC_USE_MOCK_API` between the mock and the real backend
 * without worrying about contract drift.
 */

import { mockBackend, MockApiError } from './mock-backend';
import { DEMO_PASSWORD } from './mock-data';

beforeEach(() => {
  window.localStorage.clear();
});

describe('mockBackend.auth', () => {
  it('rejects bad credentials', async () => {
    await expect(
      mockBackend.login({ email: 'demo@twinspire.dev', password: 'wrong' }),
    ).rejects.toBeInstanceOf(MockApiError);
  });

  it('returns the demo session for the seeded user', async () => {
    const session = await mockBackend.login({
      email: 'demo@twinspire.dev',
      password: DEMO_PASSWORD,
    });
    expect(session.user.email).toBe('demo@twinspire.dev');
    expect(session.accessToken).toMatch(/mock\.access/);
  });

  it('me() succeeds after login', async () => {
    await mockBackend.login({ email: 'demo@twinspire.dev', password: DEMO_PASSWORD });
    const result = await mockBackend.me();
    expect(result.user.email).toBe('demo@twinspire.dev');
  });

  it('me() throws when there is no session', async () => {
    await expect(mockBackend.me()).rejects.toBeInstanceOf(MockApiError);
  });

  it('register stores the user and lets us log in', async () => {
    const registered = await mockBackend.register({
      firstName: 'New',
      lastName: 'User',
      email: 'new@twinspire.dev',
      password: 'SuperSecret!2026',
    });
    expect(registered.user.email).toBe('new@twinspire.dev');
    const session = await mockBackend.login({
      email: 'new@twinspire.dev',
      password: 'SuperSecret!2026',
    });
    expect(session.user.email).toBe('new@twinspire.dev');
  });
});

describe('mockBackend.users + orders + wishlist', () => {
  beforeEach(async () => {
    await mockBackend.login({ email: 'demo@twinspire.dev', password: DEMO_PASSWORD });
  });

  it('lists seeded addresses with one default', async () => {
    const { addresses } = await mockBackend.listAddresses();
    expect(addresses.length).toBeGreaterThanOrEqual(1);
    expect(addresses.filter((a) => a.isDefault).length).toBe(1);
  });

  it('lists seeded orders', async () => {
    const result = await mockBackend.listOrders();
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items[0]?.orderNumber).toMatch(/^TS-/);
  });

  it('toggles wishlist items', async () => {
    const initial = await mockBackend.getWishlist();
    const sample = initial.items[0]?.productId;
    if (!sample) throw new Error('Demo wishlist should be seeded');
    await mockBackend.removeWishlistItem(sample);
    const afterRemove = await mockBackend.getWishlist();
    expect(afterRemove.items.some((i) => i.productId === sample)).toBe(false);
    await mockBackend.addWishlistItem(sample);
    const afterAdd = await mockBackend.getWishlist();
    expect(afterAdd.items.some((i) => i.productId === sample)).toBe(true);
  });

  it('promotes an address to default', async () => {
    const { addresses } = await mockBackend.listAddresses();
    const nonDefault = addresses.find((a) => !a.isDefault);
    if (!nonDefault) throw new Error('Need a non-default address to test promotion');
    await mockBackend.setDefaultAddress(nonDefault.id);
    const after = await mockBackend.listAddresses();
    const promoted = after.addresses.find((a) => a.id === nonDefault.id);
    expect(promoted?.isDefault).toBe(true);
    expect(after.addresses.filter((a) => a.isDefault).length).toBe(1);
  });
});
