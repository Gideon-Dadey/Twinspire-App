import { Types } from 'mongoose';

import { pricingService } from './pricing.service';
import type { PricingCartItem } from './pricing.types';

const brandId = new Types.ObjectId();
const categoryId = new Types.ObjectId();

function makeItem(amount: number, quantity = 1): PricingCartItem {
  return {
    productId: new Types.ObjectId(),
    unitPriceAmount: amount,
    quantity,
    categoryIds: [categoryId],
    brandId,
  };
}

describe('PricingService.quote', () => {
  it('computes subtotal and item count', async () => {
    const result = await pricingService.quote({
      currency: 'USD',
      items: [makeItem(40, 2), makeItem(10, 1)],
      couponCodes: [],
    });
    expect(result.subtotal).toBe(90);
    expect(result.itemCount).toBe(3);
  });

  it('returns 0 shipping when subtotal meets the free-shipping threshold', async () => {
    // Default FREE_SHIPPING_THRESHOLD is 75
    const result = await pricingService.quote({
      currency: 'USD',
      items: [makeItem(80, 1)],
      couponCodes: [],
    });
    expect(result.shipping).toBe(0);
  });

  it('charges the flat shipping rate below the threshold', async () => {
    const result = await pricingService.quote({
      currency: 'USD',
      items: [makeItem(20, 1)],
      couponCodes: [],
    });
    expect(result.shipping).toBeGreaterThan(0);
  });

  it('rounds totals to two decimals', async () => {
    const result = await pricingService.quote({
      currency: 'USD',
      items: [makeItem(0.1, 3)],
      couponCodes: [],
    });
    // 0.1 * 3 = 0.30000000000000004 → rounded to 0.3
    expect(result.subtotal).toBe(0.3);
  });
});
