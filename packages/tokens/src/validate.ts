import type { ZodIssue } from 'zod';
import type { Theme } from './schema.js';
import { contrastRatio, parseColor } from './color.js';
import { resolveTheme } from './resolve.js';
import { contrastPairs, partialThemeSchema, themeSchema } from './schema.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ValidationIssue {
	path: string;
	code:
		| 'MISSING_TOKEN'
		| 'INVALID_TYPE'
		| 'UNKNOWN_TOKEN'
		| 'CONTRAST_FAILURE';
	message: string;
	expected?: string;
	actual?: string;
	ratio?: number;
	threshold?: number;
}

export type ValidationResult
	= | { ok: true; theme: Theme }
		| { ok: false; issues: ValidationIssue[] };

// ---------------------------------------------------------------------------
// Resolve a dot-path like "color.primary" to the token value in the theme
// ---------------------------------------------------------------------------

function resolveTokenValue(theme: Theme, dotPath: string): string | undefined {
	const [category, ...rest] = dotPath.split('.');
	const key = rest.join('.');
	const group = (theme.tokens as Record<string, Record<string, string>>)[
		category ?? ''
	];
	return group?.[key];
}

// ---------------------------------------------------------------------------
// Map a Zod issue to a structured ValidationIssue (Section XI.4).
// ---------------------------------------------------------------------------

function zodIssueToValidationIssue(issue: ZodIssue): ValidationIssue {
	const path = issue.path.join('.');
	if (issue.code === 'invalid_type' && issue.received === 'undefined') {
		return {
			path,
			code: 'MISSING_TOKEN',
			message: `Missing required token: ${path}`,
			expected: issue.expected,
		};
	}
	return {
		path,
		code: 'INVALID_TYPE',
		message: issue.message,
		expected: 'expected' in issue ? String(issue.expected) : undefined,
		actual: 'received' in issue ? String(issue.received) : undefined,
	};
}

// ---------------------------------------------------------------------------
// checkThemeCompleteness — validate an already-MERGED theme against the strict
// schema. A required token absent from the merged result (i.e. absent from both
// the override and the defaults) surfaces as a structured MISSING_TOKEN naming
// the path. Exported so SC-005 can drive the mechanism with a synthetically
// incomplete merged theme — the real `canonicalDefaultTokens` is complete, so
// this path never fires through `validateTheme` in production.
// ---------------------------------------------------------------------------

export function checkThemeCompleteness(mergedTheme: unknown): ValidationIssue[] {
	const strict = themeSchema.safeParse(mergedTheme);
	if (strict.success)
		return [];
	return strict.error.issues.map(zodIssueToValidationIssue);
}

// ---------------------------------------------------------------------------
// validateTheme — resolve-then-validate (spec 008 US2).
//
// The input is a PARTIAL runtime theme: any subset of categories/keys. We parse
// it leniently, merge the override onto the canonical defaults, then validate
// the COMPLETE merged result for completeness and WCAG AA contrast. Returning
// the RESOLVED theme (not the raw input) is load-bearing: registerTheme injects
// the full merged var set so a partial override still yields a complete
// `<style>` block.
// ---------------------------------------------------------------------------

export function validateTheme(themeJson: unknown): ValidationResult {
	// 1. Lenient parse: a partial override (color-only, color+radius, etc.) is a
	//    valid SHAPE. Shape errors (wrong type, malformed value) surface here.
	const parsed = partialThemeSchema.safeParse(themeJson);

	if (!parsed.success) {
		return {
			ok: false,
			issues: parsed.error.issues.map(zodIssueToValidationIssue),
		};
	}

	// 2. Resolve the override onto the defaults — the override wins per-key.
	const resolvedTokens = resolveTheme(parsed.data.tokens);
	const resolvedTheme: Theme = {
		...parsed.data,
		tokens: resolvedTokens,
	} as Theme;

	// 3. Completeness: validate the MERGED result against the strict schema. A
	//    required token absent from both the override AND the defaults yields a
	//    structured MISSING_TOKEN naming the path — with complete defaults this
	//    only fires if the defaults themselves are incomplete (SC-005).
	const completenessIssues = checkThemeCompleteness(resolvedTheme);
	if (completenessIssues.length > 0) {
		return { ok: false, issues: completenessIssues };
	}

	const theme = resolvedTheme;

	// 4. Contrast: read BOTH sides of every pair from the merged theme. There is
	//    no longer a skip-when-a-side-is-absent path — after the merge, both
	//    sides always resolve (a theme that overrode one side is checked against
	//    the inherited other side).
	const contrastIssues: ValidationIssue[] = [];

	for (const pair of contrastPairs) {
		const fgValue = resolveTokenValue(theme, pair.foreground);
		const bgValue = resolveTokenValue(theme, pair.background);

		const fgLinear = fgValue ? parseColor(fgValue) : null;
		const bgLinear = bgValue ? parseColor(bgValue) : null;

		// Unparseable color strings (not a missing side) — nothing to compare.
		if (!fgLinear || !bgLinear)
			continue;

		const ratio = contrastRatio(fgLinear, bgLinear);
		if (ratio < pair.threshold) {
			contrastIssues.push({
				path: `${pair.foreground} / ${pair.background}`,
				code: 'CONTRAST_FAILURE',
				message: `Contrast ratio ${ratio.toFixed(2)}:1 is below the required ${pair.threshold}:1 threshold`,
				ratio: Math.round(ratio * 100) / 100,
				threshold: pair.threshold,
			});
		}
	}

	if (contrastIssues.length > 0) {
		return { ok: false, issues: contrastIssues };
	}

	// 5. Return the MERGED theme so the caller injects the full var set.
	return { ok: true, theme };
}
