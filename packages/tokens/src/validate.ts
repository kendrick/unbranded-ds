import type { ZodIssue } from 'zod';
import type { ResolvedLayer } from './resolve.js';
import type { Theme } from './schema.js';
import { contrastRatio, parseColor } from './color.js';
import { composeTokens, resolveTheme } from './resolve.js';
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
		| 'CONTRAST_FAILURE'
		// AXIS_CONFLICT — a theme assigned to the wrong axis slot (spec 009 FR-004),
		// e.g. the density theme `compact` handed to the `aesthetic` slot.
		| 'AXIS_CONFLICT';
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

	// 2. Resolve the override onto the defaults — the override wins per-key — then
	//    hand the COMPLETE token set to the shared completeness + contrast checks.
	const resolvedTokens = resolveTheme(parsed.data.tokens);
	return validateResolved(
		resolvedTokens,
		parsed.data.name,
		parsed.data.displayName,
		// Carry any passthrough fields (parsed.data may hold more than name/tokens)
		// so the returned theme is byte-for-byte what the old inline flow produced.
		parsed.data,
	);
}

// ---------------------------------------------------------------------------
// validateResolved — completeness + WCAG-contrast on ANY complete token set,
// whether it came from a single resolved theme or a composed multi-axis result
// (spec 009 FR-002). The completeness check guards the DEFAULTS (a required key
// with no inheritable default surfaces as MISSING_TOKEN); contrast runs on the
// merged pairs, so an overridden side is checked against an inherited side.
// ---------------------------------------------------------------------------

export function validateResolved(
	resolvedTokens: Theme['tokens'],
	name: string,
	displayName: string,
	// Optional passthrough source (e.g. the parsed partial) whose extra fields are
	// preserved on the returned theme; defaults to the bare identity pair.
	source: Record<string, unknown> = { name, displayName },
): ValidationResult {
	const theme: Theme = {
		...source,
		name,
		displayName,
		tokens: resolvedTokens,
	} as Theme;

	// Completeness: validate the MERGED result against the strict schema. A
	// required token absent from both the override AND the defaults yields a
	// structured MISSING_TOKEN naming the path — with complete defaults this
	// only fires if the defaults themselves are incomplete (SC-005).
	const completenessIssues = checkThemeCompleteness(theme);
	if (completenessIssues.length > 0) {
		return { ok: false, issues: completenessIssues };
	}

	// Contrast: read BOTH sides of every pair from the merged theme. There is
	// no longer a skip-when-a-side-is-absent path — after the merge, both sides
	// always resolve (a theme that overrode one side is checked against the
	// inherited other side).
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

	// Return the MERGED theme so the caller injects the full var set.
	return { ok: true, theme };
}

// ---------------------------------------------------------------------------
// validateComposedTheme — completeness + contrast on a COMPOSED multi-axis
// result (spec 009 FR-002). Compose the ordered layers (later wins per key, so
// pass `[aesthetic, density]` to let density refine the aesthetic base), then
// run the same checks validateTheme uses. This is what makes contrast fire on
// the COMPOSED pairs: if a density layer drags an aesthetic's foreground/
// background pair below AA, it fails loudly here rather than silently shipping.
// ---------------------------------------------------------------------------

export function validateComposedTheme(
	layers: ResolvedLayer[],
	name = 'composed',
	displayName = 'Composed Theme',
): ValidationResult {
	return validateResolved(composeTokens(layers), name, displayName);
}
