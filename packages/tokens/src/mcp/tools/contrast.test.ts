import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { contrast } from './contrast.js';

describe('contrast', () => {
	it('computes contrast between two hex colors', async () => {
		const result = await callToolDirectly(contrast, { foreground: '#000000', background: '#ffffff' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { ratio: number; aa: { normal: boolean }; aaa: { normal: boolean } };
		expect(payload.ratio).toBeGreaterThan(20);
		expect(payload.aa.normal).toBe(true);
		expect(payload.aaa.normal).toBe(true);
	});

	it('flags low contrast as failing AA-normal', async () => {
		const result = await callToolDirectly(contrast, { foreground: '#888888', background: '#999999' });
		const payload = result.structuredContent as { ratio: number; aa: { normal: boolean } };
		expect(payload.aa.normal).toBe(false);
	});

	it('resolves token references against the active theme', async () => {
		const result = await callToolDirectly(contrast, {
			foreground: 'color.foreground',
			background: 'color.background',
		});
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { ratio: number; foreground: { resolved: string } };
		expect(payload.ratio).toBeGreaterThan(1);
		// Resolved value should be an oklch() expression from the theme JSON.
		expect(payload.foreground.resolved).toMatch(/^oklch/);
	});

	it('returns unparseable-color for malformed input', async () => {
		const result = await callToolDirectly(contrast, { foreground: 'not-a-color', background: '#ffffff' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string };
		expect(payload.issue).toBe('unparseable-color');
	});

	it('returns unknown-token when a token reference does not resolve', async () => {
		const result = await callToolDirectly(contrast, {
			foreground: 'color.nope',
			background: '#ffffff',
		});
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string };
		expect(payload.issue).toBe('unknown-token');
	});
});
