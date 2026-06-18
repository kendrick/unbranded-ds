import type { TransformedToken } from 'style-dictionary/types';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import StyleDictionary from 'style-dictionary';
import { AXIS_ATTRIBUTE } from './src/axes.js';

/**
 * The single source of truth for a token's flattened name.
 *
 * Motion is the one special case. Its DTCG source stays nested
 * (`motion.duration.fast`, `motion.easing.standard`) per Style Dictionary
 * convention, but we emit Tailwind-aligned names so the easings light up real
 * `ease-*` utilities: `motion.duration.X` → `duration-X` and
 * `motion.easing.X` → `ease-X`. A literal `motion-duration-fast` maps to no
 * Tailwind namespace and leaks the internal grouping into the public var
 * surface. Every other token keeps its default kebab name.
 *
 * This runs as a name transform (below) so `token.name` is already the renamed
 * value by the time any format — including Style Dictionary's built-in
 * `css/variables`, which the per-theme CSS uses — reads it. That's the only way
 * to keep the rename consistent across all four artifacts AND the per-theme CSS;
 * a format-only rename would miss `css/variables`, which reads `token.name`
 * directly.
 */
function flattenedName(token: TransformedToken): string {
	if (token.path[0] === 'motion') {
		const [, group, key] = token.path;
		if (group === 'duration') return `duration-${key}`;
		if (group === 'easing') return `ease-${key}`;
	}
	return token.name;
}

/**
 * CSS variable name (the `--` prefixed form) for any token. Reads `token.name`,
 * which the `name/motion-aware` transform has already rewritten, so this stays a
 * thin wrapper and the rename lives in exactly one place.
 */
function tokenToCssVar(token: TransformedToken): string {
	return `--${token.name}`;
}

// ---------------------------------------------------------------------------
// Custom name transform: rewrite motion token names to the Tailwind-aligned
// flattened form. Layered AFTER name/kebab in the custom transform group below,
// so it operates on the already-kebabbed name and only touches motion.
// ---------------------------------------------------------------------------
StyleDictionary.registerTransform({
	name: 'name/motion-aware',
	type: 'name',
	transform: (token) => flattenedName(token as TransformedToken),
});

// A `css` transform group with the motion rename appended. The per-theme CSS,
// Tailwind preset, TS map, and JSON all build on this so `token.name` carries
// the renamed value everywhere and the artifacts can't drift.
StyleDictionary.registerTransformGroup({
	name: 'css-motion',
	transforms: [
		'attribute/cti',
		'name/kebab',
		'name/motion-aware',
		'time/seconds',
		'html/icon',
		'size/rem',
		'color/css',
		'asset/url',
		'fontFamily/css',
		'cubicBezier/css',
		'strokeStyle/css/shorthand',
		'border/css/shorthand',
		'typography/css/shorthand',
		'transition/css/shorthand',
		'shadow/css/shorthand',
	],
});

// ---------------------------------------------------------------------------
// Custom format: css/variables wrapped in a cascade @layer.
//
// `css/variables` has no @layer option, so we delegate to the built-in to
// produce the `[selector] { --var: … }` body, then nest it inside
// `@layer <name> { … }`. The three axes go in distinct layers — color scheme in
// `ds-color-scheme`, theme/identity in `ds-theme`, density in `ds-density` — and
// the bundle declares the order `@layer ds-color-scheme, ds-theme, ds-density;`
// (see layer-order.css) so an identity var wins a collision with the color-scheme
// base, and a density var wins both, independent of import order. Layer
// membership, not selector specificity, decides the winner.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'css/variables-layered',
	format: async (args) => {
		const layer = (args.options as { layer?: string }).layer ?? 'ds';
		const builtin = StyleDictionary.hooks.formats['css/variables'];
		if (!builtin) throw new Error('built-in css/variables format not found');
		const body = await builtin(args);
		// Indent the built-in body one level so it reads as nested in the layer,
		// and keep the auto-generated header comment outside the layer block.
		const headerEnd = body.indexOf('*/');
		const header = headerEnd === -1 ? '' : `${body.slice(0, headerEnd + 2)}\n\n`;
		const rules = (headerEnd === -1 ? body : body.slice(headerEnd + 2)).trim();
		const indented = rules
			.split('\n')
			.map((line) => (line.length > 0 ? `  ${line}` : line))
			.join('\n');
		return `${header}@layer ${layer} {\n${indented}\n}\n`;
	},
});

