import { describe, expect, it } from 'vitest';
import { canonicalDefaultTokens } from './defaults.js';
import { composeTokens, resolveTheme } from './resolve.js';
import type { ResolvedLayer } from './resolve.js';

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

describe('composeTokens', () => {
	// A ResolvedLayer as the build emits it: a flat override object (spec 014).
	const asLayer = (o: Record<string, Record<string, string>>): ResolvedLayer =>
		o as unknown as ResolvedLayer;

	it('returns the canonical defaults for an empty layer list', () => {
		expect(composeTokens([])).toEqual(canonicalDefaultTokens);
	});

	it('a single layer equals resolveTheme of the same partial', () => {
		expect(composeTokens([asLayer({ color: { primary: '#abc123' } })])).toEqual(
			resolveTheme({ color: { primary: '#abc123' } }),
		);
	});

	it('folds disjoint axes into the union (aesthetic color + density spacing)', () => {
		const composed = composeTokens([
			asLayer({ color: { primary: '#ff0000' } }),
			asLayer({ spacing: { 4: '0.5rem' } }),
		]);
		expect(composed.color.primary).toBe('#ff0000');
		expect(composed.spacing[4]).toBe('0.5rem');
		// untouched tokens keep their defaults
		expect(composed.color.background).toBe(canonicalDefaultTokens.color.background);
	});

	it('density (the later layer) wins a collision', () => {
		expect(
			composeTokens([
				asLayer({ radius: { md: 'AESTHETIC' } }),
				asLayer({ radius: { md: 'DENSITY' } }),
			]).radius.md,
		).toBe('DENSITY');
	});

	it('folds DELTAS, not complete sets — density does not clobber the aesthetic', () => {
		// Density carries only spacing. If compose merged COMPLETE sets, the density
		// layer's inherited default colors would overwrite the aesthetic's red.
		const composed = composeTokens([
			asLayer({ color: { primary: '#ff0000' } }),
			asLayer({ spacing: { 4: '0.1rem' } }),
		]);
		expect(composed.color.primary).toBe('#ff0000');
	});
});
