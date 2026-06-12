/**
 * Multi-axis composition for the token-query MCP (spec 009).
 *
 * The three resolving tools (`lookupToken`, `palette`, `contrast`) all take the
 * same axis-object input and resolve it the same way: fold each named axis
 * through `composeTokens`, density last so it wins a collision. Centralizing
 * that here keeps the tools from each growing their own merge. Each axis's values
 * come from the build's emitted resolved-delta artifact (spec 014) — the MCP
 * reads Style Dictionary's output rather than re-resolving raw DTCG.
 */

import type { ResolvedLayer } from '../resolve.js';

import { z } from 'zod';
import { composeTokens } from '../resolve.js';
import { DEFAULT_THEME, getResolvedDelta } from './themes.js';

// `ResolvedTokens` is the flat composed shape Theme['tokens'] resolves to:
// { [category]: { [flatKey]: string } }. composeTokens returns it; we never
// import the Theme type here to keep the MCP off the schema surface.
type ResolvedTokens = ReturnType<typeof composeTokens>;

/**
 * The axis-object input shared by every resolving tool. Either slot is optional;
 * omit one to skip that axis. Both omitted falls back to the package default
 * aesthetic (see `composeAxes`), so single-axis callers keep working unchanged.
 */
export const themeAxesSchema = z
	.object({
		aesthetic: z.string().optional(),
		density: z.string().optional(),
	})
	.optional()
	.describe(
		'Theme axes to resolve against. `aesthetic` (data-theme) sets the base palette/type; `density` (data-density) refines spacing and wins collisions. Omit a key to skip that axis; omit the object for the default light aesthetic.',
	);

export type ThemeAxes = z.infer<typeof themeAxesSchema>;

/**
 * Resolve an axis object into a single composed token tree. Empty input defaults
 * to the package aesthetic so a bare call still resolves a real theme. Layers are
 * pushed aesthetic-then-density so density wins (it refines an aesthetic base);
 * an axis naming a theme we don't have is reported in `unknownAxes` rather than
 * thrown, so the remaining axes still resolve.
 */
export async function composeAxes(
	axes: ThemeAxes,
): Promise<{ composed: ResolvedTokens; unknownAxes: string[] }> {
	const requested
		= axes && (axes.aesthetic || axes.density)
			? axes
			: { aesthetic: DEFAULT_THEME };

	const layers: ResolvedLayer[] = [];
	const unknownAxes: string[] = [];

	// Order is load-bearing: density LAST so a density theme's keys win over the
	// aesthetic's, matching the CSS cascade (aesthetic base, density delta on top).
	for (const name of [requested.aesthetic, requested.density]) {
		if (!name)
			continue;
		const delta = await getResolvedDelta(name);
		if (delta)
			layers.push(delta);
		else
			unknownAxes.push(name);
	}

	return { composed: composeTokens(layers), unknownAxes };
}

/**
 * Read a dot-path token out of the flat composed tree. This is the single bridge
 * between dot-paths (`color.primary`, `motion.duration.fast`, `shadow.neon`) and
 * the two-level composed shape: the first segment is the category, the rest joins
 * with `-` to form the flat key the resolver emits (`duration.fast` → `duration-fast`).
 */
export function flatValueOf(
	composed: ResolvedTokens,
	dotPath: string,
): string | undefined {
	const segments = dotPath.split('.');
	const category = segments[0] ?? '';
	const flatKey = segments.slice(1).join('-');
	return (composed as Record<string, Record<string, string> | undefined>)[category]?.[flatKey];
}