// ---------------------------------------------------------------------------
// Custom format: the cascade layer-order declaration. A standalone artifact so
// consumers can import it once up front; the order is what makes density win.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'css/layer-order',
	format: () => `@layer ds-color-scheme, ds-theme, ds-density;\n`,
});

// ---------------------------------------------------------------------------
// Custom format: Tailwind v4 @theme inline block
// Maps every token to a CSS variable reference so Tailwind generates utilities.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'tailwind/theme-inline',
	format: ({ dictionary }) => {
		const lines = dictionary.allTokens.map(
			(token) => `  ${tokenToCssVar(token)}: var(${tokenToCssVar(token)});`,
		);
		return `@theme inline {\n${lines.join('\n')}\n}\n`;
	},
});

// ---------------------------------------------------------------------------
// Custom format: TypeScript token map
// Produces a typed Record<string, TokenDefinition> and the TokenDefinition type.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'typescript/token-map',
	format: ({ dictionary }) => {
		const categoryMap: Record<string, string> = {
			color: 'color',
			spacing: 'spacing',
			typography: 'typography',
			radius: 'radii',
			tracking: 'tracking',
			shadow: 'shadows',
			opacity: 'opacity',
			motion: 'motion',
			ring: 'ring',
			'z-index': 'z-index',
		};

		const entries = dictionary.allTokens.map((token) => {
			const category = categoryMap[token.path[0] ?? ''] ?? token.path[0] ?? 'unknown';
			return `  "${token.path.join('.')}": {
    name: "${token.path.join('.')}",
    category: "${category}" as const,
    type: "${token.$type ?? token.type ?? 'unknown'}",
    cssVariable: "${tokenToCssVar(token)}",
  }`;
		});

		return `export type TokenCategory = "color" | "spacing" | "typography" | "radii" | "tracking" | "shadows" | "opacity" | "motion" | "ring" | "z-index";

export type TokenDefinition = {
  name: string;
  category: TokenCategory;
  type: string;
  cssVariable: string;
};

export const tokenMap: Record<string, TokenDefinition> = {
${entries.join(',\n')},
} as const;
`;
	},
});

// ---------------------------------------------------------------------------
// Custom format: raw JSON token map
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'json/flat-map',
	format: ({ dictionary }) => {
		const result: Record<
			string,
			{ name: string; value: unknown; type: string; cssVariable: string }
		> = {};
		for (const token of dictionary.allTokens) {
			result[token.path.join('.')] = {
				name: token.path.join('.'),
				value: token.value,
				type: (token.$type as string) ?? (token.type as string) ?? 'unknown',
				cssVariable: tokenToCssVar(token),
			};
		}
		return `${JSON.stringify(result, null, 2)}\n`;
	},
});

// ---------------------------------------------------------------------------
// Custom formats: flat resolved data (spec 014).
//
// The flat `{ category: { flatKey: rawValue } }` shape the JS resolver folds
// (ResolvedTokens / ResolvedLayer). Uses `original.$value` so the data keeps the
// SOURCE representation the runtime has always used — display transforms (ms→s,
// oklch normalization) live only in the CSS, not in the values the MCP returns or
// the defaults inherit. Emitting these from Style Dictionary makes the build the
// single resolver: the MCP and the defaults baseline read THIS, instead of a
// hand-maintained copy (defaults) or a re-walk of the raw source (the MCP).
// ---------------------------------------------------------------------------
function flatResolved(allTokens: TransformedToken[]): Record<string, Record<string, unknown>> {
	const out: Record<string, Record<string, unknown>> = {};
	for (const token of allTokens) {
		const category = String(token.path[0]);
		const flatKey = token.path.slice(1).join('-');
		const raw = (token.original as { $value?: unknown }).$value ?? token.value;
		(out[category] ??= {})[flatKey] = raw;
	}
	return out;
}

StyleDictionary.registerFormat({
	name: 'json/resolved-layer',
	format: ({ dictionary }) => `${JSON.stringify(flatResolved(dictionary.allTokens), null, 2)}\n`,
});

