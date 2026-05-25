import { test, expect } from '@playwright/test';

test('45yo with eligible profile → Eligible result', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-button').click();

  // Screen 1: age
  await page.getByTestId('input-age').fill('45');
  await page.getByTestId('next-button').click();

  // Screen 2: weight
  await page.getByTestId('input-weight').fill('90');
  await page.getByTestId('next-button').click();

  // Screen 3: height (server skips bmi → lands on pregnancy)
  await page.getByTestId('input-height').fill('170');
  await page.getByTestId('next-button').click();

  // Screen 5: pregnancy
  await page.getByTestId('option-pregnancy-No').click();
  await page.getByTestId('next-button').click();

  // Screen 6: comorbidities (none)
  await page.getByTestId('next-button').click();

  // Screen 7: diabetes
  await page.getByTestId('option-diabetes-No').click();
  await page.getByTestId('next-button').click();

  // Screen 9: bloodPressure (skipping hba1c because diabetes=No)
  await page.getByTestId('option-bloodPressure-Normal').click();
  await page.getByTestId('next-button').click();

  // Screen 10: medications (none)
  await page.getByTestId('next-button').click();

  // Screen 11: smoking
  await page.getByTestId('option-smoking-No').click();
  await page.getByTestId('next-button').click();

  // Screen 12: alcohol
  await page.getByTestId('option-alcohol-Never').click();
  await page.getByTestId('next-button').click();

  // Screen 13: activity
  await page.getByTestId('option-activity-Moderate').click();
  await page.getByTestId('next-button').click();

  // Screen 14: diet
  await page.getByTestId('option-diet-Balanced-diet').click();
  await page.getByTestId('next-button').click();

  // Result
  await expect(page.getByTestId('result-eligible')).toBeVisible();
});
