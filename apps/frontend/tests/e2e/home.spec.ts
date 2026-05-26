import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('renders the hero, categories, and footer', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /electronics store/i }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /shop today/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Everything you need/i })).toBeVisible();
    await expect(page.getByText(/All rights reserved/i)).toBeVisible();
  });
});
