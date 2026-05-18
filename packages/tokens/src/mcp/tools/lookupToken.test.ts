import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { lookupToken } from './lookupToken.js';

describe('lookupToken', () => {
	it('resolves a known token in the default theme', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.primary' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { token: string; theme: string; cssVariable: string; value: string };
		expect(payload.token).toBe('color.primary');
		expect(payload.theme).toBe('light');
		expect(payload.cssVariable).toBe('--color-primary');
		expect(payload.value.length).toBeGreaterThan(0);
	});

	it('resolves a known token in a non-default theme', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.primary', theme: 'dark' });
		const payload = result.structuredContent as { theme: string };
		expect(payload.theme).toBe('dark');
	});

	it('returns unknown-theme for a missing theme', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.primary', theme: 'nope' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string; got: string };
		expect(payload).toEqual({ component: 'tokens-mcp', issue: 'unknown-theme', got: 'nope' });
	});

	it('returns unknown-token for a token not in the schema', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.nope' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string; got: string };
		expect(payload.issue).toBe('unknown-token');
		expect(payload.got).toBe('color.nope');
	});
});
