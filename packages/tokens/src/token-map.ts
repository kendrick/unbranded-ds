import type { Axis } from './axes.js';
import type { ThemeData } from './mcp/themes.js';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AXES, AXIS_ATTRIBUTE } from './axes.js';
import { walkSubtree } from './mcp/themes.js';

export type TokenCategory
	= | 'color'
		| 'spacing'
		| 'typography'
		| 'radii'
		| 'shadows'
		| 'opacity'
		| 'motion'
		| 'ring'
		| 'z-index';

/**
 * Where a token in the map comes from. Schema tokens are the locked canonical
 * set; theme-extension tokens are declared by a bundled theme and tolerated by
 * the schema's passthrough (e.g. vaporwave's `shadow.neon`). Optional on the
 * type so existing object literals and consumer imports keep compiling, but the
 * map always carries a concrete value so callers can switch on it.
 */
export type TokenSource = 'schema' | 'theme-extension';

export interface TokenDefinition {
	name: string;
	// Extension tokens can name a category outside the locked schema set (their
	// top-level DTCG group, e.g. `shadow`), so the field widens past
	// TokenCategory. `(string & {})` keeps autocomplete for the known categories
	// while still accepting any string — additive for existing consumers.
	category: TokenCategory | (string & {});
	type: string;
	cssVariable: string;
	source?: TokenSource;
}

/**
 * The schema half of the map: the locked canonical token set. Hand-authored
 * string literals (the source DTCG files aren't shipped — see defaults.ts).
 * Keys are dot-paths (e.g. "color.primary"). `token-map.test.ts` is the drift
 * guard against the schema; the bundled-theme walk below extends this with
 * theme-extension tokens at module load.
 */
