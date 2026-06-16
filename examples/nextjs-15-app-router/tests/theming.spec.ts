import { expect, test } from '@playwright/test';

// US2 / SC-002: a saved dark theme is applied before paint, so there is no
// flash of light. The bootstrap sets data-theme synchronously from storage.
test('a saved dark theme is applied on first load (no flash)', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('unbranded-ds-theme', 'dark');
		localStorage.setItem('unbranded-ds-density', 'comfortable');
	});
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// US2 / FR-005: the toggle switches light/dark live, no reload.
test('the theme toggle switches light and dark live', async ({ page }) => {
	await page.goto('/');
	const scheme = page.getByRole('radiogroup', { name: /color scheme/i });
	await scheme.getByRole('radio', { name: /dark/i }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await scheme.getByRole('radio', { name: /light/i }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

// US2 / FR-006: on `system`, the page follows the OS color scheme live.
test('on system, the page follows the OS color scheme', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	await page
		.getByRole('radiogroup', { name: /color scheme/i })
		.getByRole('radio', { name: /system/i })
		.click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.emulateMedia({ colorScheme: 'light' });
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
