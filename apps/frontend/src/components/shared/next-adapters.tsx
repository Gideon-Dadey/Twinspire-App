import type {
  BreadcrumbLinkComponent,
  CategoryCardImageComponent,
  CategoryCardLinkComponent,
  ProductCardImageComponent,
  ProductCardLinkComponent,
} from '@twinspire/ui';
import Image from 'next/image';
import Link from 'next/link';

export const NextLinkProductCard: ProductCardLinkComponent = ({ href, children, ...rest }) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

export const NextImageProductCard: ProductCardImageComponent = ({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}) => (
  <Image
    src={src}
    alt={alt}
    width={width ?? 600}
    height={height ?? 750}
    sizes={sizes}
    className={className}
  />
);

export const NextLinkCategoryCard: CategoryCardLinkComponent = ({ href, children, ...rest }) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

export const NextImageCategoryCard: CategoryCardImageComponent = ({
  src,
  alt,
  sizes,
  className,
}) => (
  <Image src={src} alt={alt} fill sizes={sizes} className={className} />
);

export const NextLinkBreadcrumb: BreadcrumbLinkComponent = ({ href, children, ...rest }) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);
