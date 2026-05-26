import 'dotenv/config';

import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

import { slugify } from '@twinspire/utils';

import { logger } from '../config/logger';
import { connectDatabase, disconnectDatabase } from '../db';
import {
  Banner,
  Brand,
  Campaign,
  Category,
  Coupon,
  Faq,
  Permission,
  Product,
  Role,
  User,
  type BrandDocument,
  type CategoryDocument,
  type ProductDoc,
} from '../models';

import {
  BRAND_FIXTURES,
  CATEGORY_FIXTURES,
  COUPON_FIXTURES,
  FAQ_FIXTURES,
  PRODUCT_TEMPLATES,
  type ProductCategorySlug,
} from './_lib/fixtures';

const log = logger.child({ component: 'seed' });

faker.seed(20260101);

interface Stats {
  permissions: number;
  roles: number;
  users: number;
  brands: number;
  categories: number;
  products: number;
  coupons: number;
  campaigns: number;
  banners: number;
  faqs: number;
}

async function seedPermissionsAndRoles(): Promise<void> {
  const permissions = [
    { key: 'products:read', resource: 'products', action: 'read', isSystem: true },
    { key: 'products:write', resource: 'products', action: 'write', isSystem: true },
    { key: 'products:delete', resource: 'products', action: 'delete', isSystem: true },
    { key: 'orders:read', resource: 'orders', action: 'read', isSystem: true },
    { key: 'orders:write', resource: 'orders', action: 'write', isSystem: true },
    { key: 'orders:refund', resource: 'orders', action: 'refund', isSystem: true },
    { key: 'inventory:write', resource: 'inventory', action: 'write', isSystem: true },
    { key: 'coupons:write', resource: 'coupons', action: 'write', isSystem: true },
    { key: 'users:read', resource: 'users', action: 'read', isSystem: true },
    { key: 'users:write', resource: 'users', action: 'write', isSystem: true },
    { key: 'analytics:read', resource: 'analytics', action: 'read', isSystem: true },
    { key: 'settings:write', resource: 'settings', action: 'write', isSystem: true },
    { key: 'audit:read', resource: 'audit', action: 'read', isSystem: true },
    { key: 'reviews:moderate', resource: 'reviews', action: 'moderate', isSystem: true },
    { key: 'tickets:respond', resource: 'tickets', action: 'respond', isSystem: true },
    { key: 'tickets:assign', resource: 'tickets', action: 'assign', isSystem: true },
  ];

  await Permission.insertMany(permissions, { ordered: false }).catch(() => undefined);
  const permDocs = await Permission.find({ key: { $in: permissions.map((p) => p.key) } }).lean();

  const permByKey = new Map(permDocs.map((p) => [p.key, p._id as Types.ObjectId]));

  const allPerms = Array.from(permByKey.values());

  const pickPerms = (keys: string[]): Types.ObjectId[] =>
    keys.map((k) => permByKey.get(k)).filter((v): v is Types.ObjectId => Boolean(v));

  const managerExcluded = new Set(['users:write', 'settings:write', 'audit:read']);

  const roles = [
    { name: 'Customer', slug: 'customer', permissionIds: [], isSystem: true, rank: 0 },
    {
      name: 'Support Agent',
      slug: 'support',
      permissionIds: pickPerms(['orders:read', 'tickets:respond', 'users:read']),
      isSystem: true,
      rank: 10,
    },
    {
      name: 'Staff',
      slug: 'staff',
      permissionIds: pickPerms([
        'products:read',
        'orders:read',
        'inventory:write',
        'reviews:moderate',
      ]),
      isSystem: true,
      rank: 20,
    },
    {
      name: 'Manager',
      slug: 'manager',
      permissionIds: permDocs
        .filter((p) => !managerExcluded.has(p.key))
        .map((p) => p._id as Types.ObjectId),
      isSystem: true,
      rank: 30,
    },
    { name: 'Admin', slug: 'admin', permissionIds: allPerms, isSystem: true, rank: 40 },
  ];

  await Role.insertMany(roles, { ordered: false }).catch(() => undefined);
}

