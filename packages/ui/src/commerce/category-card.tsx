'use client';

import { ArrowUpRight } from 'lucide-react';
import * as React from 'react';

import { AspectRatio } from '../components/aspect-ratio';
import { cn } from '../lib/cn';

export type CategoryCardLinkComponent = React.ComponentType<{
  href: string;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}>;

export type CategoryCardImageComponent = React.ComponentType<{
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}>;

export interface CategoryCardProps {
  name: string;
  slug?: string;
  href?: string;
  imageUrl?: string;
  productCount?: number;
  className?: string;
  linkComponent?: CategoryCardLinkComponent;
  imageComponent?: CategoryCardImageComponent;
  variant?: 'default' | 'tile';
}

const defaultLink: CategoryCardLinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const defaultImage: CategoryCardImageComponent = (props) => (
  // eslint-disable-next-line jsx-a11y/alt-text
  <img {...props} alt={props.alt} />
);

export function CategoryCard({
  name,
  slug,
  href,
  imageUrl,
  productCount,
  className,
  linkComponent: LinkComp = defaultLink,
  imageComponent: ImgComp = defaultImage,
  variant = 'default',
}: CategoryCardProps): React.JSX.Element {
  const resolvedHref = href ?? `/categories/${slug ?? ''}`;
  if (variant === 'tile') {
    return (
      <LinkComp
        href={resolvedHref}
        className={cn(
          'group relative flex items-end overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-all',
          'hover:-translate-y-0.5 hover:shadow-lg',
          className,
        )}
        aria-label={`Shop ${name}`}
      >
        {imageUrl && (
          <ImgComp
            src={imageUrl}
            alt={name}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform group-hover:scale-105"
          />
        )}
        <div className="relative z-10">
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">{name}</p>
          {typeof productCount === 'number' && (
            <p className="text-xs text-muted-foreground">{productCount.toLocaleString()} products</p>
          )}
        </div>
        <ArrowUpRight
          aria-hidden
          className="absolute right-4 top-4 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </LinkComp>
    );
  }

  return (
    <LinkComp
      href={resolvedHref}
      className={cn(
        'group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all',
        'hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
      aria-label={`Shop ${name}`}
    >
      <AspectRatio ratio={1} className="overflow-hidden bg-muted">
        {imageUrl ? (
          <ImgComp
            src={imageUrl}
            alt={name}
            sizes="(min-width: 1024px) 20vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-moderate group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-card text-muted-foreground/40">
            <span className="text-xs">No image</span>
          </div>
        )}
      </AspectRatio>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold tracking-tight">{name}</p>
          {typeof productCount === 'number' && (
            <p className="text-[11px] text-muted-foreground">{productCount.toLocaleString()} products</p>
          )}
        </div>
        <ArrowUpRight
          aria-hidden
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </LinkComp>
  );
}
