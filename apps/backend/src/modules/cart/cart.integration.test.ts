import request from 'supertest';

import { createApp } from '../../app';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';
import { Coupon } from '../../models/coupon.model';
import { Product } from '../../models/product.model';
import {
  clearCollections,
  startInMemoryMongo,
  stopInMemoryMongo,
} from '../../test-utils/mongo-memory';
import { clearRedisMock, installRedisMock } from '../../test-utils/redis-mock';

interface CartEnv {
  success: true;
  data: {
    cart: {
      items: { _id: string; productId: string; quantity: number; lineTotal: { amount: number } }[];
      totals: {
        subtotal: { amount: number };
        discount: { amount: number };
        total: { amount: number };
        itemCount: number;
      };
      couponCodes: string[];
    };
  };
}

async function seedProduct(): Promise<string> {
  const brand = await Brand.findOneAndUpdate(
    { slug: 'cart-brand' },
    { name: 'Cart Brand', slug: 'cart-brand', isActive: true },
    { upsert: true, new: true },
  );
  const category = await Category.findOneAndUpdate(
    { slug: 'cart-cat' },
    {
      name: 'Cart Cat',
      slug: 'cart-cat',
      isActive: true,
      level: 0,
      path: '/cart-cat',
      ancestors: [],
    },
    { upsert: true, new: true },
  );
  const product = await Product.create({
    sku: `SKU-CART-${Date.now()}`,
    name: 'Cart Product',
    slug: `cart-product-${Date.now()}`,
    description: 'A product used by the cart integration test.',
    brandId: brand!._id,
    brandName: brand!.name,
    categoryIds: [category!._id],
    primaryCategoryId: category!._id,
    condition: 'new',
    status: 'published',
    stockStatus: 'in_stock',
    price: { amount: 50, currency: 'USD' },
  });
  return String(product._id);
}

describe('Cart integration', () => {
  const app = createApp();
  let redis: ReturnType<typeof installRedisMock>;

  beforeAll(async () => {
    await startInMemoryMongo();
    redis = installRedisMock();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
    await clearRedisMock(redis);
  });

  it('creates a guest cart and adds an item', async () => {
    const productId = await seedProduct();
    const agent = request.agent(app);

    const res = await agent.post('/api/v1/cart/items').send({ productId, quantity: 2 });
    expect(res.status).toBe(201);
    const body = res.body as CartEnv;
    expect(body.data.cart.items).toHaveLength(1);
    expect(body.data.cart.items[0]!.quantity).toBe(2);
    expect(body.data.cart.totals.itemCount).toBe(2);
    expect(body.data.cart.totals.subtotal.amount).toBe(100);
  });

  it('updates and removes cart items', async () => {
    const productId = await seedProduct();
    const agent = request.agent(app);
    const add = await agent.post('/api/v1/cart/items').send({ productId, quantity: 1 });
    const itemId = (add.body as CartEnv).data.cart.items[0]!._id;

    const update = await agent.patch(`/api/v1/cart/items/${itemId}`).send({ quantity: 3 });
    expect(update.status).toBe(200);
    expect((update.body as CartEnv).data.cart.items[0]!.quantity).toBe(3);

    const remove = await agent.delete(`/api/v1/cart/items/${itemId}`);
    expect(remove.status).toBe(200);
    expect((remove.body as CartEnv).data.cart.items).toHaveLength(0);
  });

  it('applies a percentage coupon to the cart', async () => {
    const productId = await seedProduct();
    await Coupon.create({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
      isActive: true,
      startsAt: new Date(Date.now() - 60_000),
      stackable: false,
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/cart/items').send({ productId, quantity: 2 });

    const apply = await agent.post('/api/v1/cart/coupons').send({ code: 'SAVE10' });
    expect(apply.status).toBe(200);
    const body = apply.body as CartEnv;
    expect(body.data.cart.couponCodes).toContain('SAVE10');
    expect(body.data.cart.totals.discount.amount).toBeCloseTo(10);
  });

  it('rejects expired coupons', async () => {
    const productId = await seedProduct();
    await Coupon.create({
      code: 'EXPIRED',
      type: 'percentage',
      value: 25,
      isActive: true,
      startsAt: new Date(Date.now() - 2 * 60_000),
      expiresAt: new Date(Date.now() - 60_000),
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/cart/items').send({ productId, quantity: 1 });

    const apply = await agent.post('/api/v1/cart/coupons').send({ code: 'EXPIRED' });
    expect(apply.status).toBe(400);
  });
});
