import type { Theme } from './schema.js';
import { contrastRatio, hexToOklch, parseColor } from './color.js';
import { contrastPairs } from './schema.js';
import { validateTheme } from './validate.js';

const THEME_STORAGE_KEY = 'unbranded-ds-theme';

/**
 * Factory that returns a self-executing JavaScript string with a
 * caller-specified fallback theme. Inline as the body of a `<script>` tag
 * in `<head>` to prevent the flash-of-wrong-theme on page reload.
 *
 * The output is deterministic across builds for any given `defaultTheme`
 * argument — consumers using SHA hash-based Content Security Policies
 * can compute the hash once and trust it across builds.
 *
 * @example
 * const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' })
 * <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
 */
export function getThemeBootstrapScript(
	options: { defaultTheme?: string } = {},
): string {
	const defaultTheme = options.defaultTheme ?? 'light';
	return `(function(){try{document.documentElement.setAttribute('data-theme',localStorage.getItem('${THEME_STORAGE_KEY}')||'${defaultTheme}')}catch(e){document.documentElement.setAttribute('data-theme','${defaultTheme}')}})()`;
}

/**
 * A self-executing JavaScript string that reads the saved theme from
 * localStorage (`unbranded-ds-theme`) and applies `data-theme` to the
 * document root before first paint. Falls back to `'light'` on missing,
 * blocked, or invalid storage.
 *
 * Inline as the body of a `<script>` tag in `<head>` to prevent the
 * flash-of-wrong-theme on page reload. Equivalent to
 * `getThemeBootstrapScript()` with no arguments.
 *
 * @example
 * <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
 */
export const themeBootstrapScript: string = getThemeBootstrapScript();

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
		this.name = 'ThemeValidationError';
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
			`Theme "${(themeJson as { name?: string }).name ?? 'unknown'}" failed validation`,
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
			const cssValue = category === 'color' ? hexToOklch(value) : value;
			if (category === 'color') {
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
		if (!fgValue || !bgValue)
			continue;

		const fgLinear = parseColor(fgValue);
		const bgLinear = parseColor(bgValue);
		if (!fgLinear || !bgLinear)
			continue;

		const ratio = contrastRatio(fgLinear, bgLinear);
		if (ratio < pair.threshold) {
			postConversionIssues.push({
				path: `${pair.foreground} / ${pair.background}`,
				code: 'CONTRAST_FAILURE',
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

	const css = `${selector} {\n${vars.join('\n')}\n}`;

	// Remove any existing style block for this theme
	const existingId = `ds-theme-${theme.name}`;
	const existing = document.getElementById(existingId);
	if (existing) {
		existing.remove();
	}

	const style = document.createElement('style');
	style.id = existingId;
	style.textContent = css;
	document.head.appendChild(style);
}
