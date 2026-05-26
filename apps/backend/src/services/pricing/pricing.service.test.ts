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

  it('returns 0 shipping above any subtotal — Ghana operating model has free delivery', async () => {
    const result = await pricingService.quote({
      currency: 'GHS',
      items: [makeItem(80, 1)],
      couponCodes: [],
    });
    expect(result.shipping).toBe(0);
  });

  it('returns 0 shipping below any subtotal — Ghana operating model has free delivery', async () => {
    // Previously charged a flat rate below the free-shipping threshold; under
    // the Ghana model TwinSpire never charges shipping (in-store stock,
    // phone-coordinated delivery).
    const result = await pricingService.quote({
      currency: 'GHS',
      items: [makeItem(20, 1)],
      couponCodes: [],
    });
    expect(result.shipping).toBe(0);
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
