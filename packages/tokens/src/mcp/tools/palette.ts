/**
 * `palette` — list every token under a category prefix.
 *
 * Input: { category: string; theme?: { aesthetic?: string; density?: string } }
 *   category may be flat (`'color'`) or hierarchical (`'color.foreground'`).
 * Output: { category, theme, tokens: Array<{ name, value, source }> }
 *
 * The token set is driven by `tokenMap` (schema + bundled extensions) rather than
 * by walking one theme, so the list is stable across axes; each entry's value is
 * read out of the composed tree. Extensions that a theme adds past our startup
 * walk still surface via the composed-only sweep below. Unknown category → empty.
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { tokenMap } from '../../token-map.js';
import { composeAxes, flatValueOf, themeAxesSchema } from '../compose.js';
import { mcpError, mcpResult } from '../runtime/errors.js';

const inputSchema = {
	category: z
		.string()
		.describe('Token category. Flat (e.g. \'color\') or dotted path (e.g. \'color.foreground\').'),
	theme: themeAxesSchema,
};

export const palette: McpTool = {
	name: 'palette',
	description:
		'Return all tokens in a category, each tagged schema or theme-extension. Accepts a top-level name like `color` or a dotted path like `color.foreground`. Useful when authoring a component and you need to know what colors, spacing values, or radii the active axes expose.',
	inputSchema,
	handler: async (input) => {
		const args = input as {
			category: string;
			theme?: { aesthetic?: string; density?: string };
		};

		const { composed } = await composeAxes(args.theme);

		const prefix = `${args.category}.`;
		const tokens: Array<{ name: string; value: string | undefined; source: string }> = [];
		const seen = new Set<string>();

		// Map-driven: every known token whose dot-path lives under the category.
		for (const [dotPath, def] of Object.entries(tokenMap)) {
			if (dotPath === args.category || dotPath.startsWith(prefix)) {
				tokens.push({
					name: dotPath,
					value: flatValueOf(composed, dotPath),
					source: def.source ?? 'schema',
				});
				seen.add(dotPath);
			}
		}

		// A theme can declare an extension key past our startup walk; surface any
		// composed key in this category that the map didn't already cover.
		const composedCategory = (composed as Record<string, Record<string, string> | undefined>)[args.category];
		if (composedCategory) {
			for (const [flatKey, value] of Object.entries(composedCategory)) {
				const dotPath = `${args.category}.${flatKey}`;
				if (seen.has(dotPath))
					continue;
				tokens.push({ name: dotPath, value, source: 'theme-extension' });
				seen.add(dotPath);
			}
		}

		if (tokens.length === 0) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-category',
				got: args.category,
			});
		}

		return mcpResult({
			category: args.category,
			theme: args.theme ?? {},
			tokens,
		});
	},
};
