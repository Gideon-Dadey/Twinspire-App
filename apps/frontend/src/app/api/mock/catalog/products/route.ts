import { NextResponse, type NextRequest } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listAllProducts,
  listProductsForAdmin,
  updateProduct,
} from '@/lib/catalog/server-store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'SLUG_TAKEN' ? 409 : message === 'PRODUCT_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ code: message, message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    if (
      sp.has('page') ||
      sp.has('q') ||
      sp.has('status') ||
      sp.has('brandId') ||
      sp.has('categoryId') ||
      sp.has('lowStock')
    ) {
      const result = await listProductsForAdmin({
        page: sp.get('page') ? Number(sp.get('page')) : undefined,
        perPage: sp.get('perPage') ? Number(sp.get('perPage')) : undefined,
        q: sp.get('q') ?? undefined,
        status: (sp.get('status') as 'all' | 'published' | 'draft' | 'archived') ?? undefined,
        brandId: sp.get('brandId') ?? undefined,
        categoryId: sp.get('categoryId') ?? undefined,
        lowStock: sp.get('lowStock') === 'true',
      });
      return NextResponse.json(result);
    }
    const products = await listAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await createProduct(body);
    revalidateStorefrontCatalog();
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { products?: unknown[] };
    if (!Array.isArray(body.products)) {
      return NextResponse.json({ message: 'products array required' }, { status: 400 });
    }
    const { replaceCatalogState } = await import('@/lib/catalog/server-store');
    await replaceCatalogState({
      products: body.products as Awaited<ReturnType<typeof listAllProducts>>,
    });
    revalidateStorefrontCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
