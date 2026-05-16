import type { TransformedToken } from 'style-dictionary/types';
import { readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import StyleDictionary from 'style-dictionary';

/**
 * Flatten a token name into a CSS variable name.
 * E.g. "color-background" → "--color-background"
 */
function tokenToCssVar(token: TransformedToken): string {
	return `--${token.name}`;
}

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

		return `export type TokenCategory = "color" | "spacing" | "typography" | "radii" | "shadows" | "opacity";

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
					transformGroup: 'css',
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
	//    Use "css" transformGroup for all so token names stay kebab-case.
	const sdBase = new StyleDictionary({
		source: ['src/tokens/**/*.json'],
		platforms: {
			tailwind: {
				transformGroup: 'css',
				buildPath: 'dist/tailwind/',
				files: [
					{
						destination: 'preset.css',
						format: 'tailwind/theme-inline',
					},
				],
			},
			ts: {
				transformGroup: 'css',
				buildPath: 'dist/ts/',
				files: [
					{
						destination: 'tokens.ts',
						format: 'typescript/token-map',
					},
				],
			},
			json: {
				transformGroup: 'css',
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
