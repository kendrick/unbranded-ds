import { validateTheme } from "./validate.js";
import type { Theme } from "./schema.js";
import { hexToOklch, parseColor, contrastRatio } from "./color.js";
import { contrastPairs } from "./schema.js";

export class ThemeValidationError extends Error {
	constructor(
		message: string,
		public readonly issues: Array<{
			path: string;
			code: string;
			message: string;
		}>,
	) {
		super(message);
		this.name = "ThemeValidationError";
	}
}

/**
 * Validates a theme and injects a `<style>` block scoped to
 * `[data-theme="<name>"]` into the document head.
 *
 * Throws `ThemeValidationError` if the theme fails validation.
 */
export function registerTheme(themeJson: Theme): void {
	const result = validateTheme(themeJson);

	if (!result.ok) {
		throw new ThemeValidationError(
			`Theme "${(themeJson as { name?: string }).name ?? "unknown"}" failed validation`,
			result.issues,
		);
	}

	const { theme } = result;
	const selector = `[data-theme="${theme.name}"]`;

	const vars: string[] = [];
	const tokens = theme.tokens as Record<string, Record<string, string>>;

	// Convert colors and collect converted values for post-conversion contrast check
	const convertedColors: Record<string, string> = {};

	for (const [category, group] of Object.entries(tokens)) {
		for (const [key, value] of Object.entries(group)) {
			const cssValue = category === "color" ? hexToOklch(value) : value;
			if (category === "color") {
				convertedColors[`color.${key}`] = cssValue;
			}
			vars.push(`  --${category}-${key}: ${cssValue};`);
		}
	}

	// Verify contrast still passes on the converted oklch values
	const postConversionIssues: Array<{ path: string; code: string; message: string }> = [];
	for (const pair of contrastPairs) {
		const fgValue = convertedColors[pair.foreground];
		const bgValue = convertedColors[pair.background];
		if (!fgValue || !bgValue) continue;

		const fgLinear = parseColor(fgValue);
		const bgLinear = parseColor(bgValue);
		if (!fgLinear || !bgLinear) continue;

		const ratio = contrastRatio(fgLinear, bgLinear);
		if (ratio < pair.threshold) {
			postConversionIssues.push({
				path: `${pair.foreground} / ${pair.background}`,
				code: "CONTRAST_FAILURE",
				message: `Post-conversion contrast ratio ${ratio.toFixed(2)}:1 is below ${pair.threshold}:1 threshold`,
			});
		}
	}

	if (postConversionIssues.length > 0) {
		throw new ThemeValidationError(
			`Theme "${theme.name}" passes validation but converted oklch values fail contrast`,
			postConversionIssues,
		);
	}

	const css = `${selector} {\n${vars.join("\n")}\n}`;

	// Remove any existing style block for this theme
	const existingId = `ds-theme-${theme.name}`;
	const existing = document.getElementById(existingId);
	if (existing) {
		existing.remove();
	}

	const style = document.createElement("style");
	style.id = existingId;
	style.textContent = css;
	document.head.appendChild(style);
}
