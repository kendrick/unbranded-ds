/**
 * `contrast` — compute WCAG contrast ratio + AA/AAA pass for two colors.
 *
 * Input: { foreground: ColorOrToken; background: ColorOrToken;
 *          theme?: { aesthetic?: string; density?: string } }
 *   ColorOrToken is a hex/rgb/hsl/oklch string OR a named token reference (e.g.
 *   'color.primary'). Token references resolve against the COMPOSED axis tree.
 * Output: { ratio, aa: { normal, large }, aaa: { normal, large },
 *           foreground: { resolved }, background: { resolved } }
 *
 * Errors: unparseable-color, unknown-token.
 */

import type { McpTool } from '../runtime/stdio.js';

import { z } from 'zod';
import { contrastRatio, parseColor } from '../../color.js';
import { composeAxes, flatValueOf, themeAxesSchema } from '../compose.js';
import { mcpError, mcpResult } from '../runtime/errors.js';

const inputSchema = {
	foreground: z
		.string()
		.describe('Foreground color. Hex/rgb/hsl/oklch string OR token reference like \'color.primary\'.'),
	background: z
		.string()
		.describe('Background color. Same format options as foreground.'),
	theme: themeAxesSchema,
};

// WCAG 2.x contrast thresholds.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;
const AAA_NORMAL = 7.0;
const AAA_LARGE = 4.5;

function looksLikeTokenReference(value: string): boolean {
	return /^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/i.test(value);
}

type Resolved = Awaited<ReturnType<typeof composeAxes>>['composed'];

/**
 * Turn one foreground/background arg into a literal color value. A token-shaped
 * string resolves against the already-composed tree (compose once, resolve both
 * sides); anything else is treated as a literal color and passed through.
 */
function resolveToColorValue(
	input: string,
	composed: Resolved,
): { kind: 'color'; value: string } | { kind: 'error'; error: ReturnType<typeof mcpError> } {
	if (!looksLikeTokenReference(input))
		return { kind: 'color', value: input };

	const value = flatValueOf(composed, input);
	if (value === undefined) {
		return {
			kind: 'error',
			error: mcpError({
				component: 'tokens-mcp',
				issue: 'unknown-token',
				token: input,
			}),
		};
	}

	return { kind: 'color', value };
}

export const contrast: McpTool = {
	name: 'contrast',
	description:
		'Compute the WCAG contrast ratio between two colors plus pass/fail for AA/AAA, normal/large. Accepts hex, rgb, hsl, or oklch strings AND named token references like `color.primary`. Useful when validating a color pair before committing it to a theme.',
	inputSchema,
	handler: async (input) => {
		const args = input as {
			foreground: string;
			background: string;
			theme?: { aesthetic?: string; density?: string };
		};

		// Compose once; both sides resolve against the same tree.
		const { composed } = await composeAxes(args.theme);

		const fg = resolveToColorValue(args.foreground, composed);
		if (fg.kind === 'error')
			return fg.error;
		const bg = resolveToColorValue(args.background, composed);
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
