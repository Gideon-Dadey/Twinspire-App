import { NextResponse, type NextRequest } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import {
  createCategory,
  listAllCategories,
  listAllProducts,
  replaceCatalogState,
} from '@/lib/catalog/server-store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'SLUG_TAKEN' ? 409 : message === 'CATEGORY_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ code: message, message }, { status });
}

export async function GET() {
  try {
    const categories = await listAllCategories();
    const products = await listAllProducts();
    const items = categories.map((c) => ({
      ...c,
      productCount: products.filter(
        (p) => p.categoryIds.includes(c.id) || p.primaryCategoryId === c.id,
      ).length,
    }));
    return NextResponse.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await createCategory(body);
    revalidateStorefrontCatalog();
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { categories?: unknown[] };
    if (!Array.isArray(body.categories)) {
      return NextResponse.json({ message: 'categories array required' }, { status: 400 });
    }
    await replaceCatalogState({
      categories: body.categories as Awaited<ReturnType<typeof listAllCategories>>,
    });
    revalidateStorefrontCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
