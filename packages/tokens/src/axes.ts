import { readdirSync } from 'node:fs';
import { join } from 'node:path';

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

export type Axis = 'aesthetic' | 'density';

export const AXES: readonly Axis[] = ['aesthetic', 'density'];

/** The DOM attribute each axis is applied through. */
export const AXIS_ATTRIBUTE: Record<Axis, string> = {
	aesthetic: 'data-theme',
	density: 'data-density',
};

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
