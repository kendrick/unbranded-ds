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
	vaporwave:
		'Aesthetic axis (data-theme): saturated palette, a neon glow shadow, and display typography.',
	compact:
		'Density axis (data-density): tightened spacing and line-heights for dense layouts.',
};

export const listThemes: McpTool = {
	name: 'listThemes',
	description:
		'List available themes with their keys and one-line descriptions. Useful when you want to enumerate brand, light, and dark themes before picking one for a downstream operation.',
	inputSchema: {},
	handler: async () => {
		const themes = await loadThemes();
		const result = {
			// Report each theme's axis so a caller knows which slot it fills —
			// `aesthetic` vs `density` — when handing it back as a theme axis input.
			themes: Array.from(themes.values()).map((theme) => ({
				key: theme.key,
				axis: theme.axis,
				description: THEME_DESCRIPTIONS[theme.key] ?? '(no description available)',
			})),
		};
		return mcpResult(result);
	},
};
