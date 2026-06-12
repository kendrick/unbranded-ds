/**
 * Theme loader for the token-query MCP.
 *
 * Reads the bundled theme JSON files from `<package-root>/themes/*.json` at
 * MCP startup. Returns a typed map keyed by theme name. Caches in module
 * scope so subsequent calls are free.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listThemesByAxis, type Axis } from '../axes.js';
import type { ResolvedLayer } from '../resolve.js';

const MCP_DIR = dirname(fileURLToPath(import.meta.url));

// At runtime the file is at `dist/ts/mcp/themes.js` → package root is three
// levels up. During source tests (vitest runs `.ts` from `src/mcp/`), root is
// two levels up. Detect by checking which ancestor contains `themes/`.
function findThemesDir(): string {
	for (const ascent of [2, 3, 4]) {
		const candidate = resolve(MCP_DIR, '../'.repeat(ascent), 'themes');
		if (existsSync(candidate))
			return candidate;
	}
	throw new Error(`Could not locate themes/ directory near ${MCP_DIR}`);
}
const THEMES_DIR = findThemesDir();
// Per-theme resolved-delta artifacts (spec 014), emitted by the build as
// siblings of the CSS. The MCP reads these instead of re-resolving raw DTCG, so
// a bundled theme is resolved by exactly one engine (Style Dictionary).
const DELTA_DIR = join(dirname(THEMES_DIR), 'dist', 'json', 'themes');

export const DEFAULT_THEME = 'light';

export interface DtcgToken {
	$value: string;
	$type: string;
	$description?: string;
}

export type ThemeData = Record<string, unknown>;

interface CachedTheme {
	key: string;
	data: ThemeData;
	axis: Axis;
}

let themesCache: Map<string, CachedTheme> | null = null;

export async function loadThemes(): Promise<Map<string, CachedTheme>> {
	if (themesCache)
		return themesCache;

	// Themes live under themes/<axis>/<name>.json; the directory is the theme's
	// axis (see src/axes.ts). Keyed by name; the axis rides along for the
	// multi-axis MCP input.
	const cache = new Map<string, CachedTheme>();
	const byAxis = listThemesByAxis(THEMES_DIR);
	for (const axis of Object.keys(byAxis) as Axis[]) {
		for (const name of byAxis[axis]) {
			const content = await readFile(
				join(THEMES_DIR, axis, `${name}.json`),
				'utf-8',
			);
			const data = JSON.parse(content) as ThemeData;
			cache.set(name, { key: name, data, axis });
		}
	}
	themesCache = cache;
	return cache;
}

export async function getTheme(name: string): Promise<CachedTheme | null> {
	const themes = await loadThemes();
	return themes.get(name) ?? null;
}

let deltaCache: Map<string, ResolvedLayer> | null = null;

/**
 * Read a theme's resolved-delta artifact (spec 014). The artifact is already the
 * flat resolved shape the resolver folds, so this is the single door from the
 * build's emitted data into a `ResolvedLayer` — the replacement for the old
 * `dtcgToResolved(getTheme())` path, and the boundary where the brand is applied.
 * Returns null for a name with no artifact (an unrecognized theme).
 */
export async function getResolvedDelta(name: string): Promise<ResolvedLayer | null> {
	deltaCache ??= new Map();
	const cached = deltaCache.get(name);
	if (cached)
		return cached;
	try {
		const content = await readFile(join(DELTA_DIR, `${name}.json`), 'utf-8');
		const delta = JSON.parse(content) as ResolvedLayer;
		deltaCache.set(name, delta);
		return delta;
	}
	catch {
		return null;
	}
}

/**
 * Walk a nested theme object by dotted path. Returns the DtcgToken at
 * that path, or undefined if the path doesn't resolve to a token.
 *
 * Example: walkToken(theme, 'color.primary') → { $value, $type }
 */
export function walkToken(theme: ThemeData, path: string): DtcgToken | undefined {
	const parts = path.split('.');
	let current: unknown = theme;
	for (const part of parts) {
		if (typeof current !== 'object' || current === null)
			return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	if (typeof current !== 'object' || current === null)
		return undefined;
	if (!('$value' in current) || !('$type' in current))
		return undefined;
	return current as DtcgToken;
}

/**
 * Walk a nested theme object and return all DtcgToken leaves under the
 * given prefix. Empty prefix returns every token in the theme.
 *
 * Example: walkSubtree(theme, 'color') → tokens at color.background, color.primary, ...
 * Example: walkSubtree(theme, 'color.foreground') → all tokens under color.foreground.*
 */
export function walkSubtree(
	theme: ThemeData,
	prefix: string,
): Array<{ name: string; token: DtcgToken }> {
	const results: Array<{ name: string; token: DtcgToken }> = [];

	const parts = prefix ? prefix.split('.') : [];
	let root: unknown = theme;
	for (const part of parts) {
		if (typeof root !== 'object' || root === null)
			return [];
		root = (root as Record<string, unknown>)[part];
	}
	if (typeof root !== 'object' || root === null)
		return [];

	function recurse(node: unknown, path: string[]): void {
		if (typeof node !== 'object' || node === null)
			return;
		if ('$value' in node && '$type' in node) {
			results.push({ name: path.join('.'), token: node as DtcgToken });
			return;
		}
		for (const [key, value] of Object.entries(node)) {
			recurse(value, [...path, key]);
		}
	}

	const startPath = parts;
	if ('$value' in (root as object) && '$type' in (root as object)) {
		results.push({ name: prefix, token: root as DtcgToken });
	}
	else {
		recurse(root, startPath);
	}

	return results;
}
