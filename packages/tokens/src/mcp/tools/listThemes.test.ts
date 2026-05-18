import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { listThemes } from './listThemes.js';

describe('listThemes', () => {
	it('returns every bundled theme with a description', async () => {
		const result = await callToolDirectly(listThemes, {});
		expect(result.isError).toBeUndefined();
		const themes = (result.structuredContent as { themes: Array<{ key: string; description: string }> }).themes;
		const keys = themes.map((t) => t.key).sort();
		expect(keys).toEqual(['brand', 'dark', 'light']);
		for (const theme of themes) {
			expect(theme.description.length).toBeGreaterThan(0);
		}
	});
});
