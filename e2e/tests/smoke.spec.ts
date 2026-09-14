import { expect, test } from '@playwright/test';

test('loads Lumen and reaches the backend through the frontend runtime', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#root')).toBeVisible();

  const backendHealth = await page.evaluate(async () => {
    const response = await fetch('/actuator/health');
    return {
      status: response.status,
      body: await response.json() as { status?: string }
    };
  });

  expect(backendHealth.status).toBe(200);
  expect(backendHealth.body.status).toBe('UP');
});
