import { validateTheme } from "./validate.js";
import type { Theme } from "./schema.js";
import { hexToOklch } from "./color.js";

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

	for (const [category, group] of Object.entries(tokens)) {
		for (const [key, value] of Object.entries(group)) {
			// Normalize hex → oklch for color tokens; pass others through
			const cssValue = category === "color" ? hexToOklch(value) : value;
			vars.push(`  --${category}-${key}: ${cssValue};`);
		}
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
