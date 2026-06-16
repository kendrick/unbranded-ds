/**
 * `listThemes` — enumerate the selectable value of every theme axis.
 *
 * Returns each axis value exposed by `@unbranded-ds/tokens` (spec 016: the
 * color-scheme, theme/identity, and density axes) with its axis and a one-line
 * description. The value set comes from the registry, so it includes the
 * file-less defaults (`light`, `default`, `comfortable`). No error states; the
 * registry is bundled with the package.
 */

import type { McpTool } from '../runtime/stdio.js';
import { AXES } from '../../axis-constants.js';
import { themesForAxis } from '../../registry.js';
import { mcpResult } from '../runtime/errors.js';

const THEME_DESCRIPTIONS: Record<string, string> = {
	// colorScheme (data-color-scheme)
	light: 'Color-scheme axis: neutral foregrounds on bright surfaces. The base.',
	dark: 'Color-scheme axis: light foregrounds on dark surfaces.',
	// theme / identity (data-theme)
	default: 'Theme axis: the unbranded identity — the color-scheme base shows through.',
	brand: 'Theme axis: a violet brand identity, authored light and dark.',
	vaporwave:
		'Theme axis: a saturated identity with a neon glow shadow and display type, authored light and dark.',
	// density (data-density)
	comfortable: 'Density axis: the default spacing and line-heights.',
	compact: 'Density axis: tightened spacing and line-heights for dense layouts.',
};

export const listThemes: McpTool = {
	name: 'listThemes',
	description:
		'List the selectable value of every theme axis (colorScheme, theme, density) with its axis and a one-line description. Useful when you want to enumerate the light/dark schemes or the brand and vaporwave identities before picking one for a downstream operation.',
	inputSchema: {},
	handler: async () => {
		const themes = AXES.flatMap((axis) =>
			themesForAxis(axis).map((key) => ({
				key,
				axis,
				description: THEME_DESCRIPTIONS[key] ?? '(no description available)',
			})),
		);
		return mcpResult({ themes });
	},
};
