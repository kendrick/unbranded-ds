import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// SC-009: no serious or critical accessibility violations on the key views.
for (const path of ['/', '/showcase']) {
	test(`no serious or critical axe violations on ${path}`, async ({ page }) => {
		await page.goto(path);
		const results = await new AxeBuilder({ page }).analyze();
		const blocking = results.violations.filter(
			(v) => v.impact === 'serious' || v.impact === 'critical',
		);
		expect(blocking).toEqual([]);
	});
}
