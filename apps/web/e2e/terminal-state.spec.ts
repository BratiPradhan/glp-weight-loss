import { test, expect } from '@playwright/test';

test('age 16 terminates with Ineligible — underage', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-button').click();

  await page.getByTestId('input-age').fill('16');
  await page.getByTestId('next-button').click();

  await expect(page.getByTestId('result-ineligible')).toBeVisible();
  await expect(page.getByTestId('result-reason')).toHaveText('underage');
});
