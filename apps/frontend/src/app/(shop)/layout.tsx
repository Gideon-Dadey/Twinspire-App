import { type ReactNode } from 'react';

import { CartDrawer } from '@/components/layout/cart-drawer';
import { SiteFooter } from '@/components/layout/footer';
import { SiteHeader } from '@/components/layout/header';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
