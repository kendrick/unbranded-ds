import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { palette } from './palette.js';

describe('palette', () => {
	it('returns all color tokens for a flat category', async () => {
		const result = await callToolDirectly(palette, { category: 'color' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { category: string; theme: string; tokens: Array<{ name: string; value: string }> };
		expect(payload.category).toBe('color');
		expect(payload.theme).toBe('light');
		expect(payload.tokens.length).toBeGreaterThan(0);
		expect(payload.tokens.every((t) => t.name.startsWith('color.'))).toBe(true);
	});

	it('returns a hierarchical subtree when given a dotted path', async () => {
		// The theme JSON nests color tokens directly; querying `color.primary` returns
		// just the primary token itself (single leaf), demonstrating the hierarchical mode.
		const result = await callToolDirectly(palette, { category: 'color.primary' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { tokens: Array<{ name: string }> };
		expect(payload.tokens.length).toBe(1);
		expect(payload.tokens[0]?.name).toBe('color.primary');
	});

	it('returns unknown-category for a non-existent category', async () => {
		const result = await callToolDirectly(palette, { category: 'no-such-category' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string };
		expect(payload.issue).toBe('unknown-category');
	});

	it('returns unknown-theme for a non-existent theme', async () => {
		const result = await callToolDirectly(palette, { category: 'color', theme: 'nope' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string };
		expect(payload.issue).toBe('unknown-theme');
	});
});
