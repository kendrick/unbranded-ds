import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { listThemes } from './listThemes.js';

describe('listThemes', () => {
	it('returns every bundled theme with a description and its axis', async () => {
		const result = await callToolDirectly(listThemes, {});
		expect(result.isError).toBeUndefined();
		const themes = (result.structuredContent as { themes: Array<{ key: string; axis: string; description: string }> }).themes;
		const keys = themes.map((t) => t.key).sort();
		expect(keys).toEqual(['brand', 'compact', 'dark', 'light', 'vaporwave']);
		for (const theme of themes) {
			expect(theme.description.length).toBeGreaterThan(0);
			expect(['aesthetic', 'density']).toContain(theme.axis);
		}
		// compact lives on the density axis; vaporwave on aesthetic.
		expect(themes.find((t) => t.key === 'compact')?.axis).toBe('density');
		expect(themes.find((t) => t.key === 'vaporwave')?.axis).toBe('aesthetic');
	});
});
