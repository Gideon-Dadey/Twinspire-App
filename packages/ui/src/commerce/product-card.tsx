'use client';

import type { Image as ImageData, Product, ProductPrice, ProductRatingSummary } from '@twinspire/types';
import { Heart, ShoppingCart } from 'lucide-react';
import * as React from 'react';

import { AspectRatio } from '../components/aspect-ratio';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { cn } from '../lib/cn';

import { PriceTag } from './price-tag';
import { RatingStars } from './rating-stars';
import { StockBadge } from './stock-badge';

/** Minimal product shape the card needs — keeps Storybook/test data tiny. */
export type ProductCardProduct = Pick<
  Product,
  'id' | 'name' | 'slug' | 'brandName' | 'images' | 'price' | 'rating' | 'stockStatus' | 'isNewArrival' | 'isBestSeller' | 'tags'
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

function pickRating(rating: ProductRatingSummary | undefined): { value: number; count: number } | undefined {
  if (!rating) return undefined;
  return { value: rating.average, count: rating.count };
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

  const paddings = {
    sm: 'p-3 gap-2',
    md: 'p-4 gap-3',
    lg: 'p-5 gap-3',
  } as const;

  return (
    <Card
      data-product-id={product.id}
      className={cn(
        'group/card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all',
        'hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      <div className="relative">
        <LinkComp href={linkHref} className="block" aria-label={`View ${product.name}`}>
          <AspectRatio ratio={4 / 5} className="overflow-hidden bg-muted">
            {image ? (
              <ImgComp
                src={image.url}
                alt={image.alt ?? product.name}
                width={image.width ?? 600}
                height={image.height ?? 750}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="h-full w-full object-cover transition-transform duration-moderate ease-out group-hover/card:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-card text-muted-foreground/40">
                <span className="text-xs">No image</span>
              </div>
            )}
          </AspectRatio>
        </LinkComp>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {product.isNewArrival && (
            <Badge variant="info" size="sm" className="pointer-events-auto">
              New
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge variant="accent" size="sm" className="pointer-events-auto">
              Best seller
            </Badge>
          )}
          {price.compareAtAmount && price.compareAtAmount > price.amount && (
            <Badge variant="destructive" size="sm" className="pointer-events-auto">
              Sale
            </Badge>
          )}
        </div>

        {showWishlist && (
          <Button
            variant="secondary"
            size="icon-sm"
            rounded="full"
            type="button"
            aria-pressed={inWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => onAddToWishlist?.(product)}
            className={cn(
              'absolute right-2 top-2 bg-background/80 text-foreground shadow-sm backdrop-blur',
              'opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100',
              inWishlist && 'opacity-100',
            )}
          >
            <Heart
              className={cn('size-4 transition-colors', inWishlist && 'fill-destructive text-destructive')}
              aria-hidden
            />
          </Button>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col', paddings[size])}>
        {product.brandName && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brandName}
          </p>
        )}
        <LinkComp
          href={linkHref}
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </LinkComp>

        {rating && rating.count > 0 && (
          <RatingStars value={rating.value} count={rating.count} size="xs" />
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag price={price} size={size === 'lg' ? 'lg' : 'md'} />
          <StockBadge status={product.stockStatus} size="sm" className="shrink-0" />
        </div>

        {showAddToCart && (
          <Button
            type="button"
            variant={outOfStock ? 'outline' : 'default'}
            size="sm"
            disabled={outOfStock}
            loading={loadingAddToCart}
            leftIcon={<ShoppingCart aria-hidden />}
            onClick={() => onAddToCart?.(product)}
            className="mt-2 w-full"
          >
            {outOfStock ? 'Notify me' : 'Add to cart'}
          </Button>
        )}
      </div>
    </Card>
  );
}
