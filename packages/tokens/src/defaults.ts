import type { Theme } from './schema.js';

// ---------------------------------------------------------------------------
// Canonical default token values: the inheritance baseline for partial themes.
//
// A consumer runtime theme may override any subset of categories/keys (spec 008
// US2). The validator merges the partial override onto THIS set, then validates
// the complete merged result. Every omitted token inherits the value here.
//
// WHY a hand-resolved TS module instead of importing the JSON sources:
//   The package ships only `dist` + `themes` (see package.json "files"); the
//   DTCG sources under `src/tokens/*.json` are NOT published, and the `tsc`
//   build does not copy them into `dist`. A `.ts` module that imported the JSON
//   would emit a bare `import './tokens/typography.json'` into
//   `dist/ts/defaults.js` that resolves to nothing in the published package.
//   Resolving the values to string literals here keeps the module self-contained
//   and shippable. `defaults.test.ts` is the drift guard: it reads the JSON
//   sources + themes/light.json and asserts they still match these literals, so
//   this file can't silently rot when a source value changes.
//
// VALUE SOURCES:
//   - Structural categories (spacing, typography, radius, shadow, opacity) are
//     theme-independent; their `$value`s come straight from `src/tokens/*.json`.
//   - `color` defaults come from `themes/light.json`. Light is the base/default
//     theme; a partial theme that omits a color inherits the light value. (Note:
//     today light.json's colors equal src/tokens/color.json's, but light is the
//     intentional source. See defaults.test.ts.)
//   - `motion`, `ring`, `z-index` are hardcoded from contracts/token-schema.md
//     because their DTCG source files (motion.json, ring.json, z-index.json) are
//     authored by a parallel worker (tasks T003/T013/T014) and may not exist yet.
//     THESE MUST STAY IN SYNC with those source files once they land; the drift
//     guard extends to cover them when the sources exist.
// ---------------------------------------------------------------------------

type ResolvedTokens = Theme['tokens'];

export const canonicalDefaultTokens: ResolvedTokens = {
	// from themes/light.json (the default theme)
	'color': {
		'background': 'oklch(1.0000 0.0000 89.88)',
		'foreground': 'oklch(0.1408 0.0044 285.82)',
		'primary': 'oklch(0.2103 0.0059 285.89)',
		'primary-foreground': 'oklch(0.9851 0.0000 89.88)',
		'muted': 'oklch(0.9674 0.0013 286.38)',
		'muted-foreground': 'oklch(0.5434 0.0138 285.94)',
		'border': 'oklch(0.9197 0.0040 286.32)',
		'ring': 'oklch(0.2103 0.0059 285.89)',
		'destructive': 'oklch(0.5803 0.2078 25.33)',
		'destructive-foreground': 'oklch(0.9851 0.0000 89.88)',
	},
	// from src/tokens/spacing.json
	'spacing': {
		px: '1px',
		1: '0.25rem',
		2: '0.5rem',
		3: '0.75rem',
		4: '1rem',
		5: '1.25rem',
		6: '1.5rem',
		7: '1.75rem',
		8: '2rem',
		9: '2.25rem',
		10: '2.5rem',
		11: '2.75rem',
		12: '3rem',
		13: '3.25rem',
		14: '3.5rem',
		15: '3.75rem',
		16: '4rem',
	},
	// from src/tokens/typography.json (font-serif, size-2xl, size-3xl per contract)
	'typography': {
		'font-sans':
			'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
		'font-mono':
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
		'size-sm': '0.875rem',
		'size-base': '1rem',
		'size-lg': '1.125rem',
		'size-xl': '1.25rem',
		'size-2xl': '1.5rem',
		'size-3xl': '1.875rem',
		'weight-normal': '400',
		'weight-medium': '500',
		'weight-semibold': '600',
		'weight-bold': '700',
		'leading-normal': '1.5',
		'leading-tight': '1.25',
		'leading-relaxed': '1.625',
	},
	// from src/tokens/radii.json
	'radius': {
		sm: '0.25rem',
		md: '0.375rem',
		lg: '0.5rem',
		full: '9999px',
	},
	// from src/tokens/shadows.json
	'shadow': {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
	},
	// from src/tokens/opacity.json
	'opacity': {
		disabled: '0.5',
		hover: '0.8',
	},
	// Flattened to two-level (see schema.ts motionTokens). Hardcoded from
	// contracts/token-schema.md (durations 120/240/480ms; the three platform
	// cubic-beziers). MUST match src/tokens/motion.json's $values once it lands.
	'motion': {
		'duration-fast': '120ms',
		'duration-base': '240ms',
		'duration-slow': '480ms',
		'easing-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
		'easing-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
		'easing-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
	},
	// optional categories, included so an omitting theme still inherits them.
	// hardcoded from contracts/token-schema.md; MUST match src/tokens/ring.json
	// and src/tokens/z-index.json once they land. z-index is ordered so tooltip
	// stacks above popover above overlay (the latent z-50 bug fix).
	'ring': {
		width: '3px',
	},
	'z-index': {
		overlay: '50',
		popover: '55',
		tooltip: '60',
	},
};
