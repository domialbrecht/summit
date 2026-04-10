import { test, expect } from '@playwright/test';

test.describe('Summit index API', () => {
	test('returns JSON array of summits', async ({ request }) => {
		const response = await request.get('/summits/index');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');

		const data = await response.json();
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThan(0);

		// Verify summit structure
		const summit = data[0];
		expect(summit).toHaveProperty('id');
		expect(summit).toHaveProperty('name');
		expect(summit).toHaveProperty('lat');
		expect(summit).toHaveProperty('long');
	});

	test('summit coordinates are valid Swiss coordinates', async ({ request }) => {
		const response = await request.get('/summits/index');
		const data = await response.json();

		for (const summit of data.slice(0, 10)) {
			const lat = Number(summit.lat);
			const lng = Number(summit.long);
			// Swiss summits should be roughly in 45-48°N, 5-11°E
			expect(lat).toBeGreaterThan(44);
			expect(lat).toBeLessThan(49);
			expect(lng).toBeGreaterThan(4);
			expect(lng).toBeLessThan(12);
		}
	});

	test('has cache-control header', async ({ request }) => {
		const response = await request.get('/summits/index');
		expect(response.headers()['cache-control']).toContain('max-age=86400');
	});
});

test.describe('Summit detail page', () => {
	test('loads a summit page', async ({ request, page }) => {
		// Get a summit ID from the index
		const response = await request.get('/summits/index');
		const summits = await response.json();
		const summitId = summits[0].id;

		await page.goto(`/summits/${summitId}`);
		await expect(page.locator('body')).toContainText(summits[0].name);
	});

	test('returns 404 for non-existent summit', async ({ page }) => {
		const response = await page.goto('/summits/999999');
		expect(response?.status()).toBe(404);
	});

	test('shows summit name and area badges', async ({ page }) => {
		await page.goto('/summits/90001');
		// Summit title
		await expect(page.locator('h1')).toContainText('Test Summit Start');
		// Area badge
		await expect(page.getByText('Bern')).toBeVisible();
	});

	test('shows page title with summit name', async ({ page }) => {
		await page.goto('/summits/90001');
		await expect(page).toHaveTitle('Test Summit Start');
	});

	test('shows win (trophy) for summit with published attempt', async ({ page }) => {
		await page.goto('/summits/90001');
		// The active season accordion should be open and show the winner
		const winsSection = page.locator('#summit-wins');
		// Season 2026 trophy section
		await expect(winsSection.getByText('Trophäe 2026')).toBeVisible();
		// The test user "DomiTest" published a ride here → should appear as winner
		await expect(winsSection.getByText('DomiTest').first()).toBeVisible();
		// Win date should be visible (March 2026)
		await expect(winsSection.getByText(/15\..*26/)).toBeVisible();
		// Strava link should exist
		await expect(winsSection.getByText('Aktivität')).toBeVisible();
	});

	test('shows medals for summit with attempts', async ({ page }) => {
		await page.goto('/summits/90001');
		const winsSection = page.locator('#summit-wins');
		// DomiTest has 1 attempt → should show medal with attempt count
		await expect(winsSection.getByText('Pass ufstige: 1')).toBeVisible();
	});

	test('shows "Pass frei" for summit with no attempts', async ({ page }) => {
		// Summit 90002 has no seeded attempts → should show Free component
		await page.goto('/summits/90002');
		const winsSection = page.locator('#summit-wins');
		await expect(winsSection.getByText('Pass frei').first()).toBeVisible();
	});
});
