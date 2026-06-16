import type { Axis } from './axis-constants.js';
import type { ValidationIssue } from './validate.js';
import { readdirSync } from 'node:fs';

import { join } from 'node:path';
import { AXES, AXIS_ATTRIBUTE } from './axis-constants.js';

// ---------------------------------------------------------------------------
// Theme axes (spec 009, expanded in spec 016): a COLOR-SCHEME axis (`data-color-scheme`),
// a THEME identity axis (`data-theme`), and a DENSITY axis (`data-density`). They
// compose through the cascade (color scheme is the base, theme refines it, density
// refines last).
//
// The directory is the SINGLE source of truth for a theme's axis. Color-scheme and
// density nest one level (`themes/color-scheme/<scheme>.json`, `themes/density/<name>.json`).
// The theme axis nests by identity then scheme (`themes/theme/<identity>/<scheme>.json`),
// so its axis "values" are the identity directory names. The directory name is the
// axis attribute without the `data-` prefix.
// ---------------------------------------------------------------------------

export type { Axis };
export { AXES, AXIS_ATTRIBUTE };

/**
 * The themes available on each axis, read from `themes/<axis>/*.json`.
 * `themesRoot` is the path to the `themes/` directory — cwd-relative for the
 * build (`'themes'`), resolved for the MCP and tests.
 */
export function listThemesByAxis(themesRoot: string): Record<Axis, string[]> {
	const out: Record<Axis, string[]> = { colorScheme: [], theme: [], density: [] };
	for (const axis of AXES) {
		const dir = join(themesRoot, AXIS_ATTRIBUTE[axis].replace(/^data-/, ''));
		try {
			if (axis === 'theme') {
				// The theme axis nests by identity (themes/theme/<identity>/<scheme>.json),
				// so the values are the identity directory names.
				out[axis] = readdirSync(dir, { withFileTypes: true })
					.filter((e) => e.isDirectory())
					.map((e) => e.name)
					.sort();
			}
			else {
				out[axis] = readdirSync(dir)
					.filter((f) => f.endsWith('.json'))
					.map((f) => f.replace(/\.json$/, ''))
					.sort();
			}
		}
		catch {
			// An axis directory may legitimately be absent; leave it empty.
		}
	}
	return out;
}

/** Every theme paired with its axis (a flat view of {@link listThemesByAxis}). */
export function themeAxisEntries(
	themesRoot: string,
): Array<{ name: string; axis: Axis }> {
	const byAxis = listThemesByAxis(themesRoot);
	return AXES.flatMap((axis) => byAxis[axis].map((name) => ({ name, axis })));
}

/** The axis a theme name belongs to, or `undefined` if it is not a known theme. */
export function axisOf(themesRoot: string, themeName: string): Axis | undefined {
	return themeAxisEntries(themesRoot).find((e) => e.name === themeName)?.axis;
}

// ---------------------------------------------------------------------------
// checkAxisAssignment — guard each axis slot against a wrong-axis theme (spec
// 009 FR-004). The realistic mistake is handing a theme to the wrong slot (e.g.
// the density theme `compact` to the `aesthetic` slot); for each known theme
// whose declared axis differs from its slot, emit a structured AXIS_CONFLICT.
// Unknown names are left to completeness/composition.
//
// It lives here beside `axisOf`, not in validate.ts, on purpose: it reads themes
// off disk, and keeping the only `node:fs` caller out of validate.ts is what lets
// validate.ts (and the `/runtime` entry that re-exports `registerTheme`) bundle
// for the browser. See browser-safety.test.ts.
// ---------------------------------------------------------------------------

export function checkAxisAssignment(
	themesRoot: string,
	assignment: Partial<Record<Axis, string>>,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	for (const [slot, themeName] of Object.entries(assignment) as Array<
		[Axis, string]
	>) {
		const actualAxis = axisOf(themesRoot, themeName);
		if (actualAxis && actualAxis !== slot) {
			issues.push({
				path: slot,
				code: 'AXIS_CONFLICT',
				message: `Theme "${themeName}" is a ${actualAxis} theme but was assigned to the ${slot} slot`,
			});
		}
	}
	return issues;
}
