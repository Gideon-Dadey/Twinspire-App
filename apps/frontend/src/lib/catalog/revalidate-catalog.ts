import { revalidatePath, revalidateTag } from 'next/cache';

/** Invalidate storefront pages after admin catalog mutations. */
export function revalidateStorefrontCatalog(): void {
  revalidateTag('catalog');
  revalidatePath('/', 'layout');
  revalidatePath('/search');
  revalidatePath('/categories');
  revalidatePath('/brands', 'layout');
  revalidatePath('/products', 'layout');
  revalidatePath('/best-sellers');
  revalidatePath('/new-arrivals');
  revalidatePath('/deals');
}
