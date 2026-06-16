import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	AXIS_ATTRIBUTE,
	axisOf,
	listThemesByAxis,
	themeAxisEntries,
} from './axes.js';

const themesDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'themes');

describe('axes', () => {
	it('maps each axis to its DOM attribute', () => {
		expect(AXIS_ATTRIBUTE).toEqual({
			colorScheme: 'data-color-scheme',
			theme: 'data-theme',
			density: 'data-density',
		});
	});

	it('groups themes by their directory axis', () => {
		const byAxis = listThemesByAxis(themesDir);
		// color-scheme: `dark` has a file; `light` is the file-less base, so it does
		// not appear in the on-disk listing.
		expect(byAxis.colorScheme).toEqual(expect.arrayContaining(['dark']));
		// theme axis values are the identity DIRECTORY names (each nests per scheme).
		expect(byAxis.theme).toEqual(expect.arrayContaining(['brand', 'vaporwave']));
		expect(byAxis.density).toEqual(expect.arrayContaining(['compact']));
		// the axes never bleed into each other
		expect(byAxis.theme).not.toContain('compact');
		expect(byAxis.density).not.toContain('vaporwave');
		expect(byAxis.colorScheme).not.toContain('brand');
	});

	it('resolves a theme name to its axis', () => {
		expect(axisOf(themesDir, 'vaporwave')).toBe('theme');
		expect(axisOf(themesDir, 'dark')).toBe('colorScheme');
		expect(axisOf(themesDir, 'compact')).toBe('density');
		expect(axisOf(themesDir, 'nonexistent')).toBeUndefined();
	});

	it('lists every theme paired with its axis', () => {
		const entries = themeAxisEntries(themesDir);
		expect(entries).toContainEqual({ name: 'compact', axis: 'density' });
		expect(entries).toContainEqual({ name: 'brand', axis: 'theme' });
		expect(entries).toContainEqual({ name: 'dark', axis: 'colorScheme' });
	});
});
