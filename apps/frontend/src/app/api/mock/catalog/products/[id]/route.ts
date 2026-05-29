import { NextResponse, type NextRequest } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import { deleteProduct, getProductById, updateProduct } from '@/lib/catalog/server-store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'PRODUCT_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ code: message, message }, { status });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ product });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const product = await updateProduct(id, body);
    revalidateStorefrontCatalog();
    return NextResponse.json({ product });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteProduct(id);
    revalidateStorefrontCatalog();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
