import { describe, expect, it } from 'vitest';
import badContrast from './__fixtures__/bad-contrast.json';
import extraTokens from './__fixtures__/extra-tokens.json';
import inheritedPairFail from './__fixtures__/inherited-pair-fail.json';
import partialTheme from './__fixtures__/partial-theme.json';
import validCustom from './__fixtures__/valid-custom.json';
import { canonicalDefaultTokens } from './defaults.js';
import { checkThemeCompleteness, validateTheme } from './validate';

describe('validateTheme', () => {
	it('accepts a valid theme with hex colors', () => {
		const result = validateTheme(validCustom);
		expect(result.ok).toBe(true);
	});

	it('accepts a valid theme with oklch colors', () => {
		const oklchTheme = {
			...validCustom,
			name: 'oklch-test',
			tokens: {
				...validCustom.tokens,
				color: {
					'background': 'oklch(1.0000 0.0000 0)',
					'foreground': 'oklch(0.1400 0.0000 0)',
					'primary': 'oklch(0.2100 0.0000 0)',
					'primary-foreground': 'oklch(0.9800 0.0000 0)',
					'muted': 'oklch(0.9500 0.0000 0)',
					'muted-foreground': 'oklch(0.4500 0.0000 0)',
					'border': 'oklch(0.9000 0.0000 0)',
					'ring': 'oklch(0.2100 0.0000 0)',
					'destructive': 'oklch(0.5000 0.2000 25.00)',
					'destructive-foreground': 'oklch(1.0000 0.0000 0)',
				},
			},
		};
		const result = validateTheme(oklchTheme);
		expect(result.ok).toBe(true);
	});

	// --- Resolve-then-validate (spec 008 US2) ---------------------------------

	it('accepts a PARTIAL theme (color + radius only) by inheriting defaults', () => {
		// partial-theme.json carries only color + radius. The validator merges it
		// onto the canonical defaults, so the omitted categories are present in
		// the merged result and completeness passes.
		const result = validateTheme(partialTheme);
		expect(result.ok).toBe(true);
	});

	it('returns the MERGED theme so omitted categories resolve to defaults', () => {
		const result = validateTheme(partialTheme);
		expect(result.ok).toBe(true);
		if (result.ok) {
			// The radius override took effect on the keys it supplied...
			expect(result.theme.tokens.radius.sm).toBe('0.125rem');
			expect(result.theme.tokens.radius.md).toBe('0.25rem');
			// ...while OMITTED keys within that same category inherited (US2 AS2).
			expect(result.theme.tokens.radius.lg).toBe(
				canonicalDefaultTokens.radius.lg,
			);
			expect(result.theme.tokens.radius.full).toBe(
				canonicalDefaultTokens.radius.full,
			);
			// ...and an omitted whole category inherited its canonical default.
			expect(result.theme.tokens.spacing).toEqual(
				canonicalDefaultTokens.spacing,
			);
			expect(result.theme.tokens.motion).toEqual(
				canonicalDefaultTokens.motion,
			);
		}
	});

	it('fails AA on an INHERITED contrast pair (overrides background, inherits foreground)', () => {
		// inherited-pair-fail.json overrides ONLY color.background to a near-black
		// value. The inherited (default) color.foreground is also near-black, so
		// the foreground/background pair drops far below 4.5:1. The old
		// skip-when-a-side-is-absent path would have silently passed this; the
		// merge supplies the inherited side, so the pair is now checked.
		const result = validateTheme(inheritedPairFail);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			const contrastIssues = result.issues.filter(
				(i) => i.code === 'CONTRAST_FAILURE',
			);
			expect(contrastIssues.length).toBeGreaterThan(0);
			expect(
				contrastIssues.some((i) =>
					i.path.includes('color.foreground / color.background'),
				),
			).toBe(true);
		}
	});

	it('does not regress the color-only path: an existing valid theme still passes', () => {
		// valid-custom.json is the legacy full theme; it must keep validating.
		const result = validateTheme(validCustom);
		expect(result.ok).toBe(true);
	});

	it('rejects theme with bad contrast and returns CONTRAST_FAILURE issues', () => {
		const result = validateTheme(badContrast);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			const contrastIssues = result.issues.filter(
				(i) => i.code === 'CONTRAST_FAILURE',
			);
			expect(contrastIssues.length).toBeGreaterThan(0);
			for (const issue of contrastIssues) {
				expect(issue.ratio).toBeDefined();
				expect(issue.threshold).toBeDefined();
				expect(issue.ratio!).toBeLessThan(issue.threshold!);
			}
		}
	});

	it('accepts theme with extra tokens (forward-compatible)', () => {
		const result = validateTheme(extraTokens);
		expect(result.ok).toBe(true);
	});

	it('rejects a malformed (non-string) token value with INVALID_TYPE', () => {
		const result = validateTheme({
			name: 'malformed',
			displayName: 'Malformed',
			tokens: { radius: { sm: 42 } },
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
		}
	});

	it('rejects completely malformed input', () => {
		const result = validateTheme({ foo: 'bar' });
		expect(result.ok).toBe(false);
	});

	it('rejects null input', () => {
		const result = validateTheme(null);
		expect(result.ok).toBe(false);
	});
});

describe('checkThemeCompleteness (SC-005: MISSING_TOKEN after merge)', () => {
	it('returns no issues for a complete merged theme', () => {
		const complete = {
			name: 'complete',
			displayName: 'Complete',
			tokens: canonicalDefaultTokens,
		};
		expect(checkThemeCompleteness(complete)).toEqual([]);
	});

	it('returns a path-named MISSING_TOKEN when a required token has no inheritable default', () => {
		// Simulate the edge case from the spec: a contributor adds a schema key but
		// forgets its default, so the MERGED theme is still missing it. The real
		// canonicalDefaultTokens is complete, so we synthesize an incomplete merged
		// theme by dropping a required key, then drive the completeness mechanism
		// directly. This guards the COMPLETENESS OF THE DEFAULTS, not of every
		// consumer theme.
		const incompleteTokens = structuredClone(canonicalDefaultTokens) as Record<
			string,
			Record<string, string>
		>;
		// non-null: we just cloned a complete default set, so `color` is present.
		delete incompleteTokens.color!['primary'];

		const issues = checkThemeCompleteness({
			name: 'incomplete-defaults',
			displayName: 'Incomplete Defaults',
			tokens: incompleteTokens,
		});

		const missing = issues.filter((i) => i.code === 'MISSING_TOKEN');
		expect(missing.length).toBeGreaterThan(0);
		expect(missing.some((i) => i.path === 'tokens.color.primary')).toBe(true);
	});
});