StyleDictionary.registerFormat({
	name: 'typescript/resolved-defaults',
	format: ({ dictionary }) =>
		`// AUTO-GENERATED by sd.config.ts — do not edit. Run \`pnpm --filter @unbranded-ds/tokens build\` to regenerate.\nimport type { Theme } from './schema.js';\n\nexport const canonicalDefaultTokens = ${JSON.stringify(flatResolved(dictionary.allTokens), null, '\t')} as Theme['tokens'];\n`,
});

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
// One CSS file + (optionally) one resolved-delta JSON to emit. `cssSource` is the
// Style Dictionary source for the COMPLETE scoped rule; `deltaSource` is the
// theme-alone source for the resolved delta the runtime resolver folds — `null`
// when the cell is the file-less base (the `light` color scheme), which has no
// delta because `composeTokens` already starts from the light defaults.
interface Emission {
	artifact: string;
	selector: string;
	layer: string;
	cssSource: string[];
	deltaSource: string[] | null;
}

function jsonNames(dir: string): string[] {
	try {
		return readdirSync(dir)
			.filter((f) => f.endsWith('.json'))
			.map((f) => f.replace(/\.json$/, ''))
			.sort();
	} catch {
		return [];
	}
}

// Enumerate every cell of the axis matrix (spec 016). The directory layout is the
// source of truth: themes/color-scheme/<scheme>.json, themes/theme/<identity>/
// <scheme>.json, themes/density/<name>.json.
//
// Sourcing differs by axis on purpose:
//   - COLOR-SCHEME and THEME cells source the base `src/tokens/**` plus their own
//     override, so each emits a COMPLETE resolved set. A theme cell is a complete
//     authored palette (the spec rejected layering one identity over both schemes,
//     which can't stay AA on both backgrounds), so the compound selector fully
//     defines its cell and the validator can check each of the six directly.
//   - DENSITY cells source ONLY their own file — the delta — so a density override
//     touches just the spacing vars it changes rather than clobbering colors.
//
// `light` is the file-less base: it emits the complete base set under
// [data-color-scheme="light"] but carries no delta (composeTokens folds onto the
// light defaults already).
function listEmissions(): Emission[] {
	const base = ['src/tokens/**/*.json'];
	const emissions: Emission[] = [];

	// Color-scheme axis → @layer ds-color-scheme, [data-color-scheme="<scheme>"].
	const colorSchemeDir = 'themes/color-scheme';
	const schemes = ['light', ...jsonNames(colorSchemeDir).filter((s) => s !== 'light')];
	for (const scheme of schemes) {
		const override = scheme === 'light' ? null : [`${colorSchemeDir}/${scheme}.json`];
		emissions.push({
			artifact: scheme,
			selector: `[${AXIS_ATTRIBUTE.colorScheme}="${scheme}"]`,
			layer: 'ds-color-scheme',
			cssSource: override ? [...base, ...override] : base,
			deltaSource: override,
		});
	}

	// Theme (identity) axis → @layer ds-theme, compound
	// [data-theme="<identity>"][data-color-scheme="<scheme>"]. Each identity nests
	// one scheme file per cell; the delta is the cell file alone.
	const themeDir = 'themes/theme';
	const identities = readdirSync(themeDir, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name)
		.sort();
	for (const identity of identities) {
		for (const scheme of jsonNames(join(themeDir, identity))) {
			const file = `${themeDir}/${identity}/${scheme}.json`;
			emissions.push({
				artifact: `${identity}-${scheme}`,
				selector: `[${AXIS_ATTRIBUTE.theme}="${identity}"][${AXIS_ATTRIBUTE.colorScheme}="${scheme}"]`,
				layer: 'ds-theme',
				cssSource: [...base, file],
				deltaSource: [file],
			});
		}
	}

	// Density axis → @layer ds-density, [data-density="<name>"] — the delta path.
	const densityDir = 'themes/density';
	for (const name of jsonNames(densityDir)) {
		const file = `${densityDir}/${name}.json`;
		emissions.push({
			artifact: name,
			selector: `[${AXIS_ATTRIBUTE.density}="${name}"]`,
			layer: 'ds-density',
			cssSource: [file],
			deltaSource: [file],
		});
	}

	return emissions;
}

