import { describe, expect, it } from 'vitest';
import { canonicalDefaultTokens } from './defaults';
import validCustom from './__fixtures__/valid-custom.json';
import { contrastPairs, partialThemeSchema, themeSchema } from './schema';

// A COMPLETE token set, built from the canonical defaults so these schema-shape
// tests don't couple to __fixtures__/valid-custom.json (owned by the validator
// worker). Spreading the resolved defaults guarantees every required category/key
// is present; individual tests then delete a field to prove it's required, or
// omit an optional category to prove it inherits.
const completeTokens = structuredClone(canonicalDefaultTokens);
const completeTheme = {
	name: 'shape-test',
	displayName: 'Shape Test',
	tokens: completeTokens,
};

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
	it('declares 6 foreground/background pairs', () => {
		// 6 since spec 018 added destructive-subtle-foreground/destructive-subtle.
		expect(contrastPairs).toHaveLength(6);
	});

	it('includes the destructive-subtle pair (spec 018)', () => {
		expect(contrastPairs).toContainEqual({
			foreground: 'color.destructive-subtle-foreground',
			background: 'color.destructive-subtle',
			threshold: 4.5,
		});
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

// ---------------------------------------------------------------------------
// Spec 008 token-vocabulary growth: motion (required), the three new typography
// keys (required), and ring/z-index (optional). These assert the SCHEMA SHAPE —
// what the strict themeSchema demands and what partialThemeSchema lets a consumer
// omit — independent of any fixture's contents.
// ---------------------------------------------------------------------------

describe('themeSchema — motion category (required)', () => {
	it('accepts a complete theme carrying the motion category', () => {
		const result = themeSchema.safeParse(completeTheme);
		expect(result.success).toBe(true);
	});

	it('rejects a complete theme missing the entire motion category', () => {
		const theme = structuredClone(completeTheme);
		delete (theme.tokens as Record<string, unknown>).motion;
		const result = themeSchema.safeParse(theme);
		expect(result.success).toBe(false);
	});

	it.each([
		'duration-fast',
		'duration-base',
		'duration-slow',
		'easing-standard',
		'easing-decelerate',
		'easing-accelerate',
	])('requires motion.%s', (key) => {
		const theme = structuredClone(completeTheme);
		delete (theme.tokens.motion as Record<string, unknown>)[key];
		const result = themeSchema.safeParse(theme);
		expect(result.success).toBe(false);
	});
});

describe('themeSchema — new required typography keys', () => {
	it.each(['font-serif', 'size-2xl', 'size-3xl'])(
		'requires typography.%s',
		(key) => {
			const theme = structuredClone(completeTheme);
			delete (theme.tokens.typography as Record<string, unknown>)[key];
			const result = themeSchema.safeParse(theme);
			expect(result.success).toBe(false);
		},
	);
});

describe('themeSchema — ring and z-index are optional', () => {
	it('accepts a complete theme that omits ring', () => {
		const theme = structuredClone(completeTheme);
		delete (theme.tokens as Record<string, unknown>).ring;
		const result = themeSchema.safeParse(theme);
		expect(result.success).toBe(true);
	});

	it('accepts a complete theme that omits z-index', () => {
		const theme = structuredClone(completeTheme);
		delete (theme.tokens as Record<string, unknown>)['z-index'];
		const result = themeSchema.safeParse(theme);
		expect(result.success).toBe(true);
	});

	it('accepts a complete theme that omits both ring and z-index', () => {
		const theme = structuredClone(completeTheme);
		delete (theme.tokens as Record<string, unknown>).ring;
		delete (theme.tokens as Record<string, unknown>)['z-index'];
		const result = themeSchema.safeParse(theme);
		expect(result.success).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// T015/T016: ring and z-index are optional drift tokens (spec 008 US4). A
// consumer runtime theme that omits them must parse against partialThemeSchema —
// the lenient INITIAL parse — and inherit the canonical defaults downstream. This
// is the partial-input path that registerTheme/validateTheme actually feed.
// ---------------------------------------------------------------------------

describe('partialThemeSchema — optional ring/z-index inheritance', () => {
	it('parses a color-only partial theme (omits ring, z-index, and motion)', () => {
		const partial = {
			name: 'color-only',
			displayName: 'Color Only',
			tokens: { color: { primary: 'oklch(0.5 0.1 250)' } },
		};
		const result = partialThemeSchema.safeParse(partial);
		expect(result.success).toBe(true);
	});

	it('parses a partial theme that supplies ring/z-index but omits other categories', () => {
		const partial = {
			name: 'drift-only',
			displayName: 'Drift Only',
			tokens: {
				ring: { width: '2px' },
				'z-index': { overlay: '40', popover: '45', tooltip: '50' },
			},
		};
		const result = partialThemeSchema.safeParse(partial);
		expect(result.success).toBe(true);
	});

	it('parses a partial theme that omits ring/z-index entirely (inherit on omit)', () => {
		const partial = {
			name: 'no-drift',
			displayName: 'No Drift',
			tokens: { radius: { md: '0.5rem' } },
		};
		const result = partialThemeSchema.safeParse(partial);
		expect(result.success).toBe(true);
	});
});
