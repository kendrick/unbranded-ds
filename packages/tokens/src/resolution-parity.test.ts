import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { composeAxes } from './mcp/compose.js';
import { getTheme, loadThemes } from './mcp/themes.js';
import { composeTokens, dtcgToResolved, type ResolvedLayer } from './resolve.js';
import { tokenMap } from './token-map.js';
import { validateComposedTheme } from './validate.js';

// ---------------------------------------------------------------------------
// Resolution-parity oracle (spec 009 T020, research D9).
//
// The one cross-surface backstop. For every (aesthetic × density) combination
// and every token, three views of "the value of token T under these axes" must
// agree:
//   1. composeTokens(...)            — the JS resolver
//   2. the emitted dist CSS cascade  — the build (@layer ds-aesthetic < ds-density)
//   3. composeAxes(...)              — the MCP's resolver
//
// This converts the multi-engine invariant from "hope" to "fails CI on the next
// commit." It services the interest on the inherited debt (two resolution
// engines: Style Dictionary at build, the JS resolver everywhere else); the
// principal is the resolution-unification follow-up, after which this file is
// deleted.
//
// Honest scope: Style Dictionary INTENTIONALLY transforms values for CSS (ms→s,
// oklch number normalization, whitespace). So the CSS arm compares SEMANTICALLY
// via `normalize`, not byte-for-byte. Two categories whose CSS transform
// restructures the value beyond number/unit formatting — `shadow` (shorthand
// reorder) and typography font families (quoting) — are covered by the MCP arm
// (exact, raw values) and excluded from the CSS value arm; that exact-string
// gap across engines is precisely what the follow-up spec removes.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const cssDir = resolve(here, '..', 'dist', 'css');

const AESTHETICS = ['light', 'dark', 'brand', 'vaporwave'] as const;
const DENSITIES = [undefined, 'compact'] as const;

// SD reformats these categories structurally (not just number/unit) — assert
// them via the MCP arm, not the CSS value arm.
const CSS_VALUE_EXCLUDED = new Set(['shadow', 'typography-font']);

/** Semantic normalization: collapse the formatting Style Dictionary applies so
 * the CSS arm tests real divergence, not cosmetic transforms. ms→s, then every
 * number to its parsed form (strips trailing zeros), then whitespace. */
function normalize(value: string): string {
	return value
		.toLowerCase()
		.replace(/(\d+(?:\.\d+)?)ms\b/g, (_, n) => `${parseFloat(n) / 1000}s`)
		.replace(/-?\d+(?:\.\d+)?/g, (n) => String(parseFloat(n)))
		.replace(/\s+/g, ' ')
		.trim();
}

/** Parse `--var: value;` declarations out of an emitted theme CSS file (the
 * @layer/selector nesting doesn't matter — we want the var map). */
function parseCssVars(themeName: string): Map<string, string> {
	const css = readFileSync(join(cssDir, `tokens-${themeName}.css`), 'utf8');
	const out = new Map<string, string>();
	for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g))
		out.set(m[1]!, m[2]!.trim());
	return out;
}

/** dot-path → flat key lookup against a composed (flat) token set. */
function flatValueOf(
	composed: Record<string, Record<string, string>>,
	dotPath: string,
): string | undefined {
	const [category, ...rest] = dotPath.split('.');
	if (category === undefined)
		return undefined;
	return composed[category]?.[rest.join('-')];
}

let cssByTheme: Map<string, Map<string, string>>;

beforeAll(async () => {
	await loadThemes();
	cssByTheme = new Map();
	for (const name of [...AESTHETICS, 'compact'])
		cssByTheme.set(name, parseCssVars(name));
});

async function layersFor(
	aesthetic: string,
	density?: string,
): Promise<ResolvedLayer[]> {
	const layers: ResolvedLayer[] = [];
	const aes = await getTheme(aesthetic);
	if (aes)
		layers.push(dtcgToResolved(aes.data as Record<string, Record<string, { $value: unknown }>>));
	if (density) {
		const den = await getTheme(density);
		if (den)
			layers.push(dtcgToResolved(den.data as Record<string, Record<string, { $value: unknown }>>));
	}
	return layers;
}

