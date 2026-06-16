import { expect, test } from '@playwright/test';

// US2 / FR-012: the pinned section composes vaporwave + compact on its container.
test('the pinned showcase composes vaporwave and compact', async ({ page }) => {
	await page.goto('/showcase');
	const pinned = page.getByTestId('pinned-vaporwave');
	await expect(pinned).toHaveAttribute('data-theme', 'vaporwave');
	await expect(pinned).toHaveAttribute('data-color-scheme', 'dark');
	await expect(pinned).toHaveAttribute('data-density', 'compact');
});

// US2 #6 / FR-017: theme and density persist across navigation to the nested
// route and back.
test('theme and density persist across navigation', async ({ page }) => {
	await page.goto('/');
	await page
		.getByRole('radiogroup', { name: /color scheme/i })
		.getByRole('radio', { name: /dark/i })
		.click();
	await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');

	await page.getByRole('link', { name: /showcase/i }).click();
	await expect(page).toHaveURL(/\/showcase$/);
	await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');

	await page.getByRole('link', { name: /^unbranded-ds$/i }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');
});
