import { describe, expect, it } from 'vitest';
import { canonicalDefaultTokens } from './defaults.js';
import { composeTokens, dtcgToResolved, resolveTheme } from './resolve.js';

describe('resolveTheme', () => {
	it('returns the canonical defaults verbatim for an empty override', () => {
		const resolved = resolveTheme({});
		expect(resolved).toEqual(canonicalDefaultTokens);
	});

	it('returns the canonical defaults for an undefined override', () => {
		expect(resolveTheme(undefined)).toEqual(canonicalDefaultTokens);
	});

	it('lets the override win on the keys it supplies', () => {
		const resolved = resolveTheme({
			color: { background: '#000000' },
		});
		expect(resolved.color.background).toBe('#000000');
	});

	it('merges PER-KEY within a category rather than replacing the whole category', () => {
		// A partial color override must keep every OTHER default color, not
		// collapse the color category down to the single overridden key.
		const resolved = resolveTheme({
			color: { background: '#000000' },
		});
		expect(resolved.color.background).toBe('#000000');
		expect(resolved.color.foreground).toBe(
			canonicalDefaultTokens.color.foreground,
		);
		expect(resolved.color.primary).toBe(canonicalDefaultTokens.color.primary);
		// The full key set survives the merge.
		expect(Object.keys(resolved.color).sort()).toEqual(
			Object.keys(canonicalDefaultTokens.color).sort(),
		);
	});

	it('inherits omitted whole categories from the defaults', () => {
		// Override only color; spacing/typography/radius/motion all inherit.
		const resolved = resolveTheme({
			color: { background: '#000000' },
		});
		expect(resolved.spacing).toEqual(canonicalDefaultTokens.spacing);
		expect(resolved.typography).toEqual(canonicalDefaultTokens.typography);
		expect(resolved.radius).toEqual(canonicalDefaultTokens.radius);
		expect(resolved.motion).toEqual(canonicalDefaultTokens.motion);
	});

	it('inherits omitted keys within an overridden category', () => {
		const resolved = resolveTheme({
			radius: { sm: '0px' },
		});
		expect(resolved.radius.sm).toBe('0px');
		expect(resolved.radius.md).toBe(canonicalDefaultTokens.radius.md);
		expect(resolved.radius.lg).toBe(canonicalDefaultTokens.radius.lg);
		expect(resolved.radius.full).toBe(canonicalDefaultTokens.radius.full);
	});

	it('merges multiple categories at once, each independently', () => {
		const resolved = resolveTheme({
			color: { primary: '#ff0000' },
			radius: { md: '1rem' },
		});
		expect(resolved.color.primary).toBe('#ff0000');
		expect(resolved.color.background).toBe(
			canonicalDefaultTokens.color.background,
		);
		expect(resolved.radius.md).toBe('1rem');
		expect(resolved.radius.sm).toBe(canonicalDefaultTokens.radius.sm);
	});

	it('does not mutate the canonical defaults', () => {
		const before = canonicalDefaultTokens.color.background;
		resolveTheme({ color: { background: '#abcdef' } });
		expect(canonicalDefaultTokens.color.background).toBe(before);
	});
});

describe('dtcgToResolved', () => {
	it('flattens a two-level DTCG theme to flat values', () => {
		const layer = dtcgToResolved({
			color: { primary: { $value: '#ff0000', $type: 'color' } },
			shadow: { neon: { $value: '0 0 10px red', $type: 'shadow' } },
		});
		expect(layer).toEqual({
			color: { primary: '#ff0000' },
			shadow: { neon: '0 0 10px red' },
		});
	});

	it('coerces non-string $value to a string (e.g. numeric line-heights)', () => {
		const layer = dtcgToResolved({
			typography: { 'leading-normal': { $value: 1.35, $type: 'number' } },
		});
		expect(layer).toEqual({ typography: { 'leading-normal': '1.35' } });
	});
});

describe('composeTokens', () => {
	it('returns the canonical defaults for an empty layer list', () => {
		expect(composeTokens([])).toEqual(canonicalDefaultTokens);
	});

	it('a single layer equals resolveTheme of the same partial', () => {
		const layer = dtcgToResolved({ color: { primary: { $value: '#abc123' } } });
		expect(composeTokens([layer])).toEqual(
			resolveTheme({ color: { primary: '#abc123' } }),
		);
	});

	it('folds disjoint axes into the union (aesthetic color + density spacing)', () => {
		const aesthetic = dtcgToResolved({ color: { primary: { $value: '#ff0000' } } });
		const density = dtcgToResolved({ spacing: { 4: { $value: '0.5rem' } } });
		const composed = composeTokens([aesthetic, density]);
		expect(composed.color.primary).toBe('#ff0000');
		expect(composed.spacing[4]).toBe('0.5rem');
		// untouched tokens keep their defaults
		expect(composed.color.background).toBe(canonicalDefaultTokens.color.background);
	});

	it('density (the later layer) wins a collision', () => {
		const aesthetic = dtcgToResolved({ radius: { md: { $value: 'AESTHETIC' } } });
		const density = dtcgToResolved({ radius: { md: { $value: 'DENSITY' } } });
		expect(composeTokens([aesthetic, density]).radius.md).toBe('DENSITY');
	});

	it('folds DELTAS, not complete sets — density does not clobber the aesthetic (D2)', () => {
		// Density carries only spacing. If compose merged COMPLETE sets, the density
		// layer's inherited default colors would overwrite the aesthetic's red. The
		// delta-fold must leave the aesthetic's color intact.
		const aesthetic = dtcgToResolved({ color: { primary: { $value: '#ff0000' } } });
		const density = dtcgToResolved({ spacing: { 4: { $value: '0.1rem' } } });
		expect(composeTokens([aesthetic, density]).color.primary).toBe('#ff0000');
	});
});
