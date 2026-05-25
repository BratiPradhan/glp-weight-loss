import { test, expect } from '@playwright/test';

test('conflicting BP selections → Hypertensive Crisis triggers clinical review', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('start-button').click();

  // Walk to bloodPressure
  await page.getByTestId('input-age').fill('45');
  await page.getByTestId('next-button').click();
  await page.getByTestId('input-weight').fill('90');
  await page.getByTestId('next-button').click();
  await page.getByTestId('input-height').fill('170');
  await page.getByTestId('next-button').click();
  await page.getByTestId('option-pregnancy-No').click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('next-button').click(); // comorbidities, none
  await page.getByTestId('option-diabetes-No').click();
  await page.getByTestId('next-button').click();

  // On bloodPressure: check both conflicting options
  await page.getByTestId('option-bloodPressure-Normal').click();
  await page.getByTestId('option-bloodPressure-Hypertensive-Crisis').click();
  await page.getByTestId('next-button').click();

  // Continue through remaining screens
  await page.getByTestId('next-button').click(); // medications, none
  await page.getByTestId('option-smoking-No').click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('option-alcohol-Never').click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('option-activity-Moderate').click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('option-diet-Balanced-diet').click();
  await page.getByTestId('next-button').click();

  // Result is clinical-review because Hypertensive Crisis was selected
  await expect(page.getByTestId('result-clinical-review')).toBeVisible();
  await expect(page.getByTestId('result-reason-hypertensive-crisis')).toBeVisible();
});
