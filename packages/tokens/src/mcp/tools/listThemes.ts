/**
 * `listThemes` — enumerate available themes.
 *
 * Returns the keys exposed by `@unbranded-ds/tokens` plus a one-line
 * description per theme. No error states; the token map is bundled with
 * the package.
 */

import type { McpTool } from '../runtime/stdio.js';
import { mcpResult } from '../runtime/errors.js';
import { loadThemes } from '../themes.js';

const THEME_DESCRIPTIONS: Record<string, string> = {
	light: 'Default light theme with neutral foregrounds on bright surfaces.',
	dark: 'Dark theme with light foregrounds on dark surfaces.',
	brand: 'Brand-accented theme — overrides primary, ring, and accent surfaces.',
};

export const listThemes: McpTool = {
	name: 'listThemes',
	description:
		'List available themes with their keys and one-line descriptions. Useful when you want to enumerate brand, light, and dark themes before picking one for a downstream operation.',
	inputSchema: {},
	handler: async () => {
		const themes = await loadThemes();
		const result = {
			themes: Array.from(themes.keys()).map((key) => ({
				key,
				description: THEME_DESCRIPTIONS[key] ?? '(no description available)',
			})),
		};
		return mcpResult(result);
	},
};
