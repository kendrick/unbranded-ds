import { describe, expect, it } from 'vitest';

import { callToolDirectly } from '../runtime/testing.js';
import { lookupToken } from './lookupToken.js';

describe('lookupToken', () => {
	it('resolves a known token under the default (light) color scheme', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.primary' });
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { token: string; source: string; present: boolean; cssVariable: string; value: string };
		expect(payload.token).toBe('color.primary');
		expect(payload.source).toBe('schema');
		expect(payload.present).toBe(true);
		expect(payload.cssVariable).toBe('--color-primary');
		expect(payload.value.length).toBeGreaterThan(0);
	});

	it('resolves a known token under a non-default color scheme', async () => {
		const light = await callToolDirectly(lookupToken, { token: 'color.primary' });
		const dark = await callToolDirectly(lookupToken, { token: 'color.primary', theme: { colorScheme: 'dark' } });
		const lightValue = (light.structuredContent as { value: string }).value;
		const darkValue = (dark.structuredContent as { value: string }).value;
		// The dark color scheme overrides color.primary, so the resolved value differs.
		expect(darkValue).not.toBe(lightValue);
	});

	it('resolves a density override (compact) and lets density win the collision', async () => {
		const result = await callToolDirectly(lookupToken, {
			token: 'spacing.4',
			theme: { density: 'compact' },
		});
		const payload = result.structuredContent as { value: string };
		// compact sets spacing.4 to 0.8rem (vs the 1rem default); density wins.
		expect(payload.value).toBe('0.8rem');
	});

	it('returns a theme-extension token (shadow.neon) when vaporwave is active', async () => {
		const result = await callToolDirectly(lookupToken, {
			token: 'shadow.neon',
			theme: { theme: 'vaporwave', colorScheme: 'dark' },
		});
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { source: string; present: boolean; value: string };
		expect(payload.source).toBe('theme-extension');
		expect(payload.present).toBe(true);
		expect(payload.value.length).toBeGreaterThan(0);
	});

	it('softly reports a theme-extension token absent from the active theme', async () => {
		// shadow.neon is a real extension (vaporwave declares it) but the default identity does not,
		// so the answer is a soft present:false, NOT an unknown-token error.
		const result = await callToolDirectly(lookupToken, {
			token: 'shadow.neon',
			theme: { theme: 'default' },
		});
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { source: string; present: boolean; note: string };
		expect(payload.source).toBe('theme-extension');
		expect(payload.present).toBe(false);
		expect(payload.note.length).toBeGreaterThan(0);
	});

	it('ignores an unrecognized axis while the other axis still resolves', async () => {
		const result = await callToolDirectly(lookupToken, {
			token: 'color.primary',
			theme: { colorScheme: 'dark', density: 'nope' },
		});
		expect(result.isError).toBeUndefined();
		const payload = result.structuredContent as { present: boolean; value: string };
		expect(payload.present).toBe(true);
		expect(payload.value.length).toBeGreaterThan(0);
	});

	it('returns unknown-token for a token in no theme at all', async () => {
		const result = await callToolDirectly(lookupToken, { token: 'color.nope' });
		expect(result.isError).toBe(true);
		const payload = result.structuredContent as { component: string; issue: string; got: string };
		expect(payload.issue).toBe('unknown-token');
		expect(payload.got).toBe('color.nope');
	});
});
