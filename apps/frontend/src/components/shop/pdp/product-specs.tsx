import type { ProductSpecification } from '@twinspire/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@twinspire/ui';

export interface ProductSpecsProps {
  specifications: ProductSpecification[];
}

interface SpecGroup {
  group: string;
  items: ProductSpecification[];
}

function groupSpecs(specifications: ProductSpecification[]): SpecGroup[] {
  const map = new Map<string, ProductSpecification[]>();
  specifications.forEach((spec) => {
    if (!map.has(spec.group)) map.set(spec.group, []);
    map.get(spec.group)?.push(spec);
  });
  return [...map.entries()].map(([group, items]) => ({
    group,
    items: items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  }));
}

export function ProductSpecs({ specifications }: ProductSpecsProps) {
  const grouped = groupSpecs(specifications);
  if (grouped.length === 0) return null;
  return (
    <Accordion type="multiple" defaultValue={grouped.map((g) => g.group)} className="rounded-lg border border-border bg-card">
      {grouped.map((group) => (
        <AccordionItem key={group.group} value={group.group} className="border-b border-border last:border-b-0">
          <AccordionTrigger className="px-5 py-4 text-sm font-semibold uppercase tracking-wide">
            {group.group}
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {group.items.map((item, idx) => (
                <div
                  key={`${group.group}-${item.key}-${idx}`}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3 sm:border-b sm:border-dashed sm:border-border sm:pb-1"
                >
                  <dt className="text-muted-foreground">{item.key}</dt>
                  <dd className="font-medium text-foreground sm:ml-auto sm:text-right">{item.value}</dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
