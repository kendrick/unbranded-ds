import type { Axis } from './axis-constants.js';
import type { PartialTheme } from './schema.js';
import { AXIS_ATTRIBUTE } from './axis-constants.js';
import { DENSITY_STORAGE_KEY, THEME_PREFERENCE_STORAGE_KEY, THEME_STORAGE_KEY } from './client.js';
import { contrastRatio, hexToOklch, parseColor } from './color.js';
import { registerThemeName } from './registry.js';
import { contrastPairs } from './schema.js';
import { validateTheme } from './validate.js';

// The storage keys live in the browser-safe client entry; re-exported here so
// the bootstrap below and any existing `/runtime` consumers keep working.
export { DENSITY_STORAGE_KEY, THEME_PREFERENCE_STORAGE_KEY, THEME_STORAGE_KEY };

/**
 * Factory that returns a self-executing JavaScript string with
 * caller-specified fallbacks. Inline as the body of a `<script>` tag in
 * `<head>` to prevent the flash-of-wrong-theme on page reload.
 *
 * Sets BOTH axes before paint (spec 009): `data-theme` from the aesthetic
 * storage key and `data-density` from the density key. They're applied
 * together so a composed selection (e.g. a density refinement of an
 * aesthetic base) lands in one synchronous pass — neither axis flashes
 * while the other resolves.
 *
 * The output is deterministic across builds for any given options object —
 * consumers using SHA hash-based Content Security Policies can compute the
 * hash once and trust it across builds.
 *
 * @example
 * const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' })
 * <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
 */
export function getThemeBootstrapScript(
	options: { defaultTheme?: string; defaultDensity?: string } = {},
): string {
	const defaultTheme = options.defaultTheme ?? 'light';
	const defaultDensity = options.defaultDensity ?? 'comfortable';
	const d = 'document.documentElement';
	// One try wraps both reads: if storage throws (blocked cookies, privacy
	// mode), both axes fall back rather than leaving one axis unset.
	return `(function(){try{${d}.setAttribute('data-theme',localStorage.getItem('${THEME_STORAGE_KEY}')||'${defaultTheme}');${d}.setAttribute('data-density',localStorage.getItem('${DENSITY_STORAGE_KEY}')||'${defaultDensity}')}catch(e){${d}.setAttribute('data-theme','${defaultTheme}');${d}.setAttribute('data-density','${defaultDensity}')}})()`;
}

/**
 * A self-executing JavaScript string that reads the saved aesthetic theme
 * (`unbranded-ds-theme`) and density (`unbranded-ds-density`) from
 * localStorage and applies `data-theme` / `data-density` to the document
 * root before first paint. Falls back to `'light'` / `'comfortable'` on
 * missing, blocked, or invalid storage.
 *
 * Inline as the body of a `<script>` tag in `<head>` to prevent the
 * flash-of-wrong-theme on page reload. Equivalent to
 * `getThemeBootstrapScript()` with no arguments.
 *
 * @example
 * <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
 */
export const themeBootstrapScript: string = getThemeBootstrapScript();

// ---------------------------------------------------------------------------
// CSS variable naming. Every category emits `--<category>-<key>` EXCEPT motion:
// the Style Dictionary build special-cases motion to Tailwind's namespaces
// (`--duration-*` for durations, `--ease-*` for easings) so they generate real
// `ease-*` utilities rather than dead `--motion-*` vars. Runtime injection must
// match those names exactly, or a registered theme's motion override would emit
// `--motion-duration-fast` that nothing in the built CSS reads. The schema's
// motion keys are flat (`duration-fast`, `easing-standard`), so the mapping is
// a prefix swap: `duration-` stays, `easing-` becomes `ease-`.
// ---------------------------------------------------------------------------

function cssVarName(category: string, key: string): string {
	if (category === 'motion') {
		if (key.startsWith('easing-'))
			return `--ease-${key.slice('easing-'.length)}`;
		// durations (and any other flat motion key) keep their key verbatim,
		// matching the build's `--duration-*` namespace.
		return `--${key}`;
	}
	return `--${category}-${key}`;
}

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
 * Validates a theme and injects a `<style>` block scoped to the given axis's
 * attribute selector into the document head.
 *
 * `axis` (spec 009 FR-001) chooses the attribute the block keys on:
 * `'aesthetic'` (the default) emits under `[data-theme="<name>"]` exactly as
 * before — single-arg callers are untouched (FR-005) — while `'density'` emits
 * under `[data-density="<name>"]`. The two blocks compose through the CSS
 * cascade: registering an aesthetic and a density theme yields two independently
 * keyed `<style>` blocks, and the build's `@layer` order lets density win a
 * per-var collision. There is no JS-side composition here — each axis block
 * carries its OWN resolved vars (equal to `resolveTheme(partial)`), so parity
 * with the resolver holds per block.
 *
 * Accepts a PARTIAL theme (spec 008 US2): any subset of categories/keys. It is
 * resolved against the canonical defaults before validation and injection, so a
 * partial override still emits the full merged var set. A complete `Theme` is
 * assignable to `PartialTheme`, so existing full-theme callers are unaffected.
 *
 * Throws `ThemeValidationError` if the theme fails validation.
 */
export function registerTheme(
	themeJson: PartialTheme,
	axis: Axis = 'aesthetic',
): void {
	const result = validateTheme(themeJson);

	if (!result.ok) {
		throw new ThemeValidationError(
			`Theme "${(themeJson as { name?: string }).name ?? 'unknown'}" failed validation`,
			result.issues,
		);
	}

	// validateTheme now returns the RESOLVED (merged) theme: a partial override
	// layered onto the canonical defaults. Iterating it injects the FULL var set,
	// so a color-only theme still emits every spacing/radius/motion var rather
	// than only the keys the consumer touched.
	const { theme } = result;
	const selector = `[${AXIS_ATTRIBUTE[axis]}="${theme.name}"]`;

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
			vars.push(`  ${cssVarName(category, key)}: ${cssValue};`);
		}
	}

	// Verify contrast still passes on the converted oklch values. The merged
	// theme always carries the full color set, so every pair resolves — the old
	// skip-when-a-side-is-absent path is gone (it silently passed a failing pair
	// when a partial theme overrode only one side).
	const postConversionIssues: Array<{ path: string; code: string; message: string }> = [];
	for (const pair of contrastPairs) {
		const fgValue = convertedColors[pair.foreground];
		const bgValue = convertedColors[pair.background];

		const fgLinear = fgValue ? parseColor(fgValue) : null;
		const bgLinear = bgValue ? parseColor(bgValue) : null;
		// Unparseable converted color (not a missing side) — nothing to compare.
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

	// Remove any existing style block for this (axis, theme). The id is keyed on
	// the axis attribute so an aesthetic and a density theme that happen to share
	// a name produce two distinct blocks the cascade can compose, rather than one
	// clobbering the other. The aesthetic default keeps the historical
	// `ds-theme-<name>` id (FR-005) — existing lookups by that id still resolve.
	const existingId = `ds-${AXIS_ATTRIBUTE[axis].replace(/^data-/, '')}-${theme.name}`;
	const existing = document.getElementById(existingId);
	if (existing) {
		existing.remove();
	}

	const style = document.createElement('style');
	style.id = existingId;
	style.textContent = css;
	document.head.appendChild(style);

	// Record the name so themesForAxis() (spec 011) reflects this runtime theme,
	// keeping the data-driven toggles in sync with what is actually registered.
	registerThemeName(axis, theme.name);
}
