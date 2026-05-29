'use client';

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@twinspire/ui';
import { SlidersHorizontal } from 'lucide-react';
import * as React from 'react';

import type { CatalogFacets } from '@/lib/helpers/catalog-query';

import { FiltersPanel } from './filters-panel';

export interface FiltersMobileTriggerProps {
  facets: CatalogFacets;
  basePath: string;
  /** Number of currently-applied filters, shown as a badge on the trigger. */
  appliedCount?: number;
}

/**
 * Mobile-only filter affordance.
 *
 * The original PLP renders `<FiltersPanel />` inline at `lg` and below; that
 * stacks a ~600px tall filter sidebar *above* the product grid on phones,
 * forcing users to scroll past Brand / Price / Rating / Stock controls before
 * they see a single product. Industry standard (Amazon, Jumia, Konga, Apple
 * Shop) is a "Filter" button next to Sort that opens a bottom sheet on
 * mobile — that's what we render here.
 *
 * On `lg+` the parent hides this and renders the panel inline; on mobile the
 * parent hides the inline panel and renders this trigger instead. See the
 * sibling `filters-panel.tsx` for the actual filter logic.
 */
export function FiltersMobileTrigger({
  facets,
  basePath,
  appliedCount = 0,
}: FiltersMobileTriggerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<SlidersHorizontal className="size-4" aria-hidden />}
          className="lg:hidden"
        >
          Filter
          {appliedCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold">
              {appliedCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-border border-b px-4 py-4 sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter products
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {open ? <FiltersPanel facets={facets} basePath={basePath} idPrefix="mobile" /> : null}
        </div>
        <div className="border-border bg-muted/30 border-t px-4 py-3 sm:px-6">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
