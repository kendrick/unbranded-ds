import type { ResolvedLayer } from './resolve.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio, mixOklchToLinear, parseColor } from './color.js';
import { composeTokens } from './resolve.js';
import { validateComposedTheme } from './validate.js';

// Validates every shipped identity-by-scheme cell of the matrix (spec 016) through
// the real validator: completeness AND WCAG AA on every declared contrast pair,
// including the new muted-foreground/background pair (the spec-015 gap). Each cell
// composes the same per-axis deltas the cascade applies — [colorScheme, theme] —
// so the test checks exactly what a page renders. A cell that drifts below AA on
// any pair fails the build here, not ships.
//
// Reads the build's emitted resolved-delta artifacts (spec 014), the single source
// of a bundled theme's values, rather than re-reading the raw DTCG source.

const here = dirname(fileURLToPath(import.meta.url));
const distThemesDir = join(here, '..', 'dist', 'json', 'themes');
function delta(name: string): ResolvedLayer {
	return JSON.parse(readFileSync(join(distThemesDir, `${name}.json`), 'utf8')) as ResolvedLayer;
}

// `light` and `default` are file-less, so their cells compose fewer (or zero)
// deltas — the canonical defaults base already carries them.
const CELLS: Array<{ name: string; layers: ResolvedLayer[] }> = [
	{ name: 'default-light', layers: [] },
	{ name: 'default-dark', layers: [delta('dark')] },
	{ name: 'brand-light', layers: [delta('brand-light')] },
	{ name: 'brand-dark', layers: [delta('dark'), delta('brand-dark')] },
	{ name: 'vaporwave-light', layers: [delta('vaporwave-light')] },
	{ name: 'vaporwave-dark', layers: [delta('dark'), delta('vaporwave-dark')] },
	// LCARS is an expressivity fixture identity (spec-023 spike): built and
	// AA-validated through the same pipeline as the shipped identities, so the
	// invariant a11y contract holds under the wild skin. It is intentionally not in
	// the browser registry — a fixture, not a shipped product theme.
	{ name: 'lcars-light', layers: [delta('lcars-light')] },
	{ name: 'lcars-dark', layers: [delta('dark'), delta('lcars-dark')] },
];

describe('matrix cells are complete and WCAG AA (spec 016 FR-004/FR-005)', () => {
	for (const { name, layers } of CELLS) {
		it(`${name} composes complete and passes AA on every contrast pair`, () => {
			const result = validateComposedTheme(layers, name, name);
			expect(result.ok, result.ok ? '' : JSON.stringify(result.issues, null, 2)).toBe(true);
		});
	}
});

// spec 018: the destructive Button paints `destructive-subtle-foreground` on
// `destructive-subtle`, and on hover deepens the surface via
// `color-mix(in oklab, destructive-subtle, destructive 12%)`. The resting pair is
// already guarded by `contrastPairs` above (the matrix checks it across all cells);
// the validator's token-vs-token pairs cannot express the hover composite, so check
// both explicitly here.
const HOVER_DESTRUCTIVE_WEIGHT = 0.12; // matches the Button variant's color-mix

describe('destructive-subtle pair is AA at rest and on hover in every cell (spec 018 FR-003/FR-005)', () => {
	for (const { name, layers } of CELLS) {
		it(`${name}: destructive text clears 4.5:1 at rest and on the hover surface`, () => {
			const color = composeTokens(layers).color as Record<string, string>;
			const fg = parseColor(color['destructive-subtle-foreground']!);
			const rest = parseColor(color['destructive-subtle']!);
			const hover = mixOklchToLinear(color['destructive-subtle']!, color.destructive!, HOVER_DESTRUCTIVE_WEIGHT);
			expect(fg, 'foreground parses').not.toBeNull();
			expect(rest, 'rest surface parses').not.toBeNull();
			expect(hover, 'hover composite computes').not.toBeNull();
			expect(contrastRatio(fg!, rest!), `${name} rest`).toBeGreaterThanOrEqual(4.5);
			expect(contrastRatio(fg!, hover!), `${name} hover`).toBeGreaterThanOrEqual(4.5);
		});
	}
});
