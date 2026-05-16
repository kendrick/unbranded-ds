import { describe, expect, it } from 'vitest';
import validCustom from './__fixtures__/valid-custom.json';
import { contrastPairs, themeSchema } from './schema';

describe('themeSchema', () => {
	it('accepts a valid theme with hex colors', () => {
		const result = themeSchema.safeParse(validCustom);
		expect(result.success).toBe(true);
	});

	it('accepts oklch color values as strings', () => {
		const oklchTheme = {
			...validCustom,
			tokens: {
				...validCustom.tokens,
				color: {
					...validCustom.tokens.color,
					background: 'oklch(1.0000 0.0000 89.88)',
					foreground: 'oklch(0.1408 0.0044 285.82)',
				},
			},
		};
		const result = themeSchema.safeParse(oklchTheme);
		expect(result.success).toBe(true);
	});

	it('rejects theme missing name', () => {
		const { name: _, ...noName } = validCustom;
		const result = themeSchema.safeParse(noName);
		expect(result.success).toBe(false);
	});

	it('rejects theme missing tokens object', () => {
		const result = themeSchema.safeParse({
			name: 'broken',
			displayName: 'Broken',
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-string token values', () => {
		const badTypes = {
			...validCustom,
			tokens: {
				...validCustom.tokens,
				color: {
					...validCustom.tokens.color,
					background: 42,
				},
			},
		};
		const result = themeSchema.safeParse(badTypes);
		expect(result.success).toBe(false);
	});

	it('rejects empty string for name', () => {
		const result = themeSchema.safeParse({ ...validCustom, name: '' });
		expect(result.success).toBe(false);
	});
});

describe('contrastPairs', () => {
	it('declares 4 foreground/background pairs', () => {
		expect(contrastPairs).toHaveLength(4);
	});

	it('all pairs have 4.5:1 threshold', () => {
		for (const pair of contrastPairs) {
			expect(pair.threshold).toBe(4.5);
		}
	});

	it('pairs reference color category tokens', () => {
		for (const pair of contrastPairs) {
			expect(pair.foreground).toMatch(/^color\./);
			expect(pair.background).toMatch(/^color\./);
		}
	});
});
