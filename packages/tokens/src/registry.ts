import type { Axis } from './axis-constants.js';

// ---------------------------------------------------------------------------
// Browser-safe theme registry (spec 011). `listThemesByAxis` in axes.ts reads
// the filesystem and is Node-only (build, MCP, tests). The runtime hook and the
// data-driven toggles need the value lists in the browser, so the built-in
// names are maintained here as plain data and runtime registrations are tracked
// in memory. No `node:fs`, no `document`.
//
// A built-in axis includes its file-less default: density's `comfortable` is
// the base token set with no override JSON, but it is a first-class selectable
// value, so it appears here and leads the list (spec 011 FR-004, clarify Q4).
// ---------------------------------------------------------------------------

const BUILT_IN_THEMES: Record<Axis, readonly string[]> = {
	aesthetic: ['light', 'dark', 'brand', 'vaporwave'],
	density: ['comfortable', 'compact'],
};

// Themes added at runtime via `registerTheme`, per axis. `registerTheme` calls
// `registerThemeName` so a consumer's custom theme shows up in `themesForAxis`
// (and therefore the toggles) without any extra wiring (clarify Q3).
const runtimeThemes: Record<Axis, Set<string>> = {
	aesthetic: new Set(),
	density: new Set(),
};

/**
 * Record a theme name as available on an axis. Called by `registerTheme` after
 * a theme validates, so the data-driven toggles stay in sync with what is
 * actually registered.
 */
export function registerThemeName(axis: Axis, name: string): void {
	runtimeThemes[axis].add(name);
}

/**
 * The values available on an axis: the built-in names (including the file-less
 * default, default first) plus anything registered at runtime, de-duplicated
 * and order-stable. Browser-safe. This is the source of truth for
 * `useTheme().available` and the data-driven toggles (spec 011 FR-004/FR-012).
 */
export function themesForAxis(axis: Axis): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const name of [...BUILT_IN_THEMES[axis], ...runtimeThemes[axis]]) {
		if (!seen.has(name)) {
			seen.add(name);
			out.push(name);
		}
	}
	return out;
}
