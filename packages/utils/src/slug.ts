/**
 * URL-safe slug generator. Handles diacritics, multiple whitespace,
 * symbols, and emoji.
 */
export function slugify(input: string, separator = '-'): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2000-\u206f\u2e00-\u2e7f'"!?,.;:()[\]{}<>/\\@#$%^&*+=~`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
    .replace(new RegExp(`${separator}{2,}`, 'g'), separator);
}

/** Ensure a slug is unique against a set of existing slugs by appending -2, -3, ... */
export function uniqueSlug(base: string, existing: Iterable<string>): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
