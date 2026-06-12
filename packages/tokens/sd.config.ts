import type { TransformedToken } from 'style-dictionary/types';
import StyleDictionary from 'style-dictionary';
import { AXIS_ATTRIBUTE, themeAxisEntries } from './src/axes.js';

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
// `@layer <name> { … }`. The two axes go in distinct layers — aesthetic in
// `ds-aesthetic`, density in `ds-density` — and the bundle declares the order
// `@layer ds-aesthetic, ds-density;` (see layer-order.css) so a density var
// always wins a collision with an aesthetic var, independent of import order.
// Layer membership, not selector specificity, decides the winner.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
	name: 'css/variables-layered',
	format: async (args) => {
		const layer = (args.options as { layer?: string }).layer ?? 'ds';
		const builtin = StyleDictionary.hooks.formats['css/variables'];
		if (!builtin)
			throw new Error('built-in css/variables format not found');
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
	format: () => `@layer ds-aesthetic, ds-density;\n`,
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
			shadow: 'shadows',
			opacity: 'opacity',
			motion: 'motion',
			ring: 'ring',
			'z-index': 'z-index',
		};

		const entries = dictionary.allTokens.map((token) => {
			const category
				= categoryMap[token.path[0] ?? ''] ?? token.path[0] ?? 'unknown';
			return `  "${token.path.join('.')}": {
    name: "${token.path.join('.')}",
    category: "${category}" as const,
    type: "${token.$type ?? token.type ?? 'unknown'}",
    cssVariable: "${tokenToCssVar(token)}",
  }`;
		});

		return `export type TokenCategory = "color" | "spacing" | "typography" | "radii" | "shadows" | "opacity" | "motion" | "ring" | "z-index";

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
// Build
// ---------------------------------------------------------------------------
async function build() {
	// Discover theme files by axis: themes/<axis>/<name>.json. The directory is
	// the single source of truth for a theme's axis (see src/axes.ts).
	const entries = themeAxisEntries('themes');

	// 1. Per-theme CSS builds. Each theme is scoped under its axis attribute
	//    (aesthetic → [data-theme], density → [data-density]) and wrapped in its
	//    axis cascade layer (aesthetic → ds-aesthetic, density → ds-density) so
	//    the two axes compose deterministically: density wins a collision via the
	//    layer order declared in layer-order.css, regardless of import order.
	//
	//    Sourcing differs by axis on purpose. AESTHETIC themes source the base
	//    `src/tokens/**` so each emits a complete resolved set (the base layer a
	//    page always wants present). DENSITY themes source ONLY their own file —
	//    the delta — so a density override doesn't redeclare every color var and
	//    clobber the aesthetic layer. A density theme is a refinement, not a full
	//    theme; it must touch only the vars it actually changes.
	for (const { name, axis } of entries) {
		const source
			= axis === 'density'
				? [`themes/${axis}/${name}.json`]
				: ['src/tokens/**/*.json', `themes/${axis}/${name}.json`];
		const sd = new StyleDictionary({
			source,
			log: { warnings: 'disabled' },
			platforms: {
				css: {
					transformGroup: 'css-motion',
					buildPath: 'dist/css/',
					files: [
						{
							destination: `tokens-${name}.css`,
							format: 'css/variables-layered',
							options: {
								selector: `[${AXIS_ATTRIBUTE[axis]}="${name}"]`,
								layer: `ds-${axis}`,
								outputReferences: false,
							},
						},
					],
				},
			},
		});
		await sd.buildAllPlatforms();
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
				files: [
					{ destination: 'layer-order.css', format: 'css/layer-order' },
				],
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
		},
	});
	await sdBase.buildAllPlatforms();

	console.log(
		`✓ Built ${entries.length} theme CSS files + layer-order + Tailwind preset + TypeScript types + JSON`,
	);
}

build();
