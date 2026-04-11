import { type ZodIssue } from "zod";
import { themeSchema, contrastPairs, type Theme } from "./schema.js";
import { parseColor, contrastRatio } from "./color.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ValidationIssue = {
	path: string;
	code:
		| "MISSING_TOKEN"
		| "INVALID_TYPE"
		| "UNKNOWN_TOKEN"
		| "CONTRAST_FAILURE";
	message: string;
	expected?: string;
	actual?: string;
	ratio?: number;
	threshold?: number;
};

export type ValidationResult =
	| { ok: true; theme: Theme }
	| { ok: false; issues: ValidationIssue[] };

// ---------------------------------------------------------------------------
// Resolve a dot-path like "color.primary" to the token value in the theme
// ---------------------------------------------------------------------------

function resolveTokenValue(theme: Theme, dotPath: string): string | undefined {
	const [category, ...rest] = dotPath.split(".");
	const key = rest.join(".");
	const group = (theme.tokens as Record<string, Record<string, string>>)[
		category ?? ""
	];
	return group?.[key];
}

// ---------------------------------------------------------------------------
// validateTheme
// ---------------------------------------------------------------------------

export function validateTheme(themeJson: unknown): ValidationResult {
	// 1. Schema validation via Zod
	const result = themeSchema.safeParse(themeJson);

	if (!result.success) {
		const issues: ValidationIssue[] = result.error.issues.map(
			(issue: ZodIssue) => {
				const path = issue.path.join(".");
				if (issue.code === "invalid_type" && issue.received === "undefined") {
					return {
						path,
						code: "MISSING_TOKEN" as const,
						message: `Missing required token: ${path}`,
						expected: issue.expected,
					};
				}
				return {
					path,
					code: "INVALID_TYPE" as const,
					message: issue.message,
					expected:
						"expected" in issue ? String(issue.expected) : undefined,
					actual: "received" in issue ? String(issue.received) : undefined,
				};
			},
		);
		return { ok: false, issues };
	}

	const theme = result.data;

	// 2. Contrast checking for all declared pairs (supports hex and oklch)
	const contrastIssues: ValidationIssue[] = [];

	for (const pair of contrastPairs) {
		const fgValue = resolveTokenValue(theme, pair.foreground);
		const bgValue = resolveTokenValue(theme, pair.background);

		if (!fgValue || !bgValue) continue;

		const fgLinear = parseColor(fgValue);
		const bgLinear = parseColor(bgValue);

		if (!fgLinear || !bgLinear) continue;

		const ratio = contrastRatio(fgLinear, bgLinear);
		if (ratio < pair.threshold) {
			contrastIssues.push({
				path: `${pair.foreground} / ${pair.background}`,
				code: "CONTRAST_FAILURE",
				message: `Contrast ratio ${ratio.toFixed(2)}:1 is below the required ${pair.threshold}:1 threshold`,
				ratio: Math.round(ratio * 100) / 100,
				threshold: pair.threshold,
			});
		}
	}

	if (contrastIssues.length > 0) {
		return { ok: false, issues: contrastIssues };
	}

	return { ok: true, theme };
}
