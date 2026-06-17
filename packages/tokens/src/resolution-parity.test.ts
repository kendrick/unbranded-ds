import type { ResolvedLayer } from './resolve.js';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { composeAxes, flatValueOf } from './mcp/compose.js';
import { getResolvedDelta, loadThemes } from './mcp/themes.js';
import { tokenMap } from './token-map.js';
import { validateComposedTheme } from './validate.js';

// ---------------------------------------------------------------------------
// Parity canary (spec 014, reduced from the 009 matrix).
//
// 009 ran a full (combination × token) oracle because a bundled theme was
// resolved by TWO engines and could silently diverge — it caught a real
// accessibility regression on its first run. 014 collapses that: Style
// Dictionary is the single resolver, the MCP reads its emitted delta artifacts,
// and the defaults are generated from its resolved base. The (artifact == MCP)
// arm is now true BY CONSTRUCTION — composeAxes IS composeTokens over the
// artifacts — so the full matrix proves nothing the structure doesn't already
// guarantee, and it retires.
//
// What remains worth guarding is the WIRING: that the value the MCP returns
// still equals the value the emitted CSS carries, for one real composition. A
// failure there means a consumer read stale data, or a transform diverged
// between the JSON and the CSS path. That is the canary. The CSS comparison is
// SEMANTIC (normalize) because the CSS applies display transforms (ms→s, oklch
// formatting) the raw resolved data deliberately does not.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const cssDir = resolve(here, '..', 'dist', 'css');

function normalize(value: string): string {
	return value
		.toLowerCase()
		.replace(/(\d+(?:\.\d+)?)ms\b/g, (_, n) => `${Number.parseFloat(n) / 1000}s`)
		.replace(/-?\d+(?:\.\d+)?/g, (n) => String(Number.parseFloat(n)))
		.replace(/\s+/g, ' ')
		.trim();
}

function parseCssVars(themeName: string): Map<string, string> {
	const css = readFileSync(join(cssDir, `tokens-${themeName}.css`), 'utf8');
	const out = new Map<string, string>();
	for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g))
		out.set(m[1]!, m[2]!.trim());
	return out;
}

beforeAll(async () => {
	await loadThemes();
});

describe('resolution parity canary (MCP == emitted CSS)', () => {
	it('vaporwave + compact: the MCP value matches the emitted CSS for a sample', async () => {
		const { composed } = await composeAxes({ theme: 'vaporwave', colorScheme: 'dark', density: 'compact' });
		const aestheticVars = parseCssVars('vaporwave-dark');
		const densityVars = parseCssVars('compact');

		// a sample across the surfaces: an aesthetic color, the density-won spacing,
		// the extension token, and an inherited base token.
		for (const dotPath of ['color.primary', 'spacing.4', 'shadow.neon', 'radius.md']) {
			const def = tokenMap[dotPath];
			if (!def)
				continue;
			const mcpValue = flatValueOf(composed, dotPath);
			expect(mcpValue, `${dotPath} resolved by the MCP`).toBeDefined();
			// the cascade: density layer wins, else the aesthetic (full) layer
			const cssValue = densityVars.get(def.cssVariable) ?? aestheticVars.get(def.cssVariable);
			expect(cssValue, `${dotPath} present in CSS`).toBeDefined();
			expect(normalize(cssValue!), `${dotPath}: MCP vs CSS`).toBe(normalize(mcpValue!));
		}
	});

	it('density wins the spacing.4 collision', async () => {
		const { composed } = await composeAxes({ theme: 'vaporwave', colorScheme: 'dark', density: 'compact' });
		expect(flatValueOf(composed, 'spacing.4')).toBe('0.8rem'); // compact, not the 1rem base
	});
});

describe('demo themes are valid and AA (FR-013/SC-005)', () => {
	it('vaporwave + compact compose and stay AA', async () => {
		const layers = [
			await getResolvedDelta('vaporwave-dark'),
			await getResolvedDelta('compact'),
		].filter((l): l is ResolvedLayer => l !== null);
		const result = validateComposedTheme(layers);
		expect(result.ok, JSON.stringify(result)).toBe(true);
	});

	it('exposes shadow.neon as a theme-extension token', () => {
		expect(tokenMap['shadow.neon']).toMatchObject({
			category: 'shadow',
			cssVariable: '--shadow-neon',
			source: 'theme-extension',
		});
	});
});

describe('single resolution engine (SC-001)', () => {
	it('exports no DTCG-to-flat bridge — bundled themes resolve once, in the build', async () => {
		// dtcgToResolved was the 009 second path. After 014 the MCP reads the
		// build's emitted artifacts, so the bridge is gone; this records that the
		// absence is intentional, not an oversight, and fails if it is reintroduced.
		const tokens = await import('./index.js');
		expect('dtcgToResolved' in tokens).toBe(false);
	});
});
