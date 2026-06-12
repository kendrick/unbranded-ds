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
			aesthetic: 'data-theme',
			density: 'data-density',
		});
	});

	it('groups themes by their directory axis', () => {
		const byAxis = listThemesByAxis(themesDir);
		expect(byAxis.aesthetic).toEqual(
			expect.arrayContaining(['light', 'dark', 'brand', 'vaporwave']),
		);
		expect(byAxis.density).toEqual(expect.arrayContaining(['compact']));
		// the axes never bleed into each other
		expect(byAxis.aesthetic).not.toContain('compact');
		expect(byAxis.density).not.toContain('vaporwave');
	});

	it('resolves a theme name to its axis', () => {
		expect(axisOf(themesDir, 'vaporwave')).toBe('aesthetic');
		expect(axisOf(themesDir, 'compact')).toBe('density');
		expect(axisOf(themesDir, 'nonexistent')).toBeUndefined();
	});

	it('lists every theme paired with its axis', () => {
		const entries = themeAxisEntries(themesDir);
		expect(entries).toContainEqual({ name: 'compact', axis: 'density' });
		expect(entries).toContainEqual({ name: 'light', axis: 'aesthetic' });
	});
});
