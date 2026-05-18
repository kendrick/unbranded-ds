/**
 * `lookupToken` — return the resolved CSS variable and value for a token.
 *
 * Input: { token: string; theme?: string }
 * Output: { token, theme, cssVariable, value }
 *
 * Errors: unknown-token, unknown-theme (per FR-024 and FR-027).
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { tokenMap } from '../../token-map.js';
import { mcpError, mcpResult } from '../runtime/errors.js';
import { DEFAULT_THEME, getTheme, walkToken } from '../themes.js';

const inputSchema = {
	token: z.string().describe('Dotted token name, e.g. \'color.primary\''),
	theme: z.string().optional().describe('Theme key. Defaults to the package default theme.'),
};

export const lookupToken: McpTool = {
	name: 'lookupToken',
	description:
		'Return the resolved CSS variable name and current value for a named token in a given theme. Useful when you need to know what `color.primary` actually resolves to in the dark theme right now.',
	inputSchema,
	handler: async (input) => {
		const args = input as { token: string; theme?: string };
		const themeName = args.theme ?? DEFAULT_THEME;

		const themeRecord = await getTheme(themeName);
		if (!themeRecord) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-theme',
				got: themeName,
			});
		}

		const tokenDef = tokenMap[args.token];
		if (!tokenDef) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-token',
				got: args.token,
			});
		}

		const token = walkToken(themeRecord.data, args.token);
		if (!token) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-token',
				got: args.token,
				note: `Theme '${themeName}' does not define this token.`,
			});
		}

		return mcpResult({
			token: args.token,
			theme: themeName,
			cssVariable: tokenDef.cssVariable,
			value: token.$value,
		});
	},
};