async function seedUsers(): Promise<number> {
  const seed: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password: string;
  }[] = [
    {
      email: 'admin@twinspire.dev',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 'admin',
      password: 'AdminPass!234',
    },
    {
      email: 'manager@twinspire.dev',
      firstName: 'Grace',
      lastName: 'Hopper',
      role: 'manager',
      password: 'ManagerPass!234',
    },
    {
      email: 'support@twinspire.dev',
      firstName: 'Alan',
      lastName: 'Turing',
      role: 'support',
      password: 'SupportPass!234',
    },
    {
      email: 'staff@twinspire.dev',
      firstName: 'Linus',
      lastName: 'Torvalds',
      role: 'staff',
      password: 'StaffPass!234',
    },
  ];

  for (let i = 0; i < 46; i++) {
    seed.push({
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'customer',
      password: 'CustomerPass!234',
    });
  }

  for (const s of seed) {
    const user = new User({
      email: s.email,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      status: 'active',
      emailVerifiedAt: new Date(),
      preferences: {
        locale: 'en-GH',
        currency: 'GHS',
        theme: 'system',
        marketingOptIn: false,
        newsletter: true,
      },
    });
    await user.setPassword(s.password);
    await user.save();
  }

  return seed.length;
}

async function seedBrands(): Promise<BrandDocument[]> {
  const docs: BrandDocument[] = [];
  for (const fixture of BRAND_FIXTURES) {
    const doc = await Brand.create({
      name: fixture.name,
      slug: fixture.slug,
      description: fixture.description,
      countryOfOrigin: fixture.countryOfOrigin,
      foundedYear: fixture.foundedYear,
      isFeatured: fixture.isFeatured,
      isActive: true,
      logo: {
        url: `https://cdn.twinspire.dev/brands/${fixture.slug}/logo.png`,
        alt: `${fixture.name} logo`,
      },
      seo: { title: fixture.name, description: fixture.description },
    });
    docs.push(doc);
  }
  return docs;
}

async function seedCategories(): Promise<Map<string, CategoryDocument>> {
  const bySlug = new Map<string, CategoryDocument>();
  let rootPosition = 0;

  for (const root of CATEGORY_FIXTURES) {
    const rootDoc = await Category.create({
      name: root.name,
      slug: root.slug,
      description: root.description,
      icon: root.icon,
      parentId: null,
      ancestors: [],
      level: 0,
      path: `/${root.slug}`,
      position: rootPosition++,
      isFeatured: root.isFeatured,
      isActive: true,
      seo: { title: root.name, description: root.description },
    });
    bySlug.set(root.slug, rootDoc);

    let childPosition = 0;
    for (const child of root.children ?? []) {
      const childDoc = await Category.create({
        name: child.name,
        slug: child.slug,
        description: child.description,
        icon: child.icon,
        parentId: rootDoc._id,
        ancestors: [rootDoc._id],
        level: 1,
        path: `/${root.slug}/${child.slug}`,
        position: childPosition++,
        isFeatured: child.isFeatured,
        isActive: true,
      });
      bySlug.set(child.slug, childDoc);
    }
  }
  return bySlug;
}

