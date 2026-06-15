import { describe, expect, it } from 'vitest';

import { resolvePreference } from './resolve';

describe('resolvePreference', () => {
	it('passes a concrete value through unchanged', () => {
		expect(resolvePreference('dark', undefined)).toBe('dark');
		expect(resolvePreference('compact', 'dark')).toBe('compact');
	});

	it('resolves `system` to the supplied OS value', () => {
		expect(resolvePreference('system', 'dark')).toBe('dark');
		expect(resolvePreference('system', 'light')).toBe('light');
	});

	it('falls back to light when `system` has no OS signal', () => {
		expect(resolvePreference('system', undefined)).toBe('light');
	});
});
