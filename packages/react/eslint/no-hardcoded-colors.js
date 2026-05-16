/**
 * Custom ESLint rule: forbids hardcoded color literals in component source.
 * Forces all color values to come through token CSS variables.
 *
 * Flags:
 *   - Hex: #fff, #ffffff, #ffffffff
 *   - rgb()/rgba()/hsl()/hsla()/oklch()/oklab()
 *   - CSS named colors (limited set — most common ones)
 */

// Full CSS named-color list (Level 4) plus 'transparent' and 'currentcolor'.
// Sourced from https://www.w3.org/TR/css-color-4/#named-colors
const NAMED_COLORS = new Set([
	'aliceblue',
	'antiquewhite',
	'aqua',
	'aquamarine',
	'azure',
	'beige',
	'bisque',
	'black',
	'blanchedalmond',
	'blue',
	'blueviolet',
	'brown',
	'burlywood',
	'cadetblue',
	'chartreuse',
	'chocolate',
	'coral',
	'cornflowerblue',
	'cornsilk',
	'crimson',
	'cyan',
	'darkblue',
	'darkcyan',
	'darkgoldenrod',
	'darkgray',
	'darkgreen',
	'darkgrey',
	'darkkhaki',
	'darkmagenta',
	'darkolivegreen',
	'darkorange',
	'darkorchid',
	'darkred',
	'darksalmon',
	'darkseagreen',
	'darkslateblue',
	'darkslategray',
	'darkslategrey',
	'darkturquoise',
	'darkviolet',
	'deeppink',
	'deepskyblue',
	'dimgray',
	'dimgrey',
	'dodgerblue',
	'firebrick',
	'floralwhite',
	'forestgreen',
	'fuchsia',
	'gainsboro',
	'ghostwhite',
	'gold',
	'goldenrod',
	'gray',
	'green',
	'greenyellow',
	'grey',
	'honeydew',
	'hotpink',
	'indianred',
	'indigo',
	'ivory',
	'khaki',
	'lavender',
	'lavenderblush',
	'lawngreen',
	'lemonchiffon',
	'lightblue',
	'lightcoral',
	'lightcyan',
	'lightgoldenrodyellow',
	'lightgray',
	'lightgreen',
	'lightgrey',
	'lightpink',
	'lightsalmon',
	'lightseagreen',
	'lightskyblue',
	'lightslategray',
	'lightslategrey',
	'lightsteelblue',
	'lightyellow',
	'lime',
	'limegreen',
	'linen',
	'magenta',
	'maroon',
	'mediumaquamarine',
	'mediumblue',
	'mediumorchid',
	'mediumpurple',
	'mediumseagreen',
	'mediumslateblue',
	'mediumspringgreen',
	'mediumturquoise',
	'mediumvioletred',
	'midnightblue',
	'mintcream',
	'mistyrose',
	'moccasin',
	'navajowhite',
	'navy',
	'oldlace',
	'olive',
	'olivedrab',
	'orange',
	'orangered',
	'orchid',
	'palegoldenrod',
	'palegreen',
	'paleturquoise',
	'palevioletred',
	'papayawhip',
	'peachpuff',
	'peru',
	'pink',
	'plum',
	'powderblue',
	'purple',
	'rebeccapurple',
	'red',
	'rosybrown',
	'royalblue',
	'saddlebrown',
	'salmon',
	'sandybrown',
	'seagreen',
	'seashell',
	'sienna',
	'silver',
	'skyblue',
	'slateblue',
	'slategray',
	'slategrey',
	'snow',
	'springgreen',
	'steelblue',
	'tan',
	'teal',
	'thistle',
	'tomato',
	'turquoise',
	'violet',
	'wheat',
	'white',
	'whitesmoke',
	'yellow',
	'yellowgreen',
]);

const COLOR_FN_RE = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color|hwb)\s*\(/i;
const HEX_RE = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;

function hasColorLiteral(value) {
	if (typeof value !== 'string')
		return null;

	if (HEX_RE.test(value))
		return 'hex color literal';
	if (COLOR_FN_RE.test(value))
		return 'color function literal';

	// Word-boundary match against named colors, case-insensitive
	const words = value.toLowerCase().match(/\b[a-z]+\b/g);
	if (words) {
		for (const word of words) {
			if (NAMED_COLORS.has(word))
				return `named color "${word}"`;
		}
	}

	return null;
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Forbid hardcoded color values in component source — use token CSS variables instead',
		},
		schema: [],
		messages: {
			hardcoded: 'Hardcoded color not allowed ({{kind}}). Use a token CSS variable (e.g. var(--color-primary) or a bg-primary Tailwind utility).',
		},
	},
	create(context) {
		return {
			Literal(node) {
				const kind = hasColorLiteral(node.value);
				if (kind) {
					context.report({ node, messageId: 'hardcoded', data: { kind } });
				}
			},
			TemplateElement(node) {
				const kind = hasColorLiteral(node.value?.raw);
				if (kind) {
					context.report({ node, messageId: 'hardcoded', data: { kind } });
				}
			},
		};
	},
};
