import { NextResponse } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';

export async function POST() {
  revalidateStorefrontCatalog();
  return NextResponse.json({ ok: true });
}