// Remove the per-cell artifacts before regenerating so a renamed or removed cell
// (spec 016 renamed every aesthetic theme) leaves no stale CSS or delta behind for
// a consumer or a test to pick up. Shared assets are overwritten in place.
function cleanPerCellArtifacts() {
	for (const [dir, pattern] of [
		['dist/css', /^tokens-.*\.css$/],
		['dist/json/themes', /\.json$/],
	] as const) {
		for (const f of (() => {
			try {
				return readdirSync(dir);
			} catch {
				return [];
			}
		})()) {
			if (pattern.test(f)) rmSync(join(dir, f));
		}
	}
}

async function build() {
	cleanPerCellArtifacts();
	const emissions = listEmissions();

	// 1. Per-cell CSS + resolved-delta JSON. The CSS scopes a complete (or delta)
	//    var set under the cell's selector and cascade layer; the JSON is the
	//    resolved delta composeTokens folds (skipped for the file-less light base).
	for (const e of emissions) {
		const sd = new StyleDictionary({
			source: e.cssSource,
			log: { warnings: 'disabled' },
			platforms: {
				css: {
					transformGroup: 'css-motion',
					buildPath: 'dist/css/',
					files: [
						{
							destination: `tokens-${e.artifact}.css`,
							format: 'css/variables-layered',
							options: {
								selector: e.selector,
								layer: e.layer,
								outputReferences: false,
							},
						},
					],
				},
			},
		});
		await sd.buildAllPlatforms();

		if (!e.deltaSource) continue;
		const sdDelta = new StyleDictionary({
			source: e.deltaSource,
			log: { warnings: 'disabled' },
			platforms: {
				json: {
					transformGroup: 'css-motion',
					buildPath: 'dist/json/themes/',
					files: [{ destination: `${e.artifact}.json`, format: 'json/resolved-layer' }],
				},
			},
		});
		await sdDelta.buildAllPlatforms();
	}

	// The layer-order declaration. Emitted once as its own artifact so a consumer
	// can `@import` it before any theme css; the order is what gives density the
	// win. (No tokens needed — the format is constant — so source the base set.)
	const sdLayerOrder = new StyleDictionary({
		source: ['src/tokens/**/*.json'],
		log: { warnings: 'disabled' },
		platforms: {
			css: {
				transformGroup: 'css-motion',
				buildPath: 'dist/css/',
				files: [{ destination: 'layer-order.css', format: 'css/layer-order' }],
			},
		},
	});
	await sdLayerOrder.buildAllPlatforms();

	// 2. Shared assets from base tokens (Tailwind preset, TS types, JSON)
	//    Use the "css-motion" transformGroup for all so token names stay
	//    kebab-case AND the motion rename applies uniformly with the per-theme CSS.
	const sdBase = new StyleDictionary({
		source: ['src/tokens/**/*.json'],
		platforms: {
			tailwind: {
				transformGroup: 'css-motion',
				buildPath: 'dist/tailwind/',
				files: [
					{
						destination: 'preset.css',
						format: 'tailwind/theme-inline',
					},
				],
			},
			ts: {
				transformGroup: 'css-motion',
				buildPath: 'dist/ts/',
				files: [
					{
						destination: 'tokens.ts',
						format: 'typescript/token-map',
					},
				],
			},
			json: {
				transformGroup: 'css-motion',
				buildPath: 'dist/json/',
				files: [
					{
						destination: 'tokens.json',
						format: 'json/flat-map',
					},
				],
			},
			// The canonical defaults baseline as a committed generated module
			// (spec 014). Style Dictionary's resolved base, raw — the inheritance
			// baseline the runtime resolver and the MCP fold onto, replacing the
			// hand-maintained copy. Regenerate-and-diff (defaults.test.ts) guards it.
			defaults: {
				transformGroup: 'css-motion',
				buildPath: 'src/',
				files: [
					{
						destination: 'defaults.generated.ts',
						format: 'typescript/resolved-defaults',
					},
				],
			},
		},
	});
	await sdBase.buildAllPlatforms();

	console.log(
		`✓ Built ${emissions.length} theme CSS files + layer-order + Tailwind preset + TypeScript types + JSON`,
	);
}

build();
