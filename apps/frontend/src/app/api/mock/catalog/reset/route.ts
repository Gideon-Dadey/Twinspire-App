import { NextResponse } from 'next/server';

import { revalidateStorefrontCatalog } from '@/lib/catalog/revalidate-catalog';
import { resetCatalogState } from '@/lib/catalog/server-store';

export async function POST() {
  await resetCatalogState();
  revalidateStorefrontCatalog();
  return NextResponse.json({ ok: true });
}
