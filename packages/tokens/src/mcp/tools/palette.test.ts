import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { palette } from './palette.js';

describe('palette', () => {
	it('returns all color tokens for a flat category, each tagged with a source', async () => {
		const result = await callToolDirectly(palette, { category: 'color' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { category: string; tokens: Array<{ name: string; value: string; source: string }> };
		expect(payload.category).toBe('color');
		expect(payload.tokens.length).toBeGreaterThan(0);
		expect(payload.tokens.every((t) => t.name.startsWith('color.'))).toBe(true);
		// Schema color tokens are tagged 'schema'.
		expect(payload.tokens.every((t) => t.source === 'schema')).toBe(true);
	});

	it('returns a single leaf when given a fully-qualified dotted path', async () => {
		const result = await callToolDirectly(palette, { category: 'color.primary' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { tokens: Array<{ name: string }> };
		expect(payload.tokens.length).toBe(1);
		expect(payload.tokens[0]?.name).toBe('color.primary');
	});

	it('surfaces a theme-extension token under its category when the theme is active', async () => {
		const result = await callToolDirectly(palette, {
			category: 'shadow',
			theme: { theme: 'vaporwave' },
		});
		const payload = result.structuredContent as { tokens: Array<{ name: string; source: string }> };
		const neon = payload.tokens.find((t) => t.name === 'shadow.neon');
		expect(neon?.source).toBe('theme-extension');
	});

	it('returns unknown-category for a non-existent category', async () => {
		const result = await callToolDirectly(palette, { category: 'no-such-category' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string };
		expect(payload.issue).toBe('unknown-category');
	});
});
