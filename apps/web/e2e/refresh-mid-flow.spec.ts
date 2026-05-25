import { test, expect } from '@playwright/test';

test('refresh on screen 7 (diabetes) restores prior answers and current screen', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('start-button').click();

  await page.getByTestId('input-age').fill('45');
  await page.getByTestId('next-button').click();

  await page.getByTestId('input-weight').fill('90');
  await page.getByTestId('next-button').click();

  await page.getByTestId('input-height').fill('170');
  await page.getByTestId('next-button').click();

  await page.getByTestId('option-pregnancy-No').click();
  await page.getByTestId('next-button').click();

  await page.getByTestId('next-button').click(); // comorbidities, none

  // Now on diabetes screen
  await expect(page.getByTestId('screen-diabetes')).toBeVisible();

  // Refresh
  await page.reload();

  // Still on diabetes screen after reload
  await expect(page.getByTestId('screen-diabetes')).toBeVisible();

  // Complete the flow to confirm prior answers are intact server-side
  await page.getByTestId('option-diabetes-No').click();
  await page.getByTestId('next-button').click();
  // If age/weight/height/pregnancy weren't persisted, this would not reach BP
  await expect(page.getByTestId('screen-bloodPressure')).toBeVisible();
});
