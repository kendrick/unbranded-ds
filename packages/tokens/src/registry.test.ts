import { describe, expect, it } from 'vitest';

import { registerThemeName, themesForAxis } from './registry.js';

describe('themesForAxis', () => {
	it('lists the built-in color schemes, the base (light) first', () => {
		expect(themesForAxis('colorScheme')).toEqual(['light', 'dark']);
	});

	it('lists the built-in theme identities, the file-less `default` first', () => {
		// `default` has no override JSON (the color-scheme base shows through) but is
		// a first-class selectable identity, so it must appear and lead the list.
		expect(themesForAxis('theme')).toEqual(['default', 'brand', 'vaporwave']);
	});

	it('includes density\'s file-less `comfortable` default and leads with it', () => {
		expect(themesForAxis('density')).toEqual(['comfortable', 'compact']);
	});

	it('surfaces a runtime-registered theme on its axis, after the built-ins', () => {
		registerThemeName('density', 'cozy');
		const names = themesForAxis('density');
		expect(names).toContain('cozy');
		expect(names.slice(0, 2)).toEqual(['comfortable', 'compact']);
		expect(names.at(-1)).toBe('cozy');
	});

	it('de-duplicates when a registered name repeats a built-in', () => {
		registerThemeName('theme', 'brand');
		const brands = themesForAxis('theme').filter((n) => n === 'brand');
		expect(brands).toHaveLength(1);
	});
});
