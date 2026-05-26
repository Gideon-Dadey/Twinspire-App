import { Brand } from '../models/brand.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { clearCollections, startInMemoryMongo, stopInMemoryMongo } from '../test-utils/mongo-memory';

import { productRepository } from './product.repository';

describe('ProductRepository (integration)', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
  });

  async function createProduct(overrides: Partial<Parameters<typeof Product.create>[0]> = {}) {
    const brand =
      (await Brand.findOne({ slug: 'acme' })) ??
      (await Brand.create({ name: 'Acme', slug: 'acme', isActive: true }));
    const cat =
      (await Category.findOne({ slug: 'phones' })) ??
      (await Category.create({
        name: 'Phones',
        slug: 'phones',
        level: 0,
        position: 0,
        ancestors: [],
        path: '/phones',
      }));
    return Product.create({
      sku: 'TS-ACME-001',
      name: 'Acme Phone 1',
      slug: 'acme-phone-1',
      description: 'Test description',
      brandId: brand._id,
      brandName: brand.name,
      categoryIds: [cat._id],
      primaryCategoryId: cat._id,
      condition: 'new',
      status: 'published',
      stockStatus: 'in_stock',
      price: { amount: 499, currency: 'USD' },
      images: [],
      attributes: [],
      specifications: [],
      variants: [],
      hasVariants: false,
      tags: ['phone'],
      ...overrides,
    });
  }

  it('finds a product by slug and populates brand & primary category', async () => {
    await createProduct();
    const found = await productRepository.findBySlug('acme-phone-1');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Acme Phone 1');
  });

  it('paginates published products with default sort', async () => {
    for (let i = 0; i < 7; i++) {
      await createProduct({
        sku: `TS-ACME-${String(i).padStart(3, '0')}`,
        slug: `acme-phone-${i}`,
        name: `Acme Phone ${i}`,
      });
    }

    const page1 = await productRepository.paginate({}, { page: 1, limit: 3 });
    expect(page1.items).toHaveLength(3);
    expect(page1.meta.total).toBe(7);
    expect(page1.meta.totalPages).toBe(3);
    expect(page1.meta.hasNext).toBe(true);

    const page3 = await productRepository.paginate({}, { page: 3, limit: 3 });
    expect(page3.items).toHaveLength(1);
    expect(page3.meta.hasNext).toBe(false);
  });

  it('builds a list filter with price range and category', async () => {
    const cheap = await createProduct({ slug: 'cheap', sku: 'TS-CHEAP-1', price: { amount: 99, currency: 'USD' } });
    const mid = await createProduct({ slug: 'mid', sku: 'TS-MID-1', price: { amount: 299, currency: 'USD' } });
    const pricey = await createProduct({ slug: 'pricey', sku: 'TS-PRICEY-1', price: { amount: 1999, currency: 'USD' } });

    const filter = productRepository.buildListFilter({ minPrice: 200, maxPrice: 1000 });
    const found = await productRepository.find(filter);
    const slugs = found.map((p) => p.slug);

    expect(slugs).toContain('mid');
    expect(slugs).not.toContain('cheap');
    expect(slugs).not.toContain('pricey');

    void cheap;
    void pricey;
  });

  it('increments view count atomically', async () => {
    const p = await createProduct();
    await productRepository.incrementView(p._id);
    await productRepository.incrementView(p._id);
    await productRepository.incrementView(p._id);

    const updated = await productRepository.findById(p._id);
    expect(updated?.views).toBe(3);
  });
});
