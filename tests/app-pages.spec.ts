import { test, expect } from '@playwright/test';

test.describe('Home page (authenticated)', () => {
	test('loads dashboard with user greeting', async ({ page }) => {
		await page.goto('/');
		// TEST_USER is "DomiTest" — should see the greeting
		await expect(page.locator('body')).toContainText('Hey');
	});

	test('shows Club Aktivitäte section', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Club Aktivitäte')).toBeVisible();
	});

	test('shows sync button', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Synchronisiere')).toBeVisible();
	});
});

test.describe('Challenges page (authenticated)', () => {
	test('loads challenges listing', async ({ page }) => {
		await page.goto('/challenges');
		await expect(page.getByText('SolyVC Challenges')).toBeVisible();
	});

	test('has create challenge button', async ({ page }) => {
		await page.goto('/challenges');
		await expect(page.getByText('Challange erstelle')).toBeVisible();
	});
});

test.describe('Leaderboard page', () => {
	test('loads leaderboard with season data', async ({ page }) => {
		await page.goto('/leaderboard');
		// Should redirect to the active season's leaderboard
		await expect(page).toHaveURL(/\/leaderboard\/season\//);
	});

	test('renders without errors', async ({ page }) => {
		await page.goto('/leaderboard');
		await expect(page.locator('body')).not.toContainText('500');
		await expect(page.locator('body')).not.toContainText('Error');
	});
});
