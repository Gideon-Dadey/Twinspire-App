import { NextResponse, type NextRequest } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import {
  createBrand,
  listAllBrands,
  listAllProducts,
  replaceCatalogState,
} from '@/lib/catalog/server-store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'SLUG_TAKEN' ? 409 : message === 'BRAND_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ code: message, message }, { status });
}

export async function GET() {
  try {
    const brands = await listAllBrands();
    const products = await listAllProducts();
    const items = brands.map((b) => ({
      ...b,
      productCount: products.filter((p) => p.brandId === b.id).length,
    }));
    return NextResponse.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand = await createBrand(body);
    revalidateStorefrontCatalog();
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { brands?: unknown[] };
    if (!Array.isArray(body.brands)) {
      return NextResponse.json({ message: 'brands array required' }, { status: 400 });
    }
    await replaceCatalogState({
      brands: body.brands as Awaited<ReturnType<typeof listAllBrands>>,
    });
    revalidateStorefrontCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
