import type { TransformedToken } from 'style-dictionary/types';
import { readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import StyleDictionary from 'style-dictionary';

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
	// Discover theme files
	const themeDir = 'themes';
	const themeFiles = await readdir(themeDir);
	const themes = themeFiles
		.filter((f) => extname(f) === '.json')
		.map((f) => basename(f, '.json'));

	// 1. Per-theme CSS builds
	for (const theme of themes) {
		const sd = new StyleDictionary({
			source: ['src/tokens/**/*.json', `themes/${theme}.json`],
			log: { warnings: 'disabled' },
			platforms: {
				css: {
					transformGroup: 'css-motion',
					buildPath: 'dist/css/',
					files: [
						{
							destination: `tokens-${theme}.css`,
							format: 'css/variables',
							options: {
								selector: `[data-theme="${theme}"]`,
								outputReferences: false,
							},
						},
					],
				},
			},
		});
		await sd.buildAllPlatforms();
	}

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
		`✓ Built ${themes.length} theme CSS files + Tailwind preset + TypeScript types + JSON`,
	);
}

build();
