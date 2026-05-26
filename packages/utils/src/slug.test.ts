import { slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('iPhone 15 Pro Max')).toBe('iphone-15-pro-max');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Crème Brûlée')).toBe('cafe-creme-brulee');
  });

  it('handles symbols and emoji', () => {
    expect(slugify('Galaxy S24+ Ultra 🚀')).toBe('galaxy-s24-ultra');
  });

  it('collapses repeated separators', () => {
    expect(slugify('hello   ---   world')).toBe('hello-world');
  });

  it('supports custom separator', () => {
    expect(slugify('OLED 4K Smart TV', '_')).toBe('oled_4k_smart_tv');
  });
});

describe('uniqueSlug', () => {
  it('returns base when not taken', () => {
    expect(uniqueSlug('apple-iphone', ['samsung-galaxy'])).toBe('apple-iphone');
  });

  it('appends an incrementing suffix', () => {
    expect(uniqueSlug('iphone', ['iphone', 'iphone-2'])).toBe('iphone-3');
  });
});
