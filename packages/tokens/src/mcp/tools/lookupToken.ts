/**
 * `lookupToken` — return the resolved CSS variable and value for a token.
 *
 * Input: { token: string; theme?: { colorScheme?: string; theme?: string; density?: string } }
 * Output: { token, theme, source, present, cssVariable?, value?, note? }
 *
 * The token is resolved against the COMPOSED axis tree, not a single theme, so a
 * value can come from either axis. `source` discriminates schema tokens from
 * theme-extension tokens; a real extension that the active axes don't declare is
 * a soft `present: false` answer, not an error (the caller learns it's
 * theme-scoped). Only a token in no theme at all is a hard `unknown-token`.
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { tokenMap } from '../../token-map.js';
import { composeAxes, flatValueOf, themeAxesSchema } from '../compose.js';
import { mcpError, mcpResult } from '../runtime/errors.js';

const inputSchema = {
	token: z.string().describe('Dotted token name, e.g. \'color.primary\''),
	theme: themeAxesSchema,
};

export const lookupToken: McpTool = {
	name: 'lookupToken',
	description:
		'Return the resolved CSS variable name and current value for a named token under the given theme axes. Useful when you need to know what `color.primary` actually resolves to with the dark color scheme active right now.',
	inputSchema,
	handler: async (input) => {
		const args = input as {
			token: string;
			theme?: { colorScheme?: string; theme?: string; density?: string };
		};

		const { composed } = await composeAxes(args.theme);
		const def = tokenMap[args.token];
		const value = flatValueOf(composed, args.token);

		// In the schema or extension map AND the active axes declare it → resolved.
		if (def && value !== undefined) {
			return mcpResult({
				token: args.token,
				theme: args.theme ?? {},
				source: def.source ?? 'schema',
				present: true,
				cssVariable: def.cssVariable,
				value,
			});
		}

		// A known extension token the active axes don't carry → soft, not an error.
		// The caller learns the token is real but theme-scoped to some other theme.
		if (def && def.source === 'theme-extension' && value === undefined) {
			return mcpResult({
				token: args.token,
				theme: args.theme ?? {},
				source: 'theme-extension',
				present: false,
				note: 'theme-extension token; the active theme(s) do not declare it',
			});
		}

		// Present in the composed tree but not in the map → synthesize an extension
		// answer (a theme declared it past the locked schema and our startup walk).
		if (!def && value !== undefined) {
			return mcpResult({
				token: args.token,
				theme: args.theme ?? {},
				source: 'theme-extension',
				present: true,
				cssVariable: `--${args.token.split('.').slice(1).join('-')}`,
				value,
			});
		}

		// In no theme at all → the only hard error left.
		return mcpError({
			component: 'tokens-mcp',
			issue: 'unknown-token',
			got: args.token,
		});
	},
};
