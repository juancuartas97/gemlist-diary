import { expect, test, type Page } from '@playwright/test';

const ONBOARDED_KEY = 'gemlist_onboarded';

async function setOnboarding(page: Page, completed: boolean) {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value);
  }, [ONBOARDED_KEY, completed ? 'true' : 'false']);
}

async function enterMockMode(page: Page) {
  await setOnboarding(page, true);
  await page.goto('/auth');

  const logoHeading = page.getByRole('heading', { name: /gemlist/i });
  await expect(logoHeading).toBeVisible();

  for (let i = 0; i < 5; i += 1) {
    await logoHeading.click();
  }

  await expect(page).toHaveURL(/\/app$/);
  const bottomNav = page.getByRole('navigation');
  await expect(bottomNav.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Chest', exact: true })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'Map', exact: true })).toBeVisible();
  await expect(bottomNav.getByRole('button', { name: 'You', exact: true })).toBeVisible();
}

test.describe('smoke flows', () => {
  test('root redirects to onboarding when onboarding is incomplete', async ({ page }) => {
    await setOnboarding(page, false);
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('artists and settings routes redirect unauthenticated users to auth', async ({ page }) => {
    await setOnboarding(page, true);

    await page.goto('/artists');
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();

    await page.goto('/settings');
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('mock mode unlocks the main app shell', async ({ page }) => {
    await enterMockMode(page);
  });

  test('profile shortcuts navigate to artists and settings', async ({ page }) => {
    await enterMockMode(page);

    await page.getByRole('navigation').getByRole('button', { name: 'You', exact: true }).click();
    await page.getByRole('button', { name: /Artists/i }).click();
    await expect(page).toHaveURL(/\/artists$/);
    await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole('navigation').getByRole('button', { name: 'You', exact: true }).click();
    await page.getByRole('button', { name: /Settings/i }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('fab opens the collection mode chooser with all collection paths', async ({ page }) => {
    await enterMockMode(page);

    await page.getByRole('button', { name: 'Mine a gem' }).click();
    await expect(page.getByRole('heading', { name: 'Collect a Gem' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Log a Memory/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mine Live/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Log a Festival/i })).toBeVisible();
  });
});
