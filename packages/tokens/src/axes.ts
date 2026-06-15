import type { Axis } from './axis-constants.js';
import type { ValidationIssue } from './validate.js';
import { readdirSync } from 'node:fs';

import { join } from 'node:path';
import { AXES, AXIS_ATTRIBUTE } from './axis-constants.js';

// ---------------------------------------------------------------------------
// Theme axes (spec 009). The fixed set for this spec: an AESTHETIC axis applied
// via `data-theme`, and a DENSITY axis applied via `data-density`. Density wins
// a collision (density refines an aesthetic base). Consumer-defined axes are a
// later spec.
//
// A theme declares its axis by the directory it lives in: `themes/<axis>/<name>.json`.
// That directory is the SINGLE source of truth the build, the MCP loader, and the
// validator all read, so they can never disagree about a theme's axis.
// ---------------------------------------------------------------------------

export type { Axis };
export { AXES, AXIS_ATTRIBUTE };

/**
 * The themes available on each axis, read from `themes/<axis>/*.json`.
 * `themesRoot` is the path to the `themes/` directory — cwd-relative for the
 * build (`'themes'`), resolved for the MCP and tests.
 */
export function listThemesByAxis(themesRoot: string): Record<Axis, string[]> {
	const out: Record<Axis, string[]> = { aesthetic: [], density: [] };
	for (const axis of AXES) {
		try {
			out[axis] = readdirSync(join(themesRoot, axis))
				.filter((f) => f.endsWith('.json'))
				.map((f) => f.replace(/\.json$/, ''))
				.sort();
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
