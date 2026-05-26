import { cn } from './cn';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('deduplicates conflicting tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps unrelated utilities together', () => {
    expect(cn('text-sm', 'text-foreground')).toBe('text-sm text-foreground');
  });

  it('supports nested arrays and objects', () => {
    expect(cn(['a', { b: true, c: false }], 'd')).toBe('a b d');
  });
});
