'use client';

import type {
  Image as ImageData,
  Product,
  ProductPrice,
  ProductRatingSummary,
} from '@twinspire/types';
import { Heart, ShoppingCart } from 'lucide-react';
import * as React from 'react';

import { AspectRatio } from '../components/aspect-ratio';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { cn } from '../lib/cn';

import { PriceTag } from './price-tag';
import { RatingStars } from './rating-stars';
import { StockBadge } from './stock-badge';

/** Minimal product shape the card needs — keeps Storybook/test data tiny. */
export type ProductCardProduct = Pick<
  Product,
  | 'id'
  | 'name'
  | 'slug'
  | 'sku'
  | 'brandName'
  | 'images'
  | 'price'
  | 'rating'
  | 'stockStatus'
  | 'isNewArrival'
  | 'isBestSeller'
  | 'tags'
>;

export type ProductCardLinkComponent = React.ComponentType<{
  href: string;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}>;

export type ProductCardImageComponent = React.ComponentType<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
}>;

export interface ProductCardProps {
  product: ProductCardProduct;
  href?: string;
  /** Render a Next/Link or plain `<a>`. */
  linkComponent?: ProductCardLinkComponent;
  /** Render Next/Image, a custom CDN image, or fall back to `<img>`. */
  imageComponent?: ProductCardImageComponent;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onAddToCart?: (product: ProductCardProduct) => void;
  onAddToWishlist?: (product: ProductCardProduct) => void;
  inWishlist?: boolean;
  loadingAddToCart?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  /** Currency to fall back to if product.price.currency is missing. */
  currency?: string;
}

const defaultLink: ProductCardLinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const defaultImage: ProductCardImageComponent = (props) => (
  // eslint-disable-next-line jsx-a11y/alt-text
  <img {...props} alt={props.alt} />
);

