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

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: { pagination?: { total: number; page: number } };
}

async function seedCatalog(): Promise<{ brandId: string; categoryId: string; productIds: string[] }> {
  const brand = await Brand.create({
    name: 'Acme',
    slug: 'acme',
    description: 'Premium gear',
    isActive: true,
  });
  const category = await Category.create({
    name: 'Audio',
    slug: 'audio',
    isActive: true,
    level: 0,
    path: '/audio',
    ancestors: [],
  });

  const productIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const p = await Product.create({
      sku: `SKU-${i}-CAT`,
      name: `Headphones ${i}`,
      slug: `headphones-${i}-cat`,
      description: 'Great sound quality and excellent battery life.',
      brandId: brand._id,
      brandName: brand.name,
      categoryIds: [category._id],
      primaryCategoryId: category._id,
      condition: 'new',
      status: 'published',
      stockStatus: 'in_stock',
      price: { amount: 100 + i * 10, currency: 'USD' },
      tags: ['audio', 'wireless'],
    });
    productIds.push(String(p._id));
  }
  return { brandId: String(brand._id), categoryId: String(category._id), productIds };
}

describe('Catalog integration', () => {
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

  it('lists published products with facets', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/catalog/products');
    expect(res.status).toBe(200);
    const body = res.body as SuccessEnvelope<{ items: unknown[]; facets: { brands: unknown[] } }>;
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(3);
    expect(body.data.facets.brands.length).toBeGreaterThan(0);
    expect(body.meta?.pagination?.total).toBe(3);
  });

  it('supports filtering by category slug', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/catalog/products?category=audio');
    expect(res.status).toBe(200);
    const body = res.body as SuccessEnvelope<{ items: unknown[] }>;
    expect(body.data.items).toHaveLength(3);
  });

  it('supports price filtering', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/catalog/products?minPrice=105&maxPrice=119');
    const body = res.body as SuccessEnvelope<{ items: { price: { amount: number } }[] }>;
    expect(res.status).toBe(200);
    expect(body.data.items.every((p) => p.price.amount >= 105 && p.price.amount <= 119)).toBe(true);
  });

  it('returns 404 for unknown product slug', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/catalog/products/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('returns product details by slug and related products', async () => {
    await seedCatalog();
    const detail = await request(app).get('/api/v1/catalog/products/headphones-0-cat');
    expect(detail.status).toBe(200);
    const detailBody = detail.body as SuccessEnvelope<{ product: { name: string; slug: string } }>;
    expect(detailBody.data.product.slug).toBe('headphones-0-cat');

    const related = await request(app).get('/api/v1/catalog/products/headphones-0-cat/related');
    expect(related.status).toBe(200);
    const relatedBody = related.body as SuccessEnvelope<{ items: { slug: string }[] }>;
    expect(relatedBody.data.items.length).toBeGreaterThan(0);
    expect(relatedBody.data.items.every((p) => p.slug !== 'headphones-0-cat')).toBe(true);
  });

  it('returns the category tree', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/catalog/categories');
    expect(res.status).toBe(200);
    const body = res.body as SuccessEnvelope<{ tree: unknown[] }>;
    expect(body.data.tree.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated admin product creation', async () => {
    const res = await request(app).post('/api/v1/catalog/admin/products').send({});
    expect(res.status).toBe(401);
  });
});
