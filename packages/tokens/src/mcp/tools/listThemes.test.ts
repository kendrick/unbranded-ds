import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { listThemes } from './listThemes.js';

describe('listThemes', () => {
	it('enumerates every axis value with a description and its axis', async () => {
		const result = await callToolDirectly(listThemes, {});
		expect(result.isError).toBeUndefined();
		const themes = (result.structuredContent as { themes: Array<{ key: string; axis: string; description: string }> }).themes;
		const keys = themes.map((t) => t.key).sort();
		// the full selectable value set across the three axes, including the
		// file-less defaults (light / default / comfortable).
		expect(keys).toEqual(['brand', 'comfortable', 'compact', 'dark', 'default', 'light', 'vaporwave']);
		for (const theme of themes) {
			expect(theme.description.length).toBeGreaterThan(0);
			expect(['colorScheme', 'theme', 'density']).toContain(theme.axis);
		}
		// each value reports the axis it fills.
		expect(themes.find((t) => t.key === 'dark')?.axis).toBe('colorScheme');
		expect(themes.find((t) => t.key === 'vaporwave')?.axis).toBe('theme');
		expect(themes.find((t) => t.key === 'compact')?.axis).toBe('density');
	});
});
