/**
 * `palette` — list every token under a category prefix.
 *
 * Input: { category: string; theme?: string }
 *   category may be flat (`'color'`) or hierarchical (`'color.foreground'`).
 * Output: { category, theme, tokens: Array<{ name, value }> }
 *
 * Errors: unknown-category, unknown-theme.
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { mcpError, mcpResult } from '../runtime/errors.js';
import { DEFAULT_THEME, getTheme, walkSubtree } from '../themes.js';

const inputSchema = {
	category: z
		.string()
		.describe('Token category. Flat (e.g. \'color\') or dotted path (e.g. \'color.foreground\').'),
	theme: z.string().optional().describe('Theme key. Defaults to the package default theme.'),
};

export const palette: McpTool = {
	name: 'palette',
	description:
		'Return all tokens in a category. Accepts a top-level name like `color` or a dotted path like `color.foreground`. Useful when authoring a component and you need to know what colors, spacing values, or radii the active theme exposes.',
	inputSchema,
	handler: async (input) => {
		const args = input as { category: string; theme?: string };
		const themeName = args.theme ?? DEFAULT_THEME;

		const themeRecord = await getTheme(themeName);
		if (!themeRecord) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-theme',
				got: themeName,
			});
		}

		const tokens = walkSubtree(themeRecord.data, args.category);
		if (tokens.length === 0) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-category',
				got: args.category,
				theme: themeName,
			});
		}

		return mcpResult({
			category: args.category,
			theme: themeName,
			tokens: tokens.map(({ name, token }) => ({
				name,
				value: token.$value,
			})),
		});
	},
};
