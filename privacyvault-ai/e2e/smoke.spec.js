const { test, expect } = require('@playwright/test');

test('landing to dashboard smoke flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /your private ai sanctuary/i })).toBeVisible();
  await page.getByRole('button', { name: /sign up free/i }).click();
  await page.getByText(/magic link/i).click();
  await expect(page.getByRole('heading', { name: /secure sign in/i })).toBeVisible();
});