function pickPrimaryImage(images: ImageData[] | undefined): ImageData | undefined {
  if (!images?.length) return undefined;
  return [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
}

function pickRating(
  rating: ProductRatingSummary | undefined,
): { value: number; count: number } | undefined {
  if (!rating) return undefined;
  return { value: rating.average, count: rating.count };
}

function pickPromoBadge(
  product: ProductCardProduct,
  price: ProductPrice,
): { label: string; sublabel?: string } | null {
  if (price.compareAtAmount && price.compareAtAmount > price.amount) {
    const pct = Math.round(((price.compareAtAmount - price.amount) / price.compareAtAmount) * 100);
    return { label: `-${pct}%`, sublabel: 'Off' };
  }
  if (product.isBestSeller) {
    return { label: 'Best', sublabel: 'Seller' };
  }
  if (product.isNewArrival) {
    return { label: 'New', sublabel: 'Arrival' };
  }
  return null;
}

export function ProductCard({
  product,
  href,
  linkComponent: LinkComp = defaultLink,
  imageComponent: ImgComp = defaultImage,
  size = 'md',
  className,
  onAddToCart,
  onAddToWishlist,
  inWishlist = false,
  loadingAddToCart = false,
  showAddToCart = true,
  showWishlist = true,
}: ProductCardProps): React.JSX.Element {
  const image = pickPrimaryImage(product.images);
  const rating = pickRating(product.rating);
  const linkHref = href ?? `/products/${product.slug}`;
  const price: ProductPrice = product.price;
  const outOfStock = product.stockStatus === 'out_of_stock';
  const promo = pickPromoBadge(product, price);

  const bodyPad = {
    sm: 'px-3 pb-3 pt-2 gap-1',
    md: 'px-3.5 pb-3.5 pt-2.5 gap-1.5',
    lg: 'px-4 pb-4 pt-3 gap-2',
  } as const;

  const imagePad = {
    sm: 'p-2.5',
    md: 'p-4',
    lg: 'p-5',
  } as const;

  // Cards use a square image area — the industry-standard ratio for retail
  // product grids (Amazon, Best Buy, Apple, Newegg). Combined with the
  // absolute hover add-to-cart and the brand → name → price body rhythm,
  // this gives the card real visual weight without bloating the height.
  const aspect = 1;

  return (
    <Card
      data-product-id={product.id}
      className={cn(
        'group/card border-border/70 bg-card duration-moderate relative flex h-full flex-col overflow-hidden rounded-lg border transition-all',
        'hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)]',
        className,
      )}
    >
      {promo && (
        <div
          aria-hidden
          className={cn(
            'text-primary-foreground pointer-events-none absolute left-3 top-3 z-10 flex size-12 flex-col items-center justify-center rounded-full text-center text-[10px] font-semibold uppercase leading-tight tracking-tight shadow-sm',
            'bg-primary',
          )}
        >
          <span className="text-[12px] font-bold leading-none">{promo.label}</span>
          {promo.sublabel && (
            <span className="mt-0.5 text-[8.5px] font-medium opacity-90">{promo.sublabel}</span>
          )}
        </div>
      )}

      {showWishlist && (
        <button
          type="button"
          aria-pressed={inWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => onAddToWishlist?.(product)}
          className={cn(
            'bg-background/70 text-muted-foreground absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-full backdrop-blur transition-colors',
            'hover:bg-background hover:text-foreground focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            inWishlist && 'text-destructive',
          )}
        >
          <Heart
            className={cn('size-4 transition-colors', inWishlist && 'fill-destructive')}
            aria-hidden
          />
        </button>
      )}

      <LinkComp href={linkHref} className="block" aria-label={`View ${product.name}`}>
        <AspectRatio ratio={aspect} className={cn('overflow-hidden bg-white', imagePad[size])}>
          {image ? (
            <ImgComp
              src={image.url}
              alt={image.alt ?? product.name}
              width={image.width ?? 600}
              height={image.height ?? 450}
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="duration-moderate h-full w-full object-contain transition-transform ease-out group-hover/card:scale-[1.04]"
            />
          ) : (
            <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center">
              <span className="text-xs">No image</span>
            </div>
          )}
        </AspectRatio>
      </LinkComp>

      <div
        className={cn(
          'border-border/60 bg-card relative flex flex-1 flex-col border-t',
          bodyPad[size],
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          {product.brandName ? (
            <p className="text-foreground truncate text-[11px] font-semibold uppercase tracking-wide">
              {product.brandName}
            </p>
          ) : (
            <span aria-hidden />
          )}
          {product.sku && (
            <p className="text-muted-foreground/80 shrink-0 truncate text-[10px] font-medium uppercase tracking-wide">
              {product.sku}
            </p>
          )}
        </div>

        <LinkComp
          href={linkHref}
          className="text-foreground hover:text-primary line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug transition-colors"
        >
          {product.name}
        </LinkComp>

        {rating && rating.count > 0 && (
          <RatingStars value={rating.value} count={rating.count} size="xs" className="mt-0.5" />
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceTag price={price} size={size === 'sm' ? 'md' : 'lg'} tone="primary" />
          {product.stockStatus !== 'in_stock' && (
            <StockBadge status={product.stockStatus} size="sm" className="mb-0.5 shrink-0" />
          )}
        </div>

        {showAddToCart && (
          <div
            className={cn(
              'duration-fast absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all',
              'group-hover/card:translate-y-0 group-hover/card:opacity-100',
              'group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100',
              outOfStock && 'translate-y-0 opacity-100',
            )}
          >
            <Button
              type="button"
              variant={outOfStock ? 'outline' : 'default'}
              size="sm"
              disabled={outOfStock}
              loading={loadingAddToCart}
              leftIcon={<ShoppingCart aria-hidden />}
              onClick={() => onAddToCart?.(product)}
              className="w-full shadow-md"
            >
              {outOfStock ? 'Notify me' : 'Add to cart'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
