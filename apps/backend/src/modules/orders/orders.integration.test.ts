import request from 'supertest';

import { createApp } from '../../app';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import {
  clearCollections,
  startInMemoryMongo,
  stopInMemoryMongo,
} from '../../test-utils/mongo-memory';
import { clearRedisMock, installRedisMock } from '../../test-utils/redis-mock';

interface QuoteEnv {
  success: true;
  data: { quote: { subtotal: number; total: number; itemCount: number; freeShipping: boolean } };
}

interface OrderEnv {
  success: true;
  data: {
    order: {
      orderNumber: string;
      status: string;
      totals: { total: { amount: number } };
      items: { sku: string; quantity: number }[];
    };
    paymentSession: { provider: string; paymentId: string };
  };
}

async function seedProduct(price = 30): Promise<string> {
  const brand = await Brand.findOneAndUpdate(
    { slug: 'orders-brand' },
    { name: 'Orders Brand', slug: 'orders-brand', isActive: true },
    { upsert: true, new: true },
  );
  const category = await Category.findOneAndUpdate(
    { slug: 'orders-cat' },
    {
      name: 'Orders Cat',
      slug: 'orders-cat',
      isActive: true,
      level: 0,
      path: '/orders-cat',
      ancestors: [],
    },
    { upsert: true, new: true },
  );
  const product = await Product.create({
    sku: `SKU-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: 'Order Product',
    slug: `order-product-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    description: 'A product used by the order integration test.',
    brandId: brand!._id,
    brandName: brand!.name,
    categoryIds: [category!._id],
    primaryCategoryId: category!._id,
    condition: 'new',
    status: 'published',
    stockStatus: 'in_stock',
    price: { amount: price, currency: 'USD' },
  });
  return String(product._id);
}

const shippingAddress = {
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+15555550199',
  email: 'jane@example.com',
  line1: '123 Main St',
  city: 'Brooklyn',
  state: 'NY',
  postalCode: '11215',
  country: 'United States',
  countryCode: 'US',
};

describe('Orders integration', () => {
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

  it('returns a quote for the current cart', async () => {
    const productId = await seedProduct(40);
    const agent = request.agent(app);
    await agent.post('/api/v1/cart/items').send({ productId, quantity: 2 });

    const res = await agent.post('/api/v1/orders/quote').send({ shippingAddress });
    expect(res.status).toBe(200);
    const body = res.body as QuoteEnv;
    expect(body.data.quote.subtotal).toBe(80);
    expect(body.data.quote.itemCount).toBe(2);
    expect(body.data.quote.total).toBeGreaterThanOrEqual(80);
  });

  it('places a guest order and clears the cart', async () => {
    const productId = await seedProduct(120);
    const agent = request.agent(app);
    await agent.post('/api/v1/cart/items').send({ productId, quantity: 1 });

    const place = await agent
      .post('/api/v1/orders')
      .send({ shippingAddress, paymentProvider: 'stripe', guestEmail: 'jane@example.com' });
    expect(place.status).toBe(201);
    const body = place.body as OrderEnv;
    expect(body.data.order.orderNumber).toMatch(/[A-Z0-9-]+/);
    expect(body.data.order.items[0]!.quantity).toBe(1);
    expect(body.data.order.totals.total.amount).toBeGreaterThanOrEqual(120);
    expect(body.data.paymentSession.provider).toBe('stripe');

    // Cart should now be empty
    const cart = await agent.get('/api/v1/cart');
    expect(((cart.body as { data: { cart: { items: unknown[] } } }).data.cart.items).length).toBe(0);
  });

  it('rejects placing an order with an empty cart', async () => {
    const agent = request.agent(app);
    const place = await agent
      .post('/api/v1/orders')
      .send({ shippingAddress, paymentProvider: 'stripe', guestEmail: 'jane@example.com' });
    expect(place.status).toBe(400);
  });

  it('requires guest email for guest orders', async () => {
    const productId = await seedProduct();
    const agent = request.agent(app);
    await agent.post('/api/v1/cart/items').send({ productId, quantity: 1 });
    const place = await agent
      .post('/api/v1/orders')
      .send({ shippingAddress, paymentProvider: 'stripe' });
    expect(place.status).toBe(400);
  });
});
