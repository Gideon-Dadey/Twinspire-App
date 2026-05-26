import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely.
 * - Deduplicates conflicting utility classes
 * - Filters falsy values
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
