/**
 * `contrast` — compute WCAG contrast ratio + AA/AAA pass for two colors.
 *
 * Input: { foreground: ColorOrToken; background: ColorOrToken; theme?: string }
 *   ColorOrToken is hex/rgb/hsl/oklch string OR named token reference (e.g.
 *   'color.primary'). Token references resolve against `theme`.
 * Output: { ratio, aa: { normal, large }, aaa: { normal, large },
 *           foreground: { resolved }, background: { resolved } }
 *
 * Errors: unparseable-color, unknown-token, unknown-theme.
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { contrastRatio, parseColor } from '../../color.js';
import { mcpError, mcpResult } from '../runtime/errors.js';
import { DEFAULT_THEME, getTheme, walkToken } from '../themes.js';

const inputSchema = {
	foreground: z
		.string()
		.describe('Foreground color. Hex/rgb/hsl/oklch string OR token reference like \'color.primary\'.'),
	background: z
		.string()
		.describe('Background color. Same format options as foreground.'),
	theme: z.string().optional().describe('Theme to resolve token references against. Defaults to the package default.'),
};

// WCAG 2.x contrast thresholds.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;
const AAA_NORMAL = 7.0;
const AAA_LARGE = 4.5;

function looksLikeTokenReference(value: string): boolean {
	return /^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/i.test(value);
}

async function resolveToColorValue(
	input: string,
	themeName: string,
): Promise<{ kind: 'color'; value: string } | { kind: 'error'; error: ReturnType<typeof mcpError> }> {
	if (!looksLikeTokenReference(input)) {
		return { kind: 'color', value: input };
	}

	const themeRecord = await getTheme(themeName);
	if (!themeRecord) {
		return {
			kind: 'error',
			error: mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-theme',
				got: themeName,
			}),
		};
	}

	const token = walkToken(themeRecord.data, input);
	if (!token) {
		return {
			kind: 'error',
			error: mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-token',
				token: input,
				theme: themeName,
			}),
		};
	}

	return { kind: 'color', value: token.$value };
}

export const contrast: McpTool = {
	name: 'contrast',
	description:
		'Compute the WCAG contrast ratio between two colors plus pass/fail for AA/AAA, normal/large. Accepts hex, rgb, hsl, or oklch strings AND named token references like `color.primary`. Useful when validating a color pair before committing it to a theme.',
	inputSchema,
	handler: async (input) => {
		const args = input as { foreground: string; background: string; theme?: string };
		const themeName = args.theme ?? DEFAULT_THEME;

		const fg = await resolveToColorValue(args.foreground, themeName);
		if (fg.kind === 'error')
			return fg.error;
		const bg = await resolveToColorValue(args.background, themeName);
		if (bg.kind === 'error')
			return bg.error;

		const fgRgb = parseColor(fg.value);
		if (!fgRgb) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unparseable-color',
				prop: 'foreground',
				input: args.foreground,
				resolved: fg.value,
			});
		}
		const bgRgb = parseColor(bg.value);
		if (!bgRgb) {
			return mcpError({
				component: 'tokens-mcp',
				issue: 'unparseable-color',
				prop: 'background',
				input: args.background,
				resolved: bg.value,
			});
		}

		const ratio = contrastRatio(fgRgb, bgRgb);

		return mcpResult({
			ratio: Number(ratio.toFixed(2)),
			aa: {
				normal: ratio >= AA_NORMAL,
				large: ratio >= AA_LARGE,
			},
			aaa: {
				normal: ratio >= AAA_NORMAL,
				large: ratio >= AAA_LARGE,
			},
			foreground: { resolved: fg.value },
			background: { resolved: bg.value },
		});
	},
};
