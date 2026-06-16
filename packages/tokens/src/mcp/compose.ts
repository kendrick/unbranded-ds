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
import { getResolvedDelta } from './themes.js';

// `ResolvedTokens` is the flat composed shape Theme['tokens'] resolves to:
// { [category]: { [flatKey]: string } }. composeTokens returns it; we never
// import the Theme type here to keep the MCP off the schema surface.
type ResolvedTokens = ReturnType<typeof composeTokens>;

/**
 * The axis-object input shared by every resolving tool (spec 016, three axes).
 * Every slot is optional; omit one to skip that axis, omit the object for the
 * base (light, default identity, comfortable). `colorScheme` sets the light/dark
 * base, `theme` the aesthetic identity that refines it, `density` refines both.
 */
export const themeAxesSchema = z
	.object({
		colorScheme: z.string().optional(),
		theme: z.string().optional(),
		density: z.string().optional(),
	})
	.optional()
	.describe(
		'Theme axes to resolve against. `colorScheme` (data-color-scheme) is the light/dark base; `theme` (data-theme) is the aesthetic identity that refines it; `density` (data-density) refines spacing and wins collisions. Omit a key to skip that axis; omit the object for the base light/default palette.',
	);

export type ThemeAxes = z.infer<typeof themeAxesSchema>;

/**
 * Resolve an axis object into a single composed token tree. Empty input is the
 * base (light scheme, default identity, comfortable density) — `composeTokens([])`
 * over the canonical defaults. Layers fold in cascade order [colorScheme, theme,
 * density] so an identity refines the color-scheme base and density wins both.
 *
 * The file-less defaults (`light`, `default`, `comfortable`) contribute no delta —
 * the base already carries them — so they are skipped, not reported unknown. The
 * theme delta is the per-combination artifact `<identity>-<scheme>` (the scheme
 * defaults to `light` when only an identity is named). An axis whose delta is
 * missing is reported in `unknownAxes` rather than thrown.
 */
export async function composeAxes(
	axes: ThemeAxes,
): Promise<{ composed: ResolvedTokens; unknownAxes: string[] }> {
	const colorScheme = axes?.colorScheme;
	const theme = axes?.theme;
	const density = axes?.density;

	const layers: ResolvedLayer[] = [];
	const unknownAxes: string[] = [];

	const push = async (deltaName: string, reportAs: string): Promise<void> => {
		const delta = await getResolvedDelta(deltaName);
		if (delta)
			layers.push(delta);
		else
			unknownAxes.push(reportAs);
	};

	// Color scheme first (the base). `light` is the file-less base — no delta.
	if (colorScheme && colorScheme !== 'light')
		await push(colorScheme, colorScheme);
	// Then the identity, as the per-combination cell. `default` has no file.
	if (theme && theme !== 'default')
		await push(`${theme}-${colorScheme ?? 'light'}`, theme);
	// Density last so it wins a collision. `comfortable` is the file-less base.
	if (density && density !== 'comfortable')
		await push(density, density);

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