const schemaTokenMap: Record<string, TokenDefinition> = {
	// Color tokens
	'color.background': { name: 'color.background', category: 'color', type: 'color', cssVariable: '--color-background', source: 'schema' },
	'color.foreground': { name: 'color.foreground', category: 'color', type: 'color', cssVariable: '--color-foreground', source: 'schema' },
	'color.primary': { name: 'color.primary', category: 'color', type: 'color', cssVariable: '--color-primary', source: 'schema' },
	'color.primary-foreground': { name: 'color.primary-foreground', category: 'color', type: 'color', cssVariable: '--color-primary-foreground', source: 'schema' },
	'color.muted': { name: 'color.muted', category: 'color', type: 'color', cssVariable: '--color-muted', source: 'schema' },
	'color.muted-foreground': { name: 'color.muted-foreground', category: 'color', type: 'color', cssVariable: '--color-muted-foreground', source: 'schema' },
	'color.border': { name: 'color.border', category: 'color', type: 'color', cssVariable: '--color-border', source: 'schema' },
	'color.ring': { name: 'color.ring', category: 'color', type: 'color', cssVariable: '--color-ring', source: 'schema' },
	'color.destructive': { name: 'color.destructive', category: 'color', type: 'color', cssVariable: '--color-destructive', source: 'schema' },
	'color.destructive-foreground': { name: 'color.destructive-foreground', category: 'color', type: 'color', cssVariable: '--color-destructive-foreground', source: 'schema' },

	// Spacing tokens
	'spacing.px': { name: 'spacing.px', category: 'spacing', type: 'dimension', cssVariable: '--spacing-px', source: 'schema' },
	'spacing.1': { name: 'spacing.1', category: 'spacing', type: 'dimension', cssVariable: '--spacing-1', source: 'schema' },
	'spacing.2': { name: 'spacing.2', category: 'spacing', type: 'dimension', cssVariable: '--spacing-2', source: 'schema' },
	'spacing.3': { name: 'spacing.3', category: 'spacing', type: 'dimension', cssVariable: '--spacing-3', source: 'schema' },
	'spacing.4': { name: 'spacing.4', category: 'spacing', type: 'dimension', cssVariable: '--spacing-4', source: 'schema' },
	'spacing.5': { name: 'spacing.5', category: 'spacing', type: 'dimension', cssVariable: '--spacing-5', source: 'schema' },
	'spacing.6': { name: 'spacing.6', category: 'spacing', type: 'dimension', cssVariable: '--spacing-6', source: 'schema' },
	'spacing.7': { name: 'spacing.7', category: 'spacing', type: 'dimension', cssVariable: '--spacing-7', source: 'schema' },
	'spacing.8': { name: 'spacing.8', category: 'spacing', type: 'dimension', cssVariable: '--spacing-8', source: 'schema' },
	'spacing.9': { name: 'spacing.9', category: 'spacing', type: 'dimension', cssVariable: '--spacing-9', source: 'schema' },
	'spacing.10': { name: 'spacing.10', category: 'spacing', type: 'dimension', cssVariable: '--spacing-10', source: 'schema' },
	'spacing.11': { name: 'spacing.11', category: 'spacing', type: 'dimension', cssVariable: '--spacing-11', source: 'schema' },
	'spacing.12': { name: 'spacing.12', category: 'spacing', type: 'dimension', cssVariable: '--spacing-12', source: 'schema' },
	'spacing.13': { name: 'spacing.13', category: 'spacing', type: 'dimension', cssVariable: '--spacing-13', source: 'schema' },
	'spacing.14': { name: 'spacing.14', category: 'spacing', type: 'dimension', cssVariable: '--spacing-14', source: 'schema' },
	'spacing.15': { name: 'spacing.15', category: 'spacing', type: 'dimension', cssVariable: '--spacing-15', source: 'schema' },
	'spacing.16': { name: 'spacing.16', category: 'spacing', type: 'dimension', cssVariable: '--spacing-16', source: 'schema' },

	// Typography tokens
	'typography.font-sans': { name: 'typography.font-sans', category: 'typography', type: 'fontFamily', cssVariable: '--typography-font-sans', source: 'schema' },
	'typography.font-mono': { name: 'typography.font-mono', category: 'typography', type: 'fontFamily', cssVariable: '--typography-font-mono', source: 'schema' },
	'typography.font-serif': { name: 'typography.font-serif', category: 'typography', type: 'fontFamily', cssVariable: '--typography-font-serif', source: 'schema' },
	'typography.size-sm': { name: 'typography.size-sm', category: 'typography', type: 'dimension', cssVariable: '--typography-size-sm', source: 'schema' },
	'typography.size-base': { name: 'typography.size-base', category: 'typography', type: 'dimension', cssVariable: '--typography-size-base', source: 'schema' },
	'typography.size-lg': { name: 'typography.size-lg', category: 'typography', type: 'dimension', cssVariable: '--typography-size-lg', source: 'schema' },
	'typography.size-xl': { name: 'typography.size-xl', category: 'typography', type: 'dimension', cssVariable: '--typography-size-xl', source: 'schema' },
	'typography.size-2xl': { name: 'typography.size-2xl', category: 'typography', type: 'dimension', cssVariable: '--typography-size-2xl', source: 'schema' },
	'typography.size-3xl': { name: 'typography.size-3xl', category: 'typography', type: 'dimension', cssVariable: '--typography-size-3xl', source: 'schema' },
	'typography.weight-normal': { name: 'typography.weight-normal', category: 'typography', type: 'fontWeight', cssVariable: '--typography-weight-normal', source: 'schema' },
	'typography.weight-medium': { name: 'typography.weight-medium', category: 'typography', type: 'fontWeight', cssVariable: '--typography-weight-medium', source: 'schema' },
	'typography.weight-semibold': { name: 'typography.weight-semibold', category: 'typography', type: 'fontWeight', cssVariable: '--typography-weight-semibold', source: 'schema' },
	'typography.weight-bold': { name: 'typography.weight-bold', category: 'typography', type: 'fontWeight', cssVariable: '--typography-weight-bold', source: 'schema' },
	'typography.leading-normal': { name: 'typography.leading-normal', category: 'typography', type: 'number', cssVariable: '--typography-leading-normal', source: 'schema' },
	'typography.leading-tight': { name: 'typography.leading-tight', category: 'typography', type: 'number', cssVariable: '--typography-leading-tight', source: 'schema' },
	'typography.leading-relaxed': { name: 'typography.leading-relaxed', category: 'typography', type: 'number', cssVariable: '--typography-leading-relaxed', source: 'schema' },

	// Radii tokens
	'radius.sm': { name: 'radius.sm', category: 'radii', type: 'dimension', cssVariable: '--radius-sm', source: 'schema' },
	'radius.md': { name: 'radius.md', category: 'radii', type: 'dimension', cssVariable: '--radius-md', source: 'schema' },
	'radius.lg': { name: 'radius.lg', category: 'radii', type: 'dimension', cssVariable: '--radius-lg', source: 'schema' },
	'radius.full': { name: 'radius.full', category: 'radii', type: 'dimension', cssVariable: '--radius-full', source: 'schema' },

	// Shadow tokens
	'shadow.sm': { name: 'shadow.sm', category: 'shadows', type: 'shadow', cssVariable: '--shadow-sm', source: 'schema' },
	'shadow.md': { name: 'shadow.md', category: 'shadows', type: 'shadow', cssVariable: '--shadow-md', source: 'schema' },
	'shadow.lg': { name: 'shadow.lg', category: 'shadows', type: 'shadow', cssVariable: '--shadow-lg', source: 'schema' },

	// Opacity tokens
	'opacity.disabled': { name: 'opacity.disabled', category: 'opacity', type: 'number', cssVariable: '--opacity-disabled', source: 'schema' },
	'opacity.hover': { name: 'opacity.hover', category: 'opacity', type: 'number', cssVariable: '--opacity-hover', source: 'schema' },

	// Motion tokens — DTCG source stays nested (motion.duration.fast), but the
	// emitted var name flattens to the Tailwind-aligned --duration-*/--ease-* so
	// easings drive real ease-* utilities. Keep these cssVariables in lockstep
	// with tokenToCssVar in sd.config.ts.
	'motion.duration.fast': { name: 'motion.duration.fast', category: 'motion', type: 'duration', cssVariable: '--duration-fast', source: 'schema' },
	'motion.duration.base': { name: 'motion.duration.base', category: 'motion', type: 'duration', cssVariable: '--duration-base', source: 'schema' },
	'motion.duration.slow': { name: 'motion.duration.slow', category: 'motion', type: 'duration', cssVariable: '--duration-slow', source: 'schema' },
	'motion.easing.standard': { name: 'motion.easing.standard', category: 'motion', type: 'cubicBezier', cssVariable: '--ease-standard', source: 'schema' },
	'motion.easing.decelerate': { name: 'motion.easing.decelerate', category: 'motion', type: 'cubicBezier', cssVariable: '--ease-decelerate', source: 'schema' },
	'motion.easing.accelerate': { name: 'motion.easing.accelerate', category: 'motion', type: 'cubicBezier', cssVariable: '--ease-accelerate', source: 'schema' },

	// Ring tokens (optional category)
	'ring.width': { name: 'ring.width', category: 'ring', type: 'dimension', cssVariable: '--ring-width', source: 'schema' },

	// Z-index tokens (optional category) — ordered tooltip > popover > overlay
	'z-index.overlay': { name: 'z-index.overlay', category: 'z-index', type: 'number', cssVariable: '--z-index-overlay', source: 'schema' },
	'z-index.popover': { name: 'z-index.popover', category: 'z-index', type: 'number', cssVariable: '--z-index-popover', source: 'schema' },
	'z-index.tooltip': { name: 'z-index.tooltip', category: 'z-index', type: 'number', cssVariable: '--z-index-tooltip', source: 'schema' },
};