async function seedProducts(
  categories: Map<string, CategoryDocument>,
  brands: BrandDocument[],
): Promise<number> {
  const brandsBySlug = new Map(brands.map((b) => [b.slug, b]));
  let total = 0;
  let skuCounter = 0;

  for (const [categorySlug, templates] of Object.entries(PRODUCT_TEMPLATES) as [
    ProductCategorySlug,
    (typeof PRODUCT_TEMPLATES)[ProductCategorySlug],
  ][]) {
    const primaryCategory = categories.get(categorySlug);
    if (!primaryCategory) continue;

    for (const template of templates) {
      const brand = brandsBySlug.get(template.brand);
      if (!brand) continue;

      const colors = ['Black', 'Silver', 'Blue', 'Graphite', 'White'] as const;
      const storages = ['128GB', '256GB', '512GB', '1TB', '2TB'] as const;
      const variants = Math.floor(Math.random() * 3) + 2;
      for (let v = 0; v < variants; v++) {
        const variantSuffix = colors[v % colors.length] ?? 'Black';
        const storage = storages[v % storages.length] ?? '256GB';
        const name = `${template.base} ${storage} ${variantSuffix}`;
        const slug = slugify(name);
        skuCounter += 1;
        const sku = `TS-${brand.slug.toUpperCase()}-${skuCounter.toString().padStart(5, '0')}`;
        const basePrice = Math.round(template.min + Math.random() * (template.max - template.min));
        const hasDiscount = Math.random() > 0.55;
        const compareAt = hasDiscount
          ? Math.round(basePrice * (1 + Math.random() * 0.25 + 0.1))
          : undefined;

        const stock = Math.floor(Math.random() * 80) + 5;
        const stockStatus: ProductDoc['stockStatus'] =
          stock === 0 ? 'out_of_stock' : stock < 5 ? 'low_stock' : 'in_stock';

        await Product.create({
          sku,
          name,
          slug,
          shortDescription: `${template.base} — premium ${primaryCategory.name.toLowerCase()} from ${brand.name}.`,
          description:
            `Experience the ${template.base} with ${storage} of storage. ` +
            `Built by ${brand.name} for users who demand uncompromising performance, ` +
            `industry-leading design, and the latest connectivity. ` +
            `Backed by TwinSpire's authenticity guarantee and full manufacturer warranty.`,
          brandId: brand._id,
          brandName: brand.name,
          categoryIds: [primaryCategory._id],
          primaryCategoryId: primaryCategory._id,
          tags: [brand.slug, primaryCategory.slug, slugify(template.base)],
          condition: 'new',
          status: 'published',
          stockStatus,
          price: {
            amount: basePrice,
            compareAtAmount: compareAt,
            currency: 'GHS',
            discountPercent: compareAt
              ? Math.round(((compareAt - basePrice) / compareAt) * 100)
              : undefined,
            taxRate: 8,
          },
          images: [
            {
              url: `https://cdn.twinspire.dev/products/${slug}/01.webp`,
              alt: `${name} primary image`,
              width: 1600,
              height: 1600,
              position: 0,
            },
            {
              url: `https://cdn.twinspire.dev/products/${slug}/02.webp`,
              alt: `${name} angle view`,
              width: 1600,
              height: 1600,
              position: 1,
            },
          ],
          attributes: [
            { name: 'Storage', slug: 'storage', value: storage },
            { name: 'Color', slug: 'color', value: variantSuffix },
          ],
          specifications: [
            { group: 'General', key: 'Brand', value: brand.name },
            { group: 'General', key: 'Model', value: template.base },
            { group: 'General', key: 'Color', value: variantSuffix },
            { group: 'Storage', key: 'Capacity', value: storage },
          ],
          variants: [],
          hasVariants: false,
          weight: { value: 1.5, unit: 'kg' },
          dimensions: { length: 25, width: 18, height: 2, unit: 'cm' },
          warranty: { months: 12, description: 'Manufacturer warranty included.' },
          shipping: { freeShipping: true, handlingDays: 1 },
          rating: {
            average: Math.round((4 + Math.random()) * 10) / 10,
            count: Math.floor(Math.random() * 500),
            distribution: { 1: 1, 2: 2, 3: 5, 4: 20, 5: 70 },
          },
          isFeatured: Math.random() > 0.7,
          isBestSeller: Math.random() > 0.85,
          isNewArrival: Math.random() > 0.7,
          releaseDate: faker.date.recent({ days: 365 }),
          seo: { title: name, description: `Buy ${name} at TwinSpire.` },
          views: Math.floor(Math.random() * 5000),
          salesCount: Math.floor(Math.random() * 200),
        });
        total++;
      }
    }
  }

  return total;
}

async function seedCoupons(): Promise<number> {
  const now = new Date();
  for (const c of COUPON_FIXTURES) {
    await Coupon.create({
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      currency: c.type === 'fixed' ? 'GHS' : undefined,
      startsAt: now,
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60_000),
      isActive: true,
      stackable: false,
      firstOrderOnly: c.code === 'WELCOME10',
    });
  }
  return COUPON_FIXTURES.length;
}

