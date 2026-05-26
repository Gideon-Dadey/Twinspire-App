'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '../lib/cn';

const sizeMap = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
} as const;

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: keyof typeof sizeMap;
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(function Avatar({ className, size = 'md', ...props }, ref) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
});

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
});
