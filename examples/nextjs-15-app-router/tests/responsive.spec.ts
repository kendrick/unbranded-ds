import { expect, test } from '@playwright/test';

// US4 / SC-007: usable at 360px with no horizontal scroll.
test('no horizontal scroll at 360px', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('/');
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
});

// FR-015: the two container-query wrappers are different widths, so the same
// card reflows by its container rather than the viewport.
test('the container-query demo uses two different container widths', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 800 });
	await page.goto('/');
	const widths = await page.locator('.\\@container').evaluateAll(
		(els) => els.map((el) => Math.round(el.getBoundingClientRect().width)),
	);
	expect(widths.length).toBeGreaterThanOrEqual(2);
	expect(widths[0]).not.toEqual(widths[1]);
});