async function seedCampaignsAndBanners(): Promise<{ campaigns: number; banners: number }> {
  const campaign = await Campaign.create({
    name: 'Black Friday 2026',
    slug: 'black-friday-2026',
    type: 'holiday',
    description: 'Our biggest sale of the year.',
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 14 * 24 * 60 * 60_000),
    isActive: true,
    priority: 100,
    badgeText: 'Black Friday',
    badgeColor: '#000000',
    seo: { title: 'Black Friday 2026 at TwinSpire', description: 'Save big on electronics.' },
  });

  await Banner.create({
    title: 'Black Friday is here.',
    subtitle: 'Up to 40% off everything.',
    ctaLabel: 'Shop now',
    ctaUrl: '/deals',
    placement: 'home_hero',
    desktopImage: {
      url: 'https://cdn.twinspire.dev/banners/bf26-desktop.webp',
      alt: 'Black Friday banner',
      width: 2880,
      height: 1080,
    },
    mobileImage: {
      url: 'https://cdn.twinspire.dev/banners/bf26-mobile.webp',
      alt: 'Black Friday banner mobile',
      width: 1080,
      height: 1620,
    },
    backgroundColor: '#E91B25',
    textColor: '#FFFFFF',
    campaignId: campaign._id,
    priority: 10,
    isActive: true,
    audience: 'all',
    impressions: 0,
    clicks: 0,
  });

  return { campaigns: 1, banners: 1 };
}

async function seedFaqs(): Promise<number> {
  let position = 0;
  for (const f of FAQ_FIXTURES) {
    await Faq.create({
      question: f.question,
      answer: f.answer,
      categorySlug: f.category,
      position: position++,
      isActive: true,
      tags: [f.category],
    });
  }
  return FAQ_FIXTURES.length;
}

async function main(): Promise<void> {
  log.info('Starting seed');
  await connectDatabase();

  log.info('Dropping existing seed collections');
  await Promise.all([
    Permission.deleteMany({}, { withDeleted: true }).exec(),
    Role.deleteMany({}, { withDeleted: true }).exec(),
    User.deleteMany({}, { withDeleted: true }).exec(),
    Brand.deleteMany({}, { withDeleted: true }).exec(),
    Category.deleteMany({}, { withDeleted: true }).exec(),
    Product.deleteMany({}, { withDeleted: true }).exec(),
    Coupon.deleteMany({}, { withDeleted: true }).exec(),
    Campaign.deleteMany({}, { withDeleted: true }).exec(),
    Banner.deleteMany({}, { withDeleted: true }).exec(),
    Faq.deleteMany({}, { withDeleted: true }).exec(),
  ]);

  const stats: Stats = {
    permissions: 0,
    roles: 0,
    users: 0,
    brands: 0,
    categories: 0,
    products: 0,
    coupons: 0,
    campaigns: 0,
    banners: 0,
    faqs: 0,
  };

  await seedPermissionsAndRoles();
  stats.permissions = await Permission.countDocuments();
  stats.roles = await Role.countDocuments();

  log.info('Seeding users');
  stats.users = await seedUsers();

  log.info('Seeding brands');
  const brands = await seedBrands();
  stats.brands = brands.length;

  log.info('Seeding categories');
  const categories = await seedCategories();
  stats.categories = categories.size;

  log.info('Seeding products');
  stats.products = await seedProducts(categories, brands);

  log.info('Seeding coupons');
  stats.coupons = await seedCoupons();

  log.info('Seeding campaigns & banners');
  const cb = await seedCampaignsAndBanners();
  stats.campaigns = cb.campaigns;
  stats.banners = cb.banners;

  log.info('Seeding FAQs');
  stats.faqs = await seedFaqs();

  log.info({ stats }, 'Seed complete');
  await disconnectDatabase();
}

main().catch(async (err: unknown) => {
  log.error({ err }, 'Seed failed');
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
