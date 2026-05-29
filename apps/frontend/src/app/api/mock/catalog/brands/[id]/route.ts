import { NextResponse, type NextRequest } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import { deleteBrand, updateBrand } from '@/lib/catalog/server-store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'BRAND_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ code: message, message }, { status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const brand = await updateBrand(id, body);
    revalidateStorefrontCatalog();
    return NextResponse.json({ brand });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteBrand(id);
    revalidateStorefrontCatalog();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
