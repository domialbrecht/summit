import { test, expect } from '@playwright/test';

test.describe('Welcome page (public)', () => {
	test('loads and shows hero content', async ({ page }) => {
		await page.goto('/welcome');
		await expect(page).toHaveURL('/welcome');
		// Page should render without errors
		await expect(page.locator('body')).not.toContainText('500');
	});
});

test.describe('Rules page (public)', () => {
	test('loads rules content', async ({ page }) => {
		await page.goto('/rules');
		await expect(page.locator('body')).toContainText('Vorgehenswiis');
	});
});

test.describe('News page (public)', () => {
	test('loads news content', async ({ page }) => {
		await page.goto('/news');
		await expect(page.locator('body')).not.toContainText('500');
	});
});
