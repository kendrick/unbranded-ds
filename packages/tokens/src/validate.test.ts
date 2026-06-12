import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import badContrast from './__fixtures__/bad-contrast.json';
import extraTokens from './__fixtures__/extra-tokens.json';
import inheritedPairFail from './__fixtures__/inherited-pair-fail.json';
import partialTheme from './__fixtures__/partial-theme.json';
import validCustom from './__fixtures__/valid-custom.json';
import { canonicalDefaultTokens } from './defaults.js';
import type { ResolvedLayer } from './resolve.js';
import {
	checkAxisAssignment,
	checkThemeCompleteness,
	validateComposedTheme,
	validateTheme,
} from './validate';

// The on-disk themes/ directory: themes declare their axis by living in
// themes/<axis>/, which is what checkAxisAssignment reads through axisOf.
const themesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'themes');

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

// --- Composed multi-axis validation (spec 009 FR-002) ----------------------

describe('validateComposedTheme', () => {
	it('fails AA loudly when a density layer drags the composed pair below AA', () => {
		// The aesthetic layer is contrast-safe on its own (light fg on dark bg).
		// The density layer has no business touching color, but if it overrides
		// foreground to a near-background value the COMPOSED pair collapses — and
		// because density wins, the bad value survives onto the composed result.
		// That cross-axis hazard is exactly what FR-002 makes us catch.
		// ResolvedLayers as the build emits them: flat override objects (spec 014).
		const aesthetic = {
			color: { background: '#1a1a1a', foreground: '#f5f5f5' },
		} as unknown as ResolvedLayer;
		// near-black foreground on the inherited near-black background
		const density = {
			color: { foreground: '#202020' },
		} as unknown as ResolvedLayer;

		const result = validateComposedTheme([aesthetic, density]);
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
			for (const issue of contrastIssues) {
				expect(issue.ratio).toBeDefined();
				expect(issue.threshold).toBeDefined();
				expect(issue.ratio!).toBeLessThan(issue.threshold!);
			}
		}
	});

	it('accepts a clean composition of two disjoint, contrast-safe layers', () => {
		// An aesthetic layer touching only color (kept AA-safe) and a density layer
		// touching only spacing — disjoint, so nothing collides and the composed
		// result inherits the canonical defaults everywhere else.
		const aesthetic = {
			color: { background: '#ffffff', foreground: '#111111' },
		} as unknown as ResolvedLayer;
		const density = {
			spacing: { 1: '0.2rem', 2: '0.4rem' },
		} as unknown as ResolvedLayer;

		const result = validateComposedTheme([aesthetic, density]);
		expect(result.ok).toBe(true);
		if (result.ok) {
			// Density's spacing delta took effect...
			expect(result.theme.tokens.spacing['1']).toBe('0.2rem');
			// ...the aesthetic's color delta took effect...
			expect(result.theme.tokens.color.background).toBe('#ffffff');
			// ...and an untouched category inherited the canonical default.
			expect(result.theme.tokens.motion).toEqual(canonicalDefaultTokens.motion);
		}
	});
});

// --- Axis assignment guard (spec 009 FR-004) -------------------------------

describe('checkAxisAssignment', () => {
	it('flags AXIS_CONFLICT when a density theme is assigned to the aesthetic slot', () => {
		// `compact` lives in themes/density/, so handing it to the aesthetic slot
		// is a wrong-axis assignment.
		const issues = checkAxisAssignment(themesRoot, { aesthetic: 'compact' });
		expect(issues.length).toBe(1);
		expect(issues[0]!.code).toBe('AXIS_CONFLICT');
		expect(issues[0]!.path).toBe('aesthetic');
	});

	it('returns no issues for a correct aesthetic+density assignment', () => {
		// vaporwave is an aesthetic theme, compact is a density theme — both in slot.
		const issues = checkAxisAssignment(themesRoot, {
			aesthetic: 'vaporwave',
			density: 'compact',
		});
		expect(issues).toEqual([]);
	});
});
