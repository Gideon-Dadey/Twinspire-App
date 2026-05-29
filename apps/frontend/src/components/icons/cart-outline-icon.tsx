import { cn } from '@twinspire/ui';
import * as React from 'react';

export interface CartOutlineIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/** Minimal line-art cart — matches the header cart reference. */
export function CartOutlineIcon({ className, ...props }: CartOutlineIconProps): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-[20px]', className)}
      aria-hidden
      {...props}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 2.5h2l2.5 12.5h11l2-7.5H6.5" />
    </svg>
  );
}