// ---------------------------------------------------------------------------
// Theme-extension discovery
//
// The exported map is the union of the schema set above and every token a
// bundled theme declares that the schema doesn't. We walk the shipped theme
// JSONs at module load rather than generate a literal, because only `themes/`
// (not the `src/tokens/**` DTCG sources) ships in the package — so the walk
// works identically in the published dist and in source tests. `walkSubtree`
// is the same leaf-walker the MCP uses; reusing it keeps the two surfaces from
// disagreeing about what counts as a token.
// ---------------------------------------------------------------------------

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Locate the shipped `themes/` directory. At runtime this module is at
 * `dist/ts/token-map.js` (themes/ is 2 up); under vitest it's `src/token-map.ts`
 * (1 up). Probe a few ancestors and take the first that exists — the same
 * tactic mcp/themes.ts uses, kept independent so neither has to know the other's
 * depth.
 */
function findThemesDir(): string {
	for (const ascent of [1, 2, 3]) {
		const candidate = resolve(MODULE_DIR, '../'.repeat(ascent), 'themes');
		if (existsSync(candidate))
			return candidate;
	}
	throw new Error(`Could not locate themes/ directory near ${MODULE_DIR}`);
}

/**
 * Reproduce the build's motion-aware kebab naming (sd.config.ts flattenedName +
 * tokenToCssVar) so a token's cssVariable here matches the emitted CSS var
 * exactly. Motion is the one nested-to-flat case: motion.duration.X →
 * --duration-X, motion.easing.X → --ease-X. Everything else is the kebab'd
 * dot-path. This must stay in lockstep with sd.config.ts.
 */
