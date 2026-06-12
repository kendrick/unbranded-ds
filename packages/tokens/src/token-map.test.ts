import type { ThemeData } from './mcp/themes';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AXES } from './axes';
import { walkSubtree } from './mcp/themes';
import { tokenMap } from './token-map';

// ---------------------------------------------------------------------------
// Drift guard for the exported token map (spec 009, FR-008).
//
// The map is the union of the locked schema set and the extension tokens that
// bundled themes declare. This test reads the actual theme JSONs and asserts
// the map computed at module load still covers them, so the map can't drift
// from the shipped themes — and pins the load-bearing vaporwave `shadow.neon`
// extension contract (its category + cssVariable feed the MCP and CSS).
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDir = resolve(__dirname, '..', 'themes');

/** Every leaf dot-path declared across all bundled themes (deduped). */
function bundledThemePaths(): Set<string> {
	const paths = new Set<string>();
	for (const axis of AXES) {
		let files: string[];
		try {
			files = readdirSync(join(themesDir, axis)).filter((f) => f.endsWith('.json'));
		}
		catch {
			continue;
		}
		for (const file of files) {
			const data = JSON.parse(
				readFileSync(join(themesDir, axis, file), 'utf8'),
			) as ThemeData;
			for (const { name } of walkSubtree(data, '')) paths.add(name);
		}
	}
	return paths;
}

describe('tokenMap source discriminator', () => {
	it('tags every entry with a concrete source', () => {
		for (const def of Object.values(tokenMap)) {
			expect(def.source === 'schema' || def.source === 'theme-extension').toBe(true);
		}
	});

	it('every schema entry carries source: "schema"', () => {
		// A representative slice across categories, including the motion nesting and
		// the optional ring/z-index categories. If the schema set ever loses one of
		// these, the map silently dropping it should fail here.
		const schemaPaths = [
			'color.primary',
			'color.destructive-foreground',
			'spacing.px',
			'spacing.16',
			'typography.font-sans',
			'typography.leading-relaxed',
			'radius.full',
			'shadow.lg',
			'opacity.disabled',
			'motion.duration.fast',
			'motion.easing.standard',
			'ring.width',
			'z-index.tooltip',
		];
		for (const path of schemaPaths) {
			expect(tokenMap[path], `${path} missing from tokenMap`).toBeDefined();
			expect(tokenMap[path]?.source).toBe('schema');
		}
	});

	it('carries the vaporwave shadow.neon extension with the right shape', () => {
		const neon = tokenMap['shadow.neon'];
		expect(neon).toBeDefined();
		expect(neon?.source).toBe('theme-extension');
		expect(neon?.category).toBe('shadow');
		expect(neon?.cssVariable).toBe('--shadow-neon');
		expect(neon?.name).toBe('shadow.neon');
	});

	it('covers every bundled-theme token (no theme leaf is missing from the map)', () => {
		for (const path of bundledThemePaths()) {
			expect(tokenMap[path], `${path} declared by a theme but absent from tokenMap`).toBeDefined();
		}
	});

	it('classifies each bundled-theme token: schema if in the canonical set, else theme-extension', () => {
		// shadow.neon is the only token declared by a bundled theme that the schema
		// doesn't have; everything else a theme touches is a schema override.
		for (const path of bundledThemePaths()) {
			const expected = path === 'shadow.neon' ? 'theme-extension' : 'schema';
			expect(tokenMap[path]?.source, path).toBe(expected);
		}
	});

	it('has no duplicate dot-paths and uses the dot-path as each entry name', () => {
		for (const [key, def] of Object.entries(tokenMap)) {
			expect(def.name).toBe(key);
		}
	});
});
