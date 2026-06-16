import { expect, test } from '@playwright/test';

// US4 / FR-011: the home page renders the component showcase and the theme
// controls. A representative slice is asserted; the build already guarantees
// every imported component compiles.
test('the home page renders the component showcase', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Default' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /buttons/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /form controls/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /tabs/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /container queries/i })).toBeVisible();
});

test('the theme controls render in the header', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('radiogroup', { name: /color scheme/i })).toBeVisible();
	await expect(page.getByRole('radiogroup', { name: /density/i })).toBeVisible();
});