describe('resolution parity (JS == CSS == MCP)', () => {
	for (const aesthetic of AESTHETICS) {
		for (const density of DENSITIES) {
			const label = density ? `${aesthetic} + ${density}` : aesthetic;
			const axes = density ? { aesthetic, density } : { aesthetic };

			it(`MCP composes identically to the JS resolver: ${label}`, async () => {
				const js = composeTokens(await layersFor(aesthetic, density));
				const mcp = await composeAxes(axes);
				expect(mcp.composed).toEqual(js);
				expect(mcp.unknownAxes).toEqual([]);
			});

			it(`emitted CSS cascade matches the JS resolver: ${label}`, async () => {
				const js = composeTokens(await layersFor(aesthetic, density)) as unknown as Record<
					string,
					Record<string, string>
				>;
				const aestheticVars = cssByTheme.get(aesthetic)!;
				const densityVars = density ? cssByTheme.get(density)! : new Map<string, string>();

				for (const def of Object.values(tokenMap)) {
					// the CSS var is excluded from the structural-reformat categories
					if ([...CSS_VALUE_EXCLUDED].some((p) => def.cssVariable.startsWith(`--${p}`)))
						continue;
					const jsValue = flatValueOf(js, def.name);
					if (jsValue === undefined)
						continue; // extension token absent from this composition

					// the cascade: density layer wins, else the aesthetic (full) layer
					const cssValue = densityVars.get(def.cssVariable) ?? aestheticVars.get(def.cssVariable);
					expect(
						cssValue,
						`${def.name} (${def.cssVariable}) missing in CSS for ${label}`,
					).toBeDefined();
					expect(
						normalize(cssValue!),
						`${def.name} value mismatch for ${label}`,
					).toBe(normalize(jsValue));
				}
			});
		}
	}

	it('density wins a real collision (compact overrides spacing.4)', async () => {
		const withCompact = composeTokens(await layersFor('vaporwave', 'compact')) as unknown as Record<
			string,
			Record<string, string>
		>;
		const withoutCompact = composeTokens(await layersFor('vaporwave')) as unknown as Record<
			string,
			Record<string, string>
		>;
		// compact tightens spacing.4 to 0.8rem; without it, the default 1rem stands
		expect(flatValueOf(withCompact, 'spacing.4')).toBe('0.8rem');
		expect(flatValueOf(withoutCompact, 'spacing.4')).toBe('1rem');
		// and the emitted compact CSS carries that winning value
		expect(cssByTheme.get('compact')!.get('--spacing-4')).toBe('0.8rem');
	});
});

describe('demo themes are valid and AA (T022, FR-013/SC-005)', () => {
	it('vaporwave resolves and passes WCAG AA contrast on every pair', async () => {
		const vaporwave = await getTheme('vaporwave');
		const result = validateComposedTheme([
			dtcgToResolved(vaporwave!.data as Record<string, Record<string, { $value: unknown }>>),
		]);
		expect(result.ok, JSON.stringify(result)).toBe(true);
	});

	it('compact resolves and validates', async () => {
		const compact = await getTheme('compact');
		const result = validateComposedTheme([
			dtcgToResolved(compact!.data as Record<string, Record<string, { $value: unknown }>>),
		]);
		expect(result.ok, JSON.stringify(result)).toBe(true);
	});

	it('the composed vaporwave + compact theme stays AA', async () => {
		const result = validateComposedTheme(await layersFor('vaporwave', 'compact'));
		expect(result.ok, JSON.stringify(result)).toBe(true);
	});

	it('exposes shadow.neon as a theme-extension token in the map', () => {
		expect(tokenMap['shadow.neon']).toMatchObject({
			category: 'shadow',
			cssVariable: '--shadow-neon',
			source: 'theme-extension',
		});
	});
});