function cssVariableForPath(dotPath: string): string {
	const segments = dotPath.split('.');
	if (segments[0] === 'motion') {
		const [, group, key] = segments;
		if (group === 'duration' && key)
			return `--duration-${key}`;
		if (group === 'easing' && key)
			return `--ease-${key}`;
	}
	const kebab = segments
		.map((s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase())
		.join('-');
	return `--${kebab}`;
}

// Every theme file under an axis. Color-scheme and density nest one level
// (themes/<dir>/<name>.json); the theme axis nests by identity then scheme
// (themes/theme/<identity>/<scheme>.json), so its files live one level deeper
// (spec 016). The directory is the axis attribute without the `data-` prefix.
function themeFiles(themesDir: string, axis: Axis): string[] {
	const axisDir = join(themesDir, AXIS_ATTRIBUTE[axis].replace(/^data-/, ''));
	const jsonIn = (dir: string): string[] => {
		try {
			return readdirSync(dir)
				.filter((f) => f.endsWith('.json'))
				.map((f) => join(dir, f));
		}
		catch {
			return [];
		}
	};
	if (axis !== 'theme')
		return jsonIn(axisDir);
	try {
		return readdirSync(axisDir, { withFileTypes: true })
			.filter((e) => e.isDirectory())
			.flatMap((e) => jsonIn(join(axisDir, e.name)));
	}
	catch {
		return [];
	}
}

function readTheme(path: string): ThemeData {
	return JSON.parse(readFileSync(path, 'utf8')) as ThemeData;
}

/**
 * Build the union: schema entries (unchanged) plus a theme-extension entry for
 * every bundled-theme leaf whose dot-path is not in the schema. Dedupe by
 * dot-path across all themes (first walk wins).
 */
function buildTokenMap(): Record<string, TokenDefinition> {
	const map: Record<string, TokenDefinition> = { ...schemaTokenMap };

	const themesDir = findThemesDir();
	for (const axis of AXES) {
		for (const path of themeFiles(themesDir, axis)) {
			const data = readTheme(path);
			for (const { name: dotPath, token } of walkSubtree(data, '')) {
				// Schema tokens already typed; theme overrides of schema tokens stay
				// schema. Only genuinely new dot-paths become extensions.
				if (map[dotPath])
					continue;
				const category = dotPath.split('.')[0] ?? 'unknown';
				map[dotPath] = {
					name: dotPath,
					category,
					type: token.$type,
					cssVariable: cssVariableForPath(dotPath),
					source: 'theme-extension',
				};
			}
		}
	}

	return map;
}

/**
 * Typed map of every token consumers can rely on: the locked schema set plus the
 * extension tokens declared by bundled themes. Keys are dot-paths
 * (e.g. "color.primary", "shadow.neon"); `source` tells the two apart.
 */
export const tokenMap: Record<string, TokenDefinition> = buildTokenMap();
